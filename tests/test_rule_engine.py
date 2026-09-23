"""
Unit tests for the SNAP Notice Rule Engine.
Tests each of the 10 rules individually plus the full pipeline.
"""

import pytest
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from rule_engine import (
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
    run_all_rules,
    summarize_results,
)


# ---------------------------------------------------------------------------
# Fixture: Valid extracted fields (all rules should pass)
# ---------------------------------------------------------------------------

@pytest.fixture
def valid_fields():
    return {
        "recipient_name": "Maria Johnson",
        "notice_date": "2026-09-01",
        "action_type": "reduction",
        "effective_date": "2026-09-15",
        "reason_stated": "Household income has changed based on information received from employer.",
        "benefit_amount_old": 352.00,
        "benefit_amount_new": 281.00,
        "household_size": 3,
        "income_listed": 1450.00,
        "appeal_deadline": "2026-11-30",
        "appeal_instructions_present": True,
        "hearing_request_method_stated": True,
        "language_assistance_offered": True,
        "raw_text_snippet": "STATE OF ILLINOIS DEPARTMENT OF HUMAN SERVICES...",
    }


# ---------------------------------------------------------------------------
# Fixture: Defective extracted fields (several rules should fail)
# ---------------------------------------------------------------------------

@pytest.fixture
def defective_fields():
    return {
        "recipient_name": "James Williams",
        "notice_date": None,  # Missing
        "action_type": "reduction",
        "effective_date": "2026-09-08",
        "reason_stated": "Household income has been recalculated.",
        "benefit_amount_old": 280.00,
        "benefit_amount_new": 315.00,  # Higher than old — contradicts "reduction"
        "household_size": 4,
        "income_listed": 1800.00,
        "appeal_deadline": None,  # Missing
        "appeal_instructions_present": False,  # Missing
        "hearing_request_method_stated": False,  # Missing
        "language_assistance_offered": False,  # Missing
        "raw_text_snippet": "STATE OF ILLINOIS DEPARTMENT OF HUMAN SERVICES...",
    }


# ---------------------------------------------------------------------------
# CFR-273.13-A1: Notice date present
# ---------------------------------------------------------------------------

class TestNoticeDate:
    def test_present(self, valid_fields):
        result = check_notice_date(valid_fields)
        assert result["passed"] is True
        assert result["rule_id"] == "CFR-273.13-A1"

    def test_missing(self, defective_fields):
        result = check_notice_date(defective_fields)
        assert result["passed"] is False
        assert result["severity"] == "critical"
        assert result["defect_message"] is not None

    def test_empty_string(self):
        result = check_notice_date({"notice_date": ""})
        assert result["passed"] is False


# ---------------------------------------------------------------------------
# CFR-273.13-A2: Effective date present
# ---------------------------------------------------------------------------

class TestEffectiveDate:
    def test_present(self, valid_fields):
        result = check_effective_date(valid_fields)
        assert result["passed"] is True

    def test_missing(self):
        result = check_effective_date({"effective_date": None})
        assert result["passed"] is False
        assert result["severity"] == "critical"


# ---------------------------------------------------------------------------
# CFR-273.13-A3: Reason stated
# ---------------------------------------------------------------------------

class TestReasonStated:
    def test_present(self, valid_fields):
        result = check_reason_stated(valid_fields)
        assert result["passed"] is True

    def test_missing(self):
        result = check_reason_stated({"reason_stated": None})
        assert result["passed"] is False

    def test_empty_string(self):
        result = check_reason_stated({"reason_stated": ""})
        assert result["passed"] is False


# ---------------------------------------------------------------------------
# CFR-273.13-A4: Benefit amounts for reductions
# ---------------------------------------------------------------------------

class TestBenefitAmounts:
    def test_both_present_reduction(self, valid_fields):
        result = check_benefit_amounts(valid_fields)
        assert result["passed"] is True

    def test_missing_new_amount(self):
        fields = {
            "action_type": "reduction",
            "benefit_amount_old": 352.00,
            "benefit_amount_new": None,
        }
        result = check_benefit_amounts(fields)
        assert result["passed"] is False

    def test_missing_old_amount(self):
        fields = {
            "action_type": "reduction",
            "benefit_amount_old": None,
            "benefit_amount_new": 281.00,
        }
        result = check_benefit_amounts(fields)
        assert result["passed"] is False

    def test_not_a_reduction(self):
        """Non-reduction actions don't need both amounts."""
        fields = {
            "action_type": "termination",
            "benefit_amount_old": None,
            "benefit_amount_new": None,
        }
        result = check_benefit_amounts(fields)
        assert result["passed"] is True


# ---------------------------------------------------------------------------
# CFR-273.13-A5: Right to appeal
# ---------------------------------------------------------------------------

