"use client";

import React from "react";
import { RuleResult } from "@/types";

interface RuleRowProps {
  rule: RuleResult;
  index: number;
}

export default function RuleRow({ rule, index }: RuleRowProps) {
  return (
    <div
      className={`rule-row ${rule.passed ? "rule-passed" : "rule-failed"}`}
      style={{ animationDelay: `${index * 60}ms` }}
      role="listitem"
    >
      <div className="rule-status" aria-label={rule.passed ? "Passed" : "Failed"}>
        {rule.passed ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="icon-pass" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`icon-fail icon-${rule.severity}`} aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        )}
      </div>
      <div className="rule-content">
        <p className="rule-description">{rule.description}</p>
        <span className="rule-citation">{rule.citation}</span>
      </div>
      {!rule.passed && (
        <span className={`rule-badge rule-badge-${rule.severity}`}>
          {rule.severity === "critical" ? "Critical" : "Warning"}
        </span>
      )}
    </div>
  );
}
