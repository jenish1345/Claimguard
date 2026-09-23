"use client";

import React, { useCallback, useRef, useState } from "react";
import { InputMode } from "@/types";

interface UploadZoneProps {
  onSubmit: (text: string, source: "pdf" | "paste") => void;
  disabled: boolean;
}

export default function UploadZone({ onSubmit, disabled }: UploadZoneProps) {
  const [mode, setMode] = useState<InputMode>("upload");
  const [pasteText, setPasteText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setFileError(null);

      const ext = file.name.toLowerCase().split(".").pop();
      if (ext !== "pdf" && ext !== "txt") {
        setFileError("Please upload a PDF or TXT file.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setFileError("File is too large. Maximum size is 10 MB.");
        return;
      }

      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text.startsWith("%PDF")) {
          setFileError(
            "PDF parsing requires the backend server. Please paste the notice text instead, or start the backend server."
          );
          setFileName(null);
          return;
        }
        onSubmit(text, ext === "pdf" ? "pdf" : "paste");
      };
      reader.onerror = () => {
        setFileError("Could not read the file. Please try pasting the text instead.");
        setFileName(null);
      };
      reader.readAsText(file);
    },
    [onSubmit]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handlePaste = () => {
    if (pasteText.trim().length < 20) {
      setFileError("Please paste more text — at least a few sentences from the notice.");
      return;
    }
    setFileError(null);
    onSubmit(pasteText, "paste");
  };

  return (
    <section className="upload-zone" aria-label="Upload your SNAP notice">
      {/* Tab selector */}
      <div className="tab-bar" role="tablist" aria-label="Input method">
        <button
          id="tab-upload"
          role="tab"
          aria-selected={mode === "upload"}
          aria-controls="panel-upload"
          className={`tab-btn ${mode === "upload" ? "tab-active" : ""}`}
          onClick={() => {
            setMode("upload");
            setFileError(null);
          }}
          disabled={disabled}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload PDF
        </button>
        <button
          id="tab-paste"
          role="tab"
          aria-selected={mode === "paste"}
          aria-controls="panel-paste"
          className={`tab-btn ${mode === "paste" ? "tab-active" : ""}`}
          onClick={() => {
            setMode("paste");
            setFileError(null);
          }}
          disabled={disabled}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          Paste Text
        </button>
      </div>

      {/* Upload panel */}
      {mode === "upload" && (
        <div
          id="panel-upload"
          role="tabpanel"
          aria-labelledby="tab-upload"
          className={`drop-area ${dragOver ? "drop-area-active" : ""} ${disabled ? "drop-area-disabled" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => { if (!disabled) fileInputRef.current?.click(); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!disabled) fileInputRef.current?.click();
            }
          }}
          tabIndex={disabled ? -1 : 0}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            disabled={disabled}
            aria-label="Choose a PDF or text file"
          />

          <div className="drop-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 12 15 15" />
            </svg>
          </div>

          {fileName ? (
            <p className="drop-text">
              <strong>{fileName}</strong> selected
            </p>
          ) : (
            <>
              <p className="drop-text">
                <strong>Drop your notice PDF here</strong> or click to browse
              </p>
              <p className="drop-subtext">PDF or TXT files up to 10 MB</p>
            </>
          )}
        </div>
      )}

      {/* Paste panel */}
      {mode === "paste" && (
        <div id="panel-paste" role="tabpanel" aria-labelledby="tab-paste">
          <label htmlFor="notice-text-input" className="sr-only">
            Paste your SNAP notice text
          </label>
          <textarea
            id="notice-text-input"
            className="paste-textarea"
            placeholder="Paste the full text of your SNAP notice here..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            disabled={disabled}
            rows={10}
            aria-describedby="paste-hint"
          />
          <p id="paste-hint" className="paste-hint">
            Copy all the text from your notice letter and paste it above. Include everything — dates, amounts, and any fine print.
          </p>
          <button
            id="analyze-btn"
            className="btn-primary"
            onClick={handlePaste}
            disabled={disabled || pasteText.trim().length < 20}
            aria-label="Check this notice for defects"
          >
            Check This Notice
          </button>
        </div>
      )}

      {/* Error display */}
      {fileError && (
        <div className="upload-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {fileError}
        </div>
      )}
    </section>
  );
}
