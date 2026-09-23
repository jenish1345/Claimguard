"use client";

import React from "react";
import { AnalyzeResponse, RuleResult } from "@/types";
import RuleRow from "./RuleRow";
import DefectCard from "./DefectCard";

interface ResultsPanelProps {
  data: AnalyzeResponse;
  onReset: () => void;
}

export default function ResultsPanel({ data, onReset }: ResultsPanelProps) {
  const { verdict, defect_count, critical_count, rule_results, extracted_fields } = data;

  const defects = rule_results.filter((r: RuleResult) => !r.passed);
  const criticalDefects = defects.filter((r: RuleResult) => r.severity === "critical");
  const warningDefects = defects.filter((r: RuleResult) => r.severity === "warning");

  return (
    <section className="results-panel" aria-label="Analysis results">
      {/* Verdict */}
      <div className={`verdict-card verdict-${verdict}`} role="status" aria-live="assertive">
        <div className="verdict-icon" aria-hidden="true">
          {verdict === "clean" ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : verdict === "extraction_error" ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
        </div>
        <div className="verdict-text">
          {verdict === "clean" ? (
            <>
              <h2 className="verdict-title">No defects found</h2>
              <p className="verdict-subtitle">
                All {rule_results.length} checks passed. This notice appears to meet federal requirements.
              </p>
            </>
          ) : verdict === "extraction_error" ? (
            <>
              <h2 className="verdict-title">Could not read this notice</h2>
              <p className="verdict-subtitle">
                We were unable to extract information from the notice text. Please try again or paste the text directly.
              </p>
            </>
          ) : (
            <>
              <h2 className="verdict-title">
                We found {defect_count} {defect_count === 1 ? "issue" : "issues"} with this notice
              </h2>
              <p className="verdict-subtitle">
                {critical_count > 0 && (
                  <span className="verdict-critical-count">
                    {critical_count} critical
                  </span>
                )}
                {critical_count > 0 && warningDefects.length > 0 && " · "}
                {warningDefects.length > 0 && (
                  <span className="verdict-warning-count">
                    {warningDefects.length} {warningDefects.length === 1 ? "warning" : "warnings"}
                  </span>
                )}
                {" — "}you may have grounds to appeal.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer" role="note">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <p>
          This tool checks for common notice defects under federal law. It does not provide legal advice.
          Contact a <a href="https://www.lawhelp.org" target="_blank" rel="noopener noreferrer">legal aid organization</a> for help with your case.
        </p>
      </div>

      {/* Defect cards */}
      {defects.length > 0 && (
        <div className="defects-section">
          <h2 className="section-heading">Issues Found</h2>
          <div className="defects-list" role="list" aria-label="Notice defects">
            {criticalDefects.map((rule, i) => (
              <DefectCard key={rule.rule_id} rule={rule} index={i} />
            ))}
            {warningDefects.map((rule, i) => (
              <DefectCard key={rule.rule_id} rule={rule} index={i + criticalDefects.length} />
            ))}
          </div>
        </div>
      )}

      {/* All rules */}
      <div className="rules-section">
        <h2 className="section-heading">All Checks ({rule_results.length})</h2>
        <div className="rules-list" role="list" aria-label="All rule check results">
          {rule_results.map((rule, i) => (
            <RuleRow key={rule.rule_id} rule={rule} index={i} />
          ))}
        </div>
      </div>

      {/* Extracted fields summary */}
      {extracted_fields && !extracted_fields.error && (
        <details className="fields-details">
          <summary>Extracted notice information</summary>
          <div className="fields-grid">
            {extracted_fields.recipient_name && (
              <div className="field-item">
                <span className="field-label">Recipient</span>
                <span className="field-value">{extracted_fields.recipient_name}</span>
              </div>
            )}
            {extracted_fields.notice_date && (
              <div className="field-item">
                <span className="field-label">Notice date</span>
                <span className="field-value">{extracted_fields.notice_date}</span>
              </div>
            )}
            {extracted_fields.action_type && (
              <div className="field-item">
                <span className="field-label">Action type</span>
                <span className="field-value capitalize">{extracted_fields.action_type}</span>
              </div>
            )}
            {extracted_fields.effective_date && (
              <div className="field-item">
                <span className="field-label">Effective date</span>
                <span className="field-value">{extracted_fields.effective_date}</span>
              </div>
            )}
            {extracted_fields.benefit_amount_old != null && (
              <div className="field-item">
                <span className="field-label">Previous benefit</span>
                <span className="field-value">${extracted_fields.benefit_amount_old}</span>
              </div>
            )}
            {extracted_fields.benefit_amount_new != null && (
              <div className="field-item">
                <span className="field-label">New benefit</span>
                <span className="field-value">${extracted_fields.benefit_amount_new}</span>
              </div>
            )}
            {extracted_fields.household_size != null && (
              <div className="field-item">
                <span className="field-label">Household size</span>
                <span className="field-value">{extracted_fields.household_size}</span>
              </div>
            )}
            {extracted_fields.appeal_deadline && (
              <div className="field-item">
                <span className="field-label">Appeal deadline</span>
                <span className="field-value">{extracted_fields.appeal_deadline}</span>
              </div>
            )}
          </div>
        </details>
      )}

      {/* Next steps */}
      <div className="next-steps">
        <h2 className="section-heading">What to Do Next</h2>
        <div className="next-steps-grid">
          <a
            href="https://www.lawhelp.org"
            target="_blank"
            rel="noopener noreferrer"
            className="next-step-card"
          >
            <div className="next-step-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3>Find Legal Help</h3>
              <p>LawHelp.org connects you with free legal aid in your area.</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="next-step-arrow" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a
            href="https://www.benefits.gov/benefit/361"
            target="_blank"
            rel="noopener noreferrer"
            className="next-step-card"
          >
            <div className="next-step-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <h3>SNAP Benefits Info</h3>
              <p>Learn about your SNAP rights and benefits at Benefits.gov.</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="next-step-arrow" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>

      {/* Reset */}
      <div className="reset-section">
        <button
          id="reset-btn"
          className="btn-secondary"
          onClick={onReset}
          aria-label="Check another notice"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Check Another Notice
        </button>
      </div>
    </section>
  );
}
