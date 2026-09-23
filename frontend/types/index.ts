// Type definitions for SNAP Notice Checker

export interface ExtractedFields {
  recipient_name: string | null;
  notice_date: string | null;
  action_type: "reduction" | "termination" | "denial" | "other" | null;
  effective_date: string | null;
  reason_stated: string | null;
  benefit_amount_old: number | null;
  benefit_amount_new: number | null;
  household_size: number | null;
  income_listed: number | null;
  appeal_deadline: string | null;
  appeal_instructions_present: boolean;
  hearing_request_method_stated: boolean;
  language_assistance_offered: boolean;
  raw_text_snippet: string;
  error?: string;
}

export interface RuleResult {
  rule_id: string;
  citation: string;
  description: string;
  passed: boolean;
  severity: "critical" | "warning";
  defect_message: string | null;
  action_hint: string | null;
}

export interface AnalyzeResponse {
  extracted_fields: ExtractedFields;
  rule_results: RuleResult[];
  defect_count: number;
  critical_count: number;
  verdict: "defects_found" | "clean" | "extraction_error";
}

export type AnalysisStep =
  | "idle"
  | "uploading"
  | "extracting"
  | "parsing"
  | "checking"
  | "complete"
  | "error";

export type InputMode = "upload" | "paste";