class TestRightToAppeal:
    def test_present(self, valid_fields):
        result = check_right_to_appeal(valid_fields)
        assert result["passed"] is True

    def test_missing(self, defective_fields):
        result = check_right_to_appeal(defective_fields)
        assert result["passed"] is False
        assert result["severity"] == "critical"


# ---------------------------------------------------------------------------
# CFR-273.13-A6: Appeal deadline
# ---------------------------------------------------------------------------

class TestAppealDeadline:
    def test_present(self, valid_fields):
        result = check_appeal_deadline(valid_fields)
        assert result["passed"] is True

    def test_missing(self, defective_fields):
        result = check_appeal_deadline(defective_fields)
        assert result["passed"] is False


# ---------------------------------------------------------------------------
# CFR-273.13-A7: Hearing method
# ---------------------------------------------------------------------------

class TestHearingMethod:
    def test_present(self, valid_fields):
        result = check_hearing_method(valid_fields)
        assert result["passed"] is True

    def test_missing(self, defective_fields):
        result = check_hearing_method(defective_fields)
        assert result["passed"] is False
        assert result["severity"] == "warning"


# ---------------------------------------------------------------------------
# CFR-273.13-B1: Language assistance
# ---------------------------------------------------------------------------

class TestLanguageAssistance:
    def test_present(self, valid_fields):
        result = check_language_assistance(valid_fields)
        assert result["passed"] is True

    def test_missing(self, defective_fields):
        result = check_language_assistance(defective_fields)
        assert result["passed"] is False
        assert result["severity"] == "warning"


# ---------------------------------------------------------------------------
# MATH-01: Arithmetic plausibility
# ---------------------------------------------------------------------------

class TestMathPlausibility:
    def test_valid_reduction(self, valid_fields):
        result = check_math_plausibility(valid_fields)
        assert result["passed"] is True

    def test_new_higher_than_old_for_reduction(self, defective_fields):
        """New amount > old amount for a 'reduction' is contradictory."""
        result = check_math_plausibility(defective_fields)
        assert result["passed"] is False
        assert "contradictory" in result["defect_message"].lower()

    def test_negative_new_amount(self):
        fields = {
            "action_type": "reduction",
            "benefit_amount_old": 200.00,
            "benefit_amount_new": -50.00,
        }
        result = check_math_plausibility(fields)
        assert result["passed"] is False
        assert "negative" in result["defect_message"].lower()

    def test_missing_amounts_passes(self):
        """Can't check math without both amounts — should pass."""
        fields = {"benefit_amount_old": None, "benefit_amount_new": None}
        result = check_math_plausibility(fields)
        assert result["passed"] is True


# ---------------------------------------------------------------------------
# TIMING-01: 10-day notice requirement
# ---------------------------------------------------------------------------

class TestTiming:
    def test_sufficient_notice(self, valid_fields):
        """14 days between Sept 1 and Sept 15 — passes."""
        result = check_timing(valid_fields)
        assert result["passed"] is True

    def test_insufficient_notice(self):
        fields = {
            "notice_date": "2026-09-01",
            "effective_date": "2026-09-05",
        }
        result = check_timing(fields)
        assert result["passed"] is False
        assert "4 day" in result["defect_message"]

    def test_missing_dates_passes(self):
        """Can't check timing without both dates — should pass."""
        fields = {"notice_date": None, "effective_date": None}
        result = check_timing(fields)
        assert result["passed"] is True

    def test_various_date_formats(self):
        """Should handle different date formats."""
        fields = {
            "notice_date": "09/01/2026",
            "effective_date": "09/15/2026",
        }
        result = check_timing(fields)
        assert result["passed"] is True


# ---------------------------------------------------------------------------
# Full pipeline tests
# ---------------------------------------------------------------------------

class TestFullPipeline:
    def test_valid_notice_all_pass(self, valid_fields):
        results = run_all_rules(valid_fields)
        assert len(results) == 10
        assert all(r["passed"] for r in results)

        summary = summarize_results(results)
        assert summary["verdict"] == "clean"
        assert summary["defect_count"] == 0

    def test_defective_notice_finds_defects(self, defective_fields):
        results = run_all_rules(defective_fields)
        assert len(results) == 10

        failed = [r for r in results if not r["passed"]]
        assert len(failed) >= 5  # At least 5 defects expected

        summary = summarize_results(results)
        assert summary["verdict"] == "defects_found"
        assert summary["defect_count"] >= 5
        assert summary["critical_count"] >= 3

    def test_result_structure(self, valid_fields):
        results = run_all_rules(valid_fields)
        for r in results:
            assert "rule_id" in r
            assert "citation" in r
            assert "description" in r
            assert "passed" in r
            assert "severity" in r
            assert r["severity"] in ("critical", "warning")
