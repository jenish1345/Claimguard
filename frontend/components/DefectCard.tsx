"use client";

import React from "react";
import { RuleResult } from "@/types";

interface DefectCardProps {
  rule: RuleResult;
  index: number;
}

export default function DefectCard({ rule, index }: DefectCardProps) {
  if (rule.passed) return null;

  return (
    <article
      className={`defect-card defect-${rule.severity}`}
      style={{ animationDelay: `${index * 80 + 200}ms` }}
      aria-label={`${rule.severity === "critical" ? "Critical" : "Warning"} defect: ${rule.description}`}
    >
      <div className="defect-header">
        <div className="defect-icon" aria-hidden="true">
          {rule.severity === "critical" ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <div className="defect-title-group">
          <h3 className="defect-title">{rule.description}</h3>
          <span className="defect-citation">{rule.citation} · {rule.rule_id}</span>
        </div>
      </div>

      {rule.defect_message && (
        <p className="defect-message">{rule.defect_message}</p>
      )}

      {rule.action_hint && (
        <div className="defect-action">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <p>{rule.action_hint}</p>
        </div>
      )}
    </article>
  );
}
