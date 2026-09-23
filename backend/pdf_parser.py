"""
PDF text extraction using pdfplumber.
"""

from __future__ import annotations

import io

import pdfplumber


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract all text from a PDF file.

    Args:
        pdf_bytes: Raw bytes of the PDF file.

    Returns:
        Extracted text as a single string with pages separated by newlines.

    Raises:
        ValueError: If the PDF cannot be read or contains no extractable text.
    """
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            pages_text = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text)

            if not pages_text:
                raise ValueError(
                    "No text could be extracted from this PDF. "
                    "The file may be image-based (scanned). "
                    "Try pasting the notice text directly instead."
                )

            return "\n\n".join(pages_text)

    except pdfplumber.pdfminer.pdfparser.PDFSyntaxError:
        raise ValueError(
            "This file does not appear to be a valid PDF. "
            "Please check the file and try again."
        )
    except Exception as e:
        if "No text could be extracted" in str(e):
            raise
        raise ValueError(f"Error reading PDF: {str(e)}")
