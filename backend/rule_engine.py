"""
SNAP Notice Rule Engine
========================
Deterministic checks against 7 CFR 273.13 and related regulations.
No LLM — pure logic. Each rule returns a structured result dict.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Optional


def _parse_date(date_str: Optional[str]) -> Optional[datetime]:
    """Try several common date formats to parse a date string."""
    if not date_str:
        return None
    formats = [
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%m-%d-%Y",
        "%B %d, %Y",
        "%b %d, %Y",
        "%m/%d/%y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except (ValueError, TypeError):
            continue
    return None


def _make_result(
    rule_id: str,
    citation: str,
    description: str,
    passed: bool,
    severity: str = "critical",
    defect_message: Optional[str] = None,
    action_hint: Optional[str] = None,
) -> dict[str, Any]:
    return {
        "rule_id": rule_id,
        "citation": citation,
        "description": description,
        "passed": passed,
        "severity": severity,
        "defect_message": defect_message if not passed else None,
        "action_hint": action_hint if not passed else None,
    }


# ---------------------------------------------------------------------------
# Individual rule checks
# ---------------------------------------------------------------------------

def check_notice_date(fields: dict[str, Any]) -> dict[str, Any]:
    """CFR-273.13-A1: Notice date must be present."""
    present = bool(fields.get("notice_date"))
    return _make_result(
        rule_id="CFR-273.13-A1",
        citation="7 CFR 273.13(a)(1)",
        description="The notice includes the date it was issued.",
        passed=present,
        severity="critical",
        defect_message="This notice is missing the date it was issued. Federal law requires every SNAP notice to include the date.",
        action_hint="You may cite this missing date as a defect in a fair hearing request.",
    )


def check_effective_date(fields: dict[str, Any]) -> dict[str, Any]:
    """CFR-273.13-A2: Effective date of action must be stated."""
    present = bool(fields.get("effective_date"))
    return _make_result(
        rule_id="CFR-273.13-A2",
        citation="7 CFR 273.13(a)(2)",
        description="The notice states the effective date of the action.",
        passed=present,
        severity="critical",
        defect_message="This notice does not state when the action takes effect. Federal law requires an effective date.",
        action_hint="Without an effective date, the notice may be considered legally deficient. Note this in your hearing request.",
    )


def check_reason_stated(fields: dict[str, Any]) -> dict[str, Any]:
    """CFR-273.13-A3: Reason for action must be stated."""
    present = bool(fields.get("reason_stated"))
    return _make_result(
        rule_id="CFR-273.13-A3",
        citation="7 CFR 273.13(a)(3)",
        description="The notice explains why this action is being taken.",
        passed=present,
        severity="critical",
        defect_message="This notice does not explain the reason for the action. Federal law requires the agency to state why benefits are being changed.",
        action_hint="A missing reason is a significant defect. Consider requesting a fair hearing.",
    )


def check_benefit_amounts(fields: dict[str, Any]) -> dict[str, Any]:
    """CFR-273.13-A4: Old and new benefit amounts must both be stated for reductions."""
    action_type = fields.get("action_type")

    # Only applies to reductions
    if action_type != "reduction":
        return _make_result(
            rule_id="CFR-273.13-A4",
            citation="7 CFR 273.13(a)(4)",
            description="Benefit amounts before and after are both stated (applies to reductions).",
            passed=True,
            severity="critical",
        )

    old_amt = fields.get("benefit_amount_old")
    new_amt = fields.get("benefit_amount_new")
    both_present = old_amt is not None and new_amt is not None

    return _make_result(
        rule_id="CFR-273.13-A4",
        citation="7 CFR 273.13(a)(4)",
        description="Benefit amounts before and after are both stated (applies to reductions).",
        passed=both_present,
        severity="critical",
        defect_message="This notice reduces your benefits but does not clearly state both the old and new amounts. Federal law requires both figures.",
        action_hint="Without clear benefit amounts, you cannot verify the change is correct. Note this defect in your hearing request.",
    )


def check_right_to_appeal(fields: dict[str, Any]) -> dict[str, Any]:
    """CFR-273.13-A5: Right to appeal must be stated."""
    present = fields.get("appeal_instructions_present", False)
    return _make_result(
        rule_id="CFR-273.13-A5",
        citation="7 CFR 273.13(a)(5)",
        description="The notice informs you of your right to appeal.",
        passed=bool(present),
        severity="critical",
        defect_message="This notice does not mention your right to appeal. Federal law requires every adverse action notice to include appeal rights.",
        action_hint="A missing appeal notice is a serious defect. You still have the right to appeal — contact your local legal aid office.",
    )


def check_appeal_deadline(fields: dict[str, Any]) -> dict[str, Any]:
    """CFR-273.13-A6: Appeal deadline must be stated."""
    present = bool(fields.get("appeal_deadline"))
    return _make_result(
        rule_id="CFR-273.13-A6",
        citation="7 CFR 273.13(a)(6)",
        description="The notice states the deadline to request an appeal.",
        passed=present,
        severity="critical",
        defect_message="This notice does not state the deadline to file an appeal. Federal law requires the appeal deadline to be clearly communicated.",
        action_hint="Even without a stated deadline, you likely have 90 days to request a fair hearing. Act quickly and contact legal aid.",
    )


def check_hearing_method(fields: dict[str, Any]) -> dict[str, Any]:
    """CFR-273.13-A7: Method to request hearing must be stated."""
    present = fields.get("hearing_request_method_stated", False)
    return _make_result(
        rule_id="CFR-273.13-A7",
        citation="7 CFR 273.13(a)(7)",
        description="The notice explains how to request a fair hearing.",
        passed=bool(present),
        severity="warning",
        defect_message="This notice does not explain how to request a fair hearing. Federal law requires clear instructions for requesting a hearing.",
        action_hint="You can typically request a hearing by writing to your state SNAP agency. Contact legal aid for your state's specific process.",
    )


def check_language_assistance(fields: dict[str, Any]) -> dict[str, Any]:
    """CFR-273.13-B1: Language assistance notice must be present."""
    present = fields.get("language_assistance_offered", False)
    return _make_result(
        rule_id="CFR-273.13-B1",
        citation="7 CFR 273.13(b)",
        description="The notice offers language assistance for non-English speakers.",
        passed=bool(present),
        severity="warning",
        defect_message="This notice does not offer language assistance. Federal regulations require notices to inform recipients about language assistance availability.",
        action_hint="If English is not your primary language, you may be entitled to a translated notice. Contact your state SNAP office.",
    )


def check_math_plausibility(fields: dict[str, Any]) -> dict[str, Any]:
    """MATH-01: If both amounts present, verify arithmetic is plausible."""
    old_amt = fields.get("benefit_amount_old")
    new_amt = fields.get("benefit_amount_new")

    # Can only check if both amounts are present
    if old_amt is None or new_amt is None:
        return _make_result(
            rule_id="MATH-01",
            citation="7 CFR 273.13(a)(4)",
            description="The benefit amount change is arithmetically plausible.",
            passed=True,
            severity="critical",
        )

    try:
        old_val = float(old_amt)
        new_val = float(new_amt)
    except (ValueError, TypeError):
        return _make_result(
            rule_id="MATH-01",
            citation="7 CFR 273.13(a)(4)",
            description="The benefit amount change is arithmetically plausible.",
            passed=False,
            severity="critical",
            defect_message="The benefit amounts listed in this notice could not be verified — the numbers appear malformed.",
            action_hint="Request a corrected notice with clear, verifiable benefit amounts.",
        )

    # Checks: new amount should not be negative, and should not exceed old amount for a reduction
    action_type = fields.get("action_type")
    passed = True
    defect_message = None

    if new_val < 0:
        passed = False
        defect_message = f"The new benefit amount (${new_val:.2f}) is negative, which is not possible. This appears to be a calculation error."
    elif action_type == "reduction" and new_val > old_val:
        passed = False
        defect_message = (
            f"The notice states this is a reduction, but the new amount (${new_val:.2f}) "
            f"is higher than the old amount (${old_val:.2f}). This is contradictory."
        )

    return _make_result(
        rule_id="MATH-01",
        citation="7 CFR 273.13(a)(4)",
        description="The benefit amount change is arithmetically plausible.",
        passed=passed,
        severity="critical",
        defect_message=defect_message,
        action_hint="The math in this notice appears incorrect. This is strong grounds for requesting a fair hearing." if not passed else None,
    )


def check_timing(fields: dict[str, Any]) -> dict[str, Any]:
    """TIMING-01: Effective date must be at least 10 days after notice date."""
    notice_date = _parse_date(fields.get("notice_date"))
    effective_date = _parse_date(fields.get("effective_date"))

    if notice_date is None or effective_date is None:
        return _make_result(
            rule_id="TIMING-01",
            citation="7 CFR 273.10(g)",
            description="The effective date is at least 10 days after the notice date.",
            passed=True,  # Can't check without both dates
            severity="critical",
        )

    diff = (effective_date - notice_date).days
    passed = diff >= 10

    return _make_result(
        rule_id="TIMING-01",
        citation="7 CFR 273.10(g)",
        description="The effective date is at least 10 days after the notice date.",
        passed=passed,
        severity="critical",
        defect_message=(
            f"The effective date is only {diff} day(s) after the notice date. "
            f"Federal law generally requires at least 10 days' advance notice before an action takes effect."
        ) if not passed else None,
        action_hint="Insufficient notice time is a procedural defect. This may entitle you to continued benefits during appeal." if not passed else None,
    )


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

ALL_RULES = [
    check_notice_date,
    check_effective_date,
    check_reason_stated,
    check_benefit_amounts,
    check_right_to_appeal,
    check_appeal_deadline,
    check_hearing_method,
    check_language_assistance,
    check_math_plausibility,
    check_timing,
]


def run_all_rules(fields: dict[str, Any]) -> list[dict[str, Any]]:
    """Run all rules against the extracted fields and return results."""
    return [rule(fields) for rule in ALL_RULES]


def summarize_results(results: list[dict[str, Any]]) -> dict[str, Any]:
    """Produce summary counts from rule results."""
    defects = [r for r in results if not r["passed"]]
    critical = [r for r in defects if r["severity"] == "critical"]
    return {
        "defect_count": len(defects),
        "critical_count": len(critical),
        "verdict": "defects_found" if defects else "clean",
    }
