import { NextRequest, NextResponse } from "next/server";

// Types matching the backend contract
interface AnalyzeRequest {
  text: string;
  source: "pdf" | "paste";
}

interface RuleResult {
  rule_id: string;
  citation: string;
  description: string;
  passed: boolean;
  severity: "critical" | "warning";
  defect_message: string | null;
  action_hint: string | null;
}

// --------------------------------------------------------------------------
// Inline rule engine (mirrors backend/rule_engine.py)
// Allows frontend to work standalone without FastAPI
// --------------------------------------------------------------------------

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;

  // Try standard JS date parse
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  return null;
}

function makeResult(
  rule_id: string,
  citation: string,
  description: string,
  passed: boolean,
  severity: "critical" | "warning" = "critical",
  defect_message: string | null = null,
  action_hint: string | null = null
): RuleResult {
  return {
    rule_id,
    citation,
    description,
    passed,
    severity,
    defect_message: passed ? null : defect_message,
    action_hint: passed ? null : action_hint,
  };
}

function runRules(fields: Record<string, unknown>): RuleResult[] {
  const results: RuleResult[] = [];

  // CFR-273.13-A1: Notice date present
  results.push(
    makeResult(
      "CFR-273.13-A1",
      "7 CFR 273.13(a)(1)",
      "The notice includes the date it was issued.",
      Boolean(fields.notice_date),
      "critical",
      "This notice is missing the date it was issued. Federal law requires every SNAP notice to include the date.",
      "You may cite this missing date as a defect in a fair hearing request."
    )
  );

  // CFR-273.13-A2: Effective date
  results.push(
    makeResult(
      "CFR-273.13-A2",
      "7 CFR 273.13(a)(2)",
      "The notice states the effective date of the action.",
      Boolean(fields.effective_date),
      "critical",
      "This notice does not state when the action takes effect. Federal law requires an effective date.",
      "Without an effective date, the notice may be considered legally deficient. Note this in your hearing request."
    )
  );

  // CFR-273.13-A3: Reason stated
  results.push(
    makeResult(
      "CFR-273.13-A3",
      "7 CFR 273.13(a)(3)",
      "The notice explains why this action is being taken.",
      Boolean(fields.reason_stated),
      "critical",
      "This notice does not explain the reason for the action. Federal law requires the agency to state why benefits are being changed.",
      "A missing reason is a significant defect. Consider requesting a fair hearing."
    )
  );

  // CFR-273.13-A4: Benefit amounts for reductions
  const actionType = fields.action_type as string;
  if (actionType === "reduction") {
    const bothPresent = fields.benefit_amount_old != null && fields.benefit_amount_new != null;
    results.push(
      makeResult(
        "CFR-273.13-A4",
        "7 CFR 273.13(a)(4)",
        "Benefit amounts before and after are both stated (applies to reductions).",
        bothPresent,
        "critical",
        "This notice reduces your benefits but does not clearly state both the old and new amounts. Federal law requires both figures.",
        "Without clear benefit amounts, you cannot verify the change is correct. Note this defect in your hearing request."
      )
    );
  } else {
    results.push(
      makeResult(
        "CFR-273.13-A4",
        "7 CFR 273.13(a)(4)",
        "Benefit amounts before and after are both stated (applies to reductions).",
        true,
        "critical"
      )
    );
  }

  // CFR-273.13-A5: Right to appeal
  results.push(
    makeResult(
      "CFR-273.13-A5",
      "7 CFR 273.13(a)(5)",
      "The notice informs you of your right to appeal.",
      Boolean(fields.appeal_instructions_present),
      "critical",
      "This notice does not mention your right to appeal. Federal law requires every adverse action notice to include appeal rights.",
      "A missing appeal notice is a serious defect. You still have the right to appeal — contact your local legal aid office."
    )
  );

  // CFR-273.13-A6: Appeal deadline
  results.push(
    makeResult(
      "CFR-273.13-A6",
      "7 CFR 273.13(a)(6)",
      "The notice states the deadline to request an appeal.",
      Boolean(fields.appeal_deadline),
      "critical",
      "This notice does not state the deadline to file an appeal. Federal law requires the appeal deadline to be clearly communicated.",
      "Even without a stated deadline, you likely have 90 days to request a fair hearing. Act quickly and contact legal aid."
    )
  );

  // CFR-273.13-A7: Hearing method
  results.push(
    makeResult(
      "CFR-273.13-A7",
      "7 CFR 273.13(a)(7)",
      "The notice explains how to request a fair hearing.",
      Boolean(fields.hearing_request_method_stated),
      "warning",
      "This notice does not explain how to request a fair hearing. Federal law requires clear instructions for requesting a hearing.",
      "You can typically request a hearing by writing to your state SNAP agency. Contact legal aid for your state's specific process."
    )
  );

  // CFR-273.13-B1: Language assistance
  results.push(
    makeResult(
      "CFR-273.13-B1",
      "7 CFR 273.13(b)",
      "The notice offers language assistance for non-English speakers.",
      Boolean(fields.language_assistance_offered),
      "warning",
      "This notice does not offer language assistance. Federal regulations require notices to inform recipients about language assistance availability.",
      "If English is not your primary language, you may be entitled to a translated notice. Contact your state SNAP office."
    )
  );

  // MATH-01: Arithmetic plausibility
  const oldAmt = fields.benefit_amount_old as number | null;
  const newAmt = fields.benefit_amount_new as number | null;
  if (oldAmt != null && newAmt != null) {
    let mathPassed = true;
    let mathMsg: string | null = null;

    if (newAmt < 0) {
      mathPassed = false;
      mathMsg = `The new benefit amount ($${newAmt.toFixed(2)}) is negative, which is not possible. This appears to be a calculation error.`;
    } else if (actionType === "reduction" && newAmt > oldAmt) {
      mathPassed = false;
      mathMsg = `The notice states this is a reduction, but the new amount ($${newAmt.toFixed(2)}) is higher than the old amount ($${oldAmt.toFixed(2)}). This is contradictory.`;
    }

    results.push(
      makeResult(
        "MATH-01",
        "7 CFR 273.13(a)(4)",
        "The benefit amount change is arithmetically plausible.",
        mathPassed,
        "critical",
        mathMsg,
        mathPassed ? null : "The math in this notice appears incorrect. This is strong grounds for requesting a fair hearing."
      )
    );
  } else {
    results.push(
      makeResult(
        "MATH-01",
        "7 CFR 273.13(a)(4)",
        "The benefit amount change is arithmetically plausible.",
        true,
        "critical"
      )
    );
  }

  // TIMING-01: 10-day notice
  const noticeDate = parseDate(fields.notice_date as string | null);
  const effectiveDate = parseDate(fields.effective_date as string | null);
  if (noticeDate && effectiveDate) {
    const diffMs = effectiveDate.getTime() - noticeDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const passed = diffDays >= 10;

    results.push(
      makeResult(
        "TIMING-01",
        "7 CFR 273.10(g)",
        "The effective date is at least 10 days after the notice date.",
        passed,
        "critical",
        passed
          ? null
          : `The effective date is only ${diffDays} day(s) after the notice date. Federal law generally requires at least 10 days' advance notice before an action takes effect.`,
        passed
          ? null
          : "Insufficient notice time is a procedural defect. This may entitle you to continued benefits during appeal."
      )
    );
  } else {
    results.push(
      makeResult(
        "TIMING-01",
        "7 CFR 273.10(g)",
        "The effective date is at least 10 days after the notice date.",
        true,
        "critical"
      )
    );
  }

  return results;
}

