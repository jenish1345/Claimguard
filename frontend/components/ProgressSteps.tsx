"use client";

import React from "react";
import { AnalysisStep } from "@/types";

interface ProgressStepsProps {
  currentStep: AnalysisStep;
}

const STEPS: { key: AnalysisStep; label: string }[] = [
  { key: "uploading", label: "Receiving notice" },
  { key: "extracting", label: "Extracting text" },
  { key: "parsing", label: "Parsing fields" },
  { key: "checking", label: "Running checks" },
];

const stepOrder: AnalysisStep[] = ["uploading", "extracting", "parsing", "checking", "complete"];

function getStepStatus(
  stepKey: AnalysisStep,
  currentStep: AnalysisStep
): "pending" | "active" | "done" {
  const currentIdx = stepOrder.indexOf(currentStep);
  const stepIdx = stepOrder.indexOf(stepKey);

  if (currentStep === "complete" || currentStep === "error") return "done";
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  if (currentStep === "idle" || currentStep === "complete") return null;

  return (
    <section className="progress-steps" aria-label="Analysis progress" role="status" aria-live="polite">
      <div className="progress-track">
        {STEPS.map((step, i) => {
          const status = getStepStatus(step.key, currentStep);
          return (
            <div key={step.key} className={`progress-step progress-step-${status}`}>
              <div className="step-indicator">
                {status === "done" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : status === "active" ? (
                  <div className="step-spinner" aria-hidden="true" />
                ) : (
                  <span className="step-number" aria-hidden="true">{i + 1}</span>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
