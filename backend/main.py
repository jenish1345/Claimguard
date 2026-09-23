"""
SNAP Notice Checker — FastAPI Backend
======================================
Accepts notice text (or PDF), extracts fields via Claude API,
runs deterministic rule checks, and returns results.

No PII is stored or logged.
"""

from __future__ import annotations

import base64
import logging
import os
from typing import Any

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rule_engine import run_all_rules, summarize_results
from extractor import extract_fields, extract_fields_from_mock
from pdf_parser import extract_text_from_pdf

# ---------------------------------------------------------------------------
# Logging — never log notice text or PII
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("snap-checker")

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="SNAP Notice Checker API",
    description="Checks SNAP benefit notices for defects under federal law (7 CFR 273.13)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request/Response models
# ---------------------------------------------------------------------------

class AnalyzeRequest(BaseModel):
    text: str
    source: str = "paste"  # "pdf" | "paste"


class AnalyzeResponse(BaseModel):
    extracted_fields: dict[str, Any]
    rule_results: list[dict[str, Any]]
    defect_count: int
    critical_count: int
    verdict: str  # "defects_found" | "clean" | "extraction_error"


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "snap-notice-checker"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_notice(request: AnalyzeRequest):
    """
    Analyze a SNAP notice for defects.

    Accepts plain text of a notice. Extracts fields using Claude API,
    then runs deterministic rule checks against 7 CFR 273.13.
    """
    if not request.text or len(request.text.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Notice text is too short. Please provide the full notice text.",
        )

    logger.info("Analyzing notice (source=%s, length=%d)", request.source, len(request.text))

    # Step 1: Extract fields
    try:
        if os.environ.get("ANTHROPIC_API_KEY"):
            extracted = await extract_fields(request.text)
        else:
            logger.warning("ANTHROPIC_API_KEY not set — using mock extractor")
            extracted = extract_fields_from_mock(request.text)
    except Exception as e:
        logger.error("Extraction failed: %s", str(e))
        return AnalyzeResponse(
            extracted_fields={"error": str(e), "raw_text_snippet": request.text[:300]},
            rule_results=[],
            defect_count=0,
            critical_count=0,
            verdict="extraction_error",
        )

    # Step 2: Run rule engine
    rule_results = run_all_rules(extracted)
    summary = summarize_results(rule_results)

    logger.info(
        "Analysis complete: %d defects (%d critical)",
        summary["defect_count"],
        summary["critical_count"],
    )

    return AnalyzeResponse(
        extracted_fields=extracted,
        rule_results=rule_results,
        **summary,
    )


@app.post("/analyze/pdf", response_model=AnalyzeResponse)
async def analyze_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF notice for analysis.

    Extracts text from the PDF, then runs the same analysis pipeline.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file.",
        )

    # Read and extract text
    try:
        pdf_bytes = await file.read()
        notice_text = extract_text_from_pdf(pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("PDF processing failed: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing the PDF. Please try pasting the text instead.",
        )

    # Delegate to the text analysis endpoint
    request = AnalyzeRequest(text=notice_text, source="pdf")
    return await analyze_notice(request)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