// --------------------------------------------------------------------------
// Basic field extraction (keyword-based, no LLM needed)
// --------------------------------------------------------------------------

function extractFields(text: string): Record<string, unknown> {
  const lower = text.toLowerCase();

  // Date extraction patterns
  const dateRegex =
    /(?:date(?:\s+of\s+notice)?|dated|issued)\s*:?\s*(\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i;
  const effectiveDateRegex =
    /(?:effective|takes?\s+effect)\s*(?:date)?\s*:?\s*(\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i;
  const appealDeadlineRegex =
    /(?:appeal|hearing)\s+(?:deadline|by|before|within|no\s+later\s+than)\s*:?\s*(\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|\d+\s+days?)/i;
  const oldAmountRegex =
    /(?:previous|current|old|from)\s*(?:monthly\s+)?(?:benefit\s+)?(?:amount)?\s*:?\s*\$?([\d,]+\.?\d*)/i;
  const newAmountRegex =
    /(?:new|to|reduced\s+to|changed\s+to)\s*(?:monthly\s+)?(?:benefit\s+)?(?:amount)?\s*:?\s*\$?([\d,]+\.?\d*)/i;
  const householdRegex = /household\s+size\s*:?\s*(\d+)/i;
  const incomeRegex =
    /(?:monthly\s+)?(?:gross\s+)?income\s*:?\s*\$?([\d,]+\.?\d*)/i;

  const noticeDateMatch = text.match(dateRegex);
  const effectiveDateMatch = text.match(effectiveDateRegex);
  const appealDeadlineMatch = text.match(appealDeadlineRegex);
  const oldAmountMatch = text.match(oldAmountRegex);
  const newAmountMatch = text.match(newAmountRegex);
  const householdMatch = text.match(householdRegex);
  const incomeMatch = text.match(incomeRegex);

  // Reason extraction
  let reason: string | null = null;
  const reasonPatterns = [
    /reason\s*(?:for\s+(?:action|change))?\s*:?\s*\n?\s*(.{10,200})/i,
    /(?:because|due to)\s+(.{10,200})/i,
    /(?:this\s+(?:notice\s+)?is\s+to\s+inform\s+you\s+that)\s+(.{10,200})/i,
  ];
  for (const pattern of reasonPatterns) {
    const match = text.match(pattern);
    if (match) {
      reason = match[1].trim().replace(/\n/g, " ").substring(0, 200);
      break;
    }
  }

  // Action type
  let actionType: string | null = null;
  if (lower.includes("terminat")) actionType = "termination";
  else if (lower.includes("reduc")) actionType = "reduction";
  else if (lower.includes("deni")) actionType = "denial";
  else actionType = "other";

  // Appeal and hearing info
  const appealKeywords = ["right to appeal", "fair hearing", "right to request", "request a hearing", "appeal this"];
  const hearingMethodKeywords = [
    "request a hearing",
    "write to",
    "call",
    "contact",
    "how to request",
    "mail to",
    "in person",
    "you may request",
  ];
  const languageKeywords = [
    "language assistance",
    "español",
    "other languages",
    "interpreter",
    "translated",
    "si necesita",
  ];

  // Name extraction
  const nameRegex = /(?:dear|to:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/;
  const nameMatch = text.match(nameRegex);

  // Parse amounts
  const parseAmount = (match: RegExpMatchArray | null): number | null => {
    if (!match) return null;
    const val = parseFloat(match[1].replace(",", ""));
    return isNaN(val) ? null : val;
  };

  return {
    recipient_name: nameMatch ? nameMatch[1] : null,
    notice_date: noticeDateMatch ? noticeDateMatch[1] : null,
    action_type: actionType,
    effective_date: effectiveDateMatch ? effectiveDateMatch[1] : null,
    reason_stated: reason,
    benefit_amount_old: parseAmount(oldAmountMatch),
    benefit_amount_new: parseAmount(newAmountMatch),
    household_size: householdMatch ? parseInt(householdMatch[1]) : null,
    income_listed: incomeMatch ? parseFloat(incomeMatch[1].replace(",", "")) : null,
    appeal_deadline: appealDeadlineMatch ? appealDeadlineMatch[1] : null,
    appeal_instructions_present: appealKeywords.some((kw) => lower.includes(kw)),
    hearing_request_method_stated: hearingMethodKeywords.some((kw) => lower.includes(kw)),
    language_assistance_offered: languageKeywords.some((kw) => lower.includes(kw)),
    raw_text_snippet: text.substring(0, 300),
  };
}

// --------------------------------------------------------------------------
// API Route Handler
// --------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();

    if (!body.text || body.text.trim().length < 20) {
      return NextResponse.json(
        { detail: "Notice text is too short. Please provide the full notice text." },
        { status: 400 }
      );
    }

    // Try backend first if BACKEND_URL is configured
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      try {
        const backendResponse = await fetch(`${backendUrl}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (backendResponse.ok) {
          const data = await backendResponse.json();
          return NextResponse.json(data);
        }
      } catch {
        // Backend unavailable — fall through to inline analysis
        console.warn("Backend unavailable, using inline analysis");
      }
    }

    // Inline analysis (no backend needed)
    const fields = extractFields(body.text);
    const ruleResults = runRules(fields);

    const defects = ruleResults.filter((r) => !r.passed);
    const criticalDefects = defects.filter((r) => r.severity === "critical");

    return NextResponse.json({
      extracted_fields: fields,
      rule_results: ruleResults,
      defect_count: defects.length,
      critical_count: criticalDefects.length,
      verdict: defects.length > 0 ? "defects_found" : "clean",
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { detail: "An error occurred during analysis. Please try again." },
      { status: 500 }
    );
  }
}
