"""
Claude API-based extractor for SNAP notice fields.
Sends notice text to Claude and returns structured JSON.
"""

from __future__ import annotations

import json
import os
from typing import Any

import anthropic

SYSTEM_PROMPT = """You are a SNAP notice parser. Extract the following fields from the notice text and return ONLY valid JSON, no explanation:
{
  "recipient_name": string | null,
  "notice_date": string | null,
  "action_type": "reduction" | "termination" | "denial" | "other" | null,
  "effective_date": string | null,
  "reason_stated": string | null,
  "benefit_amount_old": number | null,
  "benefit_amount_new": number | null,
  "household_size": number | null,
  "income_listed": number | null,
  "appeal_deadline": string | null,
  "appeal_instructions_present": boolean,
  "hearing_request_method_stated": boolean,
  "language_assistance_offered": boolean,
  "raw_text_snippet": string
}

Rules:
- For dates, use YYYY-MM-DD format when possible
- For dollar amounts, return numbers only (no $ sign)
- "raw_text_snippet" should be the first 300 characters of the notice
- If a field cannot be determined from the text, use null
- For boolean fields, use false if the information is not clearly present
- Return ONLY the JSON object, nothing else"""


async def extract_fields(notice_text: str) -> dict[str, Any]:
    """
    Send notice text to Claude API and return extracted fields.

    Requires ANTHROPIC_API_KEY environment variable.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError(
            "ANTHROPIC_API_KEY environment variable is required. "
            "Set it before running the server."
        )

    client = anthropic.AsyncAnthropic(api_key=api_key)

    message = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Extract fields from this SNAP notice:\n\n{notice_text}",
            }
        ],
    )

    # Parse the response text as JSON
    response_text = message.content[0].text.strip()

    # Handle potential markdown code blocks in response
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        # Remove first and last lines (``` markers)
        response_text = "\n".join(lines[1:-1])

    try:
        fields = json.loads(response_text)
    except json.JSONDecodeError as e:
        # Don't echo the response: main.py logs this message and it holds notice PII.
        raise ValueError(f"Claude returned invalid JSON: {e}")

    # Ensure raw_text_snippet is present
    if "raw_text_snippet" not in fields or not fields["raw_text_snippet"]:
        fields["raw_text_snippet"] = notice_text[:300]

    return fields


def extract_fields_from_mock(notice_text: str) -> dict[str, Any]:
    """
    Fallback extractor that does basic keyword matching.
    Used when ANTHROPIC_API_KEY is not set (development/testing).
    """
    text_lower = notice_text.lower()

    return {
        "recipient_name": None,
        "notice_date": None,
        "action_type": _guess_action_type(text_lower),
        "effective_date": None,
        "reason_stated": _extract_if_present(text_lower, ["reason:", "because", "due to"]),
        "benefit_amount_old": None,
        "benefit_amount_new": None,
        "household_size": None,
        "income_listed": None,
        "appeal_deadline": None,
        "appeal_instructions_present": any(
            kw in text_lower for kw in ["appeal", "fair hearing", "right to request"]
        ),
        "hearing_request_method_stated": any(
            kw in text_lower for kw in ["request a hearing", "write to", "call", "contact"]
        ),
        "language_assistance_offered": any(
            kw in text_lower
            for kw in ["language assistance", "español", "other languages", "interpreter"]
        ),
        "raw_text_snippet": notice_text[:300],
    }


def _guess_action_type(text: str) -> str | None:
    if "terminat" in text:
        return "termination"
    if "reduc" in text:
        return "reduction"
    if "deni" in text:
        return "denial"
    return "other"


def _extract_if_present(text: str, keywords: list[str]) -> str | None:
    for kw in keywords:
        idx = text.find(kw)
        if idx != -1:
            # Return ~100 chars after the keyword
            return text[idx : idx + 100].strip()
    return None
