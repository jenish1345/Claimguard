"use client";

import React, { useState, useCallback } from "react";
import UploadZone from "@/components/UploadZone";
import ProgressSteps from "@/components/ProgressSteps";
import ResultsPanel from "@/components/ResultsPanel";
import { AnalyzeResponse, AnalysisStep } from "@/types";

export default function Home() {
  const [step, setStep] = useState<AnalysisStep>("idle");
  const [results, setResults] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (text: string, source: "pdf" | "paste") => {
    setError(null);
    setResults(null);
    setStep("uploading");

    // Simulate step progression for UX
    await delay(400);
    setStep("extracting");
    await delay(300);
    setStep("parsing");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Server error" }));
        throw new Error(err.detail || `Server returned ${response.status}`);
      }

      setStep("checking");
      await delay(500);

      const data: AnalyzeResponse = await response.json();
      setResults(data);
      setStep("complete");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      setStep("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    setStep("idle");
    setResults(null);
    setError(null);
  }, []);

  return (
    <div className="page-container">
      {/* Hero section */}
      {step === "idle" && (
        <section className="hero" aria-label="Introduction">
          <h1 className="hero-title">Check your SNAP notice for errors</h1>
          <p className="hero-subtitle">
            Government benefit notices sometimes contain mistakes — wrong math, missing information,
            or unclear language. This free tool checks your notice against federal law and tells you
            what to do if something is wrong.
          </p>
          <div className="hero-features">
            <div className="hero-feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>No account needed</span>
            </div>
            <div className="hero-feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Fully anonymous</span>
            </div>
            <div className="hero-feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>10 federal law checks</span>
            </div>
          </div>
        </section>
      )}

      {/* Upload zone */}
      {(step === "idle" || step === "error") && (
        <>
          <UploadZone
            onSubmit={handleSubmit}
            disabled={step !== "idle" && step !== "error"}
          />
          {error && (
            <div className="global-error" role="alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="error-title">Something went wrong</p>
                <p className="error-message">{error}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Progress */}
      {(step === "uploading" || step === "extracting" || step === "parsing" || step === "checking") && (
        <ProgressSteps currentStep={step} />
      )}

      {/* Results */}
      {step === "complete" && results && (
        <ResultsPanel data={results} onReset={handleReset} />
      )}
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
