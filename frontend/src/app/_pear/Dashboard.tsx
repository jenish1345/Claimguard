"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SAMPLES } from "./samples";
import "./dashboard.css";

type Rule = {
  rule_id: string;
  citation: string;
  description: string;
  passed: boolean;
  severity: "critical" | "warning";
  defect_message: string | null;
  action_hint: string | null;
};
type Fields = Record<string, string | number | boolean | null | undefined>;
type Result = {
  extracted_fields: Fields;
  rule_results: Rule[];
  defect_count: number;
  critical_count: number;
  verdict: "defects_found" | "clean" | "extraction_error";
};
type Health = { extractor?: string } | "offline" | null;

// Set by the story's "Check this notice" button (engine.ts Mn) before it navigates here.
const HANDOFF_KEY = "cg:notice";
const STEP_MS = 140;
const MAX_PDF = 10 * 1024 * 1024;

const text = (v: unknown) => (v === null || v === undefined || v === "" ? null : String(v));
const money = (v: unknown) => (typeof v === "number" ? `$${v.toFixed(2)}` : null);

const FIELD_ROWS: [string, (f: Fields) => string | null][] = [
  ["Action", (f) => text(f.action_type)],
  ["Notice date", (f) => text(f.notice_date)],
  ["Takes effect", (f) => text(f.effective_date)],
  [
    "Monthly benefit",
    (f) =>
      f.benefit_amount_old == null && f.benefit_amount_new == null
        ? null
        : `${money(f.benefit_amount_old) ?? "?"} → ${money(f.benefit_amount_new) ?? "?"}`,
  ],
  ["Household size", (f) => text(f.household_size)],
  ["Appeal by", (f) => text(f.appeal_deadline)],
  ["Reason given", (f) => text(f.reason_stated)],
];

const ACTION_VERB: Record<string, string> = {
  reduction: "reduces",
  termination: "ends",
  denial: "denies",
};

const NEXT_STEPS = [
  {
    href: "https://www.lawhelp.org",
    title: "Find free legal help",
    body: "LawHelp.org connects you with legal aid offices near you.",
  },
  {
    href: "https://www.benefits.gov/benefit/361",
    title: "Know your SNAP rights",
    body: "Benefits.gov explains SNAP eligibility and how to reach your state agency.",
  },
];

function hearingRequest(r: Result) {
  const f = r.extracted_fields;
  const dated = text(f.notice_date) ? ` dated ${f.notice_date}` : "";
  const effective = text(f.effective_date) ? `, effective ${f.effective_date}` : "";
  const verb = ACTION_VERB[String(f.action_type)] ?? "changes";
  const defects = r.rule_results
    .filter((x) => !x.passed)
    .map((x, i) => `${i + 1}. ${x.defect_message} (${x.citation})`)
    .join("\n");
  const today = new Date().toLocaleDateString("en-US", { dateStyle: "long" });
  return `${today}

To: SNAP agency, Fair Hearings
From: ${text(f.recipient_name) ?? "[Your name]"}
Case number: [Your case number]

Re: Request for a fair hearing

I am requesting a fair hearing about the SNAP notice${dated} that ${verb} my benefits${effective}.

The notice does not meet federal notice requirements:

${defects}

I ask that my benefits continue at their current level until the hearing decision, as allowed by 7 CFR 273.15(k).

Signature: ______________________`;
}

// Read once per page load: StrictMode runs state initializers twice and the key is removed on first read.
let handoffCache: string | null = null;
function takeHandoff() {
  if (handoffCache === null) {
    try {
      handoffCache = sessionStorage.getItem(HANDOFF_KEY) ?? "";
      sessionStorage.removeItem(HANDOFF_KEY);
    } catch {
      handoffCache = "";
    }
  }
  return handoffCache;
}

export function Dashboard() {
  const abortRef = useRef<AbortController | null>(null);
  const [handoff] = useState(takeHandoff);
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [notice, setNotice] = useState(handoff);
  const [pdfName, setPdfName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const [health, setHealth] = useState<Health>(null);
  const [busy, setBusy] = useState(Boolean(handoff));
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [shown, setShown] = useState(0);
  const [letter, setLetter] = useState("");
  const [copied, setCopied] = useState(false);

  // Only sets state after the await, so the mount effect can call it directly.
  const request = useCallback(async (input: string | File) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let init: RequestInit;
    if (typeof input === "string") {
      init = { headers: { "content-type": "application/json" }, body: JSON.stringify({ text: input }) };
    } else {
      const form = new FormData();
      form.append("file", input);
      init = { body: form };
    }
    try {
      const res = await fetch("/api/analyze", { ...init, method: "POST", signal: ctrl.signal });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof body.detail === "string" ? body.detail : "The check failed. Try again.");
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      setShown(reduce ? body.rule_results.length : 0);
      setResult(body);
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (!ctrl.signal.aborted) setBusy(false);
    }
  }, []);

  const run = (input: string | File) => {
    setBusy(true);
    setError("");
    setResult(null);
    setLetter("");
    request(input);
  };

  useEffect(() => {
    fetch("/api/analyze")
      .then((r) => (r.ok ? r.json() : "offline"))
      .then(setHealth, () => setHealth("offline"));
    // request() only sets state after its network await; the lint rule can't see past it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (handoff) request(handoff);
    return () => abortRef.current?.abort();
  }, [handoff, request]);

  // Reveal rule results one at a time once the engine answers.
  const total = result?.rule_results.length ?? 0;
  useEffect(() => {
    if (shown >= total) return;
    const t = setTimeout(() => setShown((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [shown, total]);

  const checking = result !== null && shown < total;
  const done = result !== null && !checking;
  const defects = result
    ? result.rule_results.filter((r) => !r.passed).sort(
        (a, b) => Number(a.severity === "warning") - Number(b.severity === "warning"),
      )
    : [];

  const loadSample = (key: keyof typeof SAMPLES) => {
    setNotice(SAMPLES[key]);
    setPdfName("");
    setFileError("");
    setMode("paste");
  };

  const handleFile = async (file: File) => {
    setFileError("");
    const name = file.name.toLowerCase();
    if (name.endsWith(".txt")) {
      setNotice(await file.text());
      setPdfName("");
      setMode("paste");
      return;
    }
    if (!name.endsWith(".pdf")) return setFileError("Choose a PDF or a .txt file.");
    if (file.size > MAX_PDF) return setFileError("That PDF is over 10 MB.");
    setPdfName(file.name);
    run(file);
  };

  const reset = () => {
    abortRef.current?.abort();
    setBusy(false);
    setResult(null);
    setError("");
    setLetter("");
    setNotice("");
    setPdfName("");
    setMode("paste");
    scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyLetter = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const healthState = health === "offline" ? "off" : health?.extractor ?? "wait";

  return (
    <div className="db">
      <header className="db-bar">
        <Link className="db-brand" href="/">
          <svg viewBox="0 0 305 415" aria-hidden="true">
            <path d="M152.5 30L268 70V188C268 282 218 348 152.5 386C87 348 37 282 37 188V70Z" />
          </svg>
          ClaimGuard
        </Link>
        <p className="db-health" data-state={healthState}>
          <i aria-hidden="true" />
          {healthState === "wait" && "Connecting to the engine…"}
          {healthState === "off" && "Engine offline. Start it with: uvicorn main:app --port 8000"}
          {healthState === "claude" && "Engine online, Claude reads the notice"}
          {healthState === "keyword-fallback" &&
            "Engine online, keyword fallback. Set ANTHROPIC_API_KEY so Claude can read dates and amounts."}
        </p>
        <Link className="db-back" href="/">
          Back to the story
        </Link>
      </header>

      <section className="db-banner">
        <img src="/films/signal-poster.jpg" alt="" aria-hidden="true" />
        <div className="db-banner-in">
          <h1>Check a SNAP notice</h1>
          <p>Paste or upload the letter that changed your benefits. ClaimGuard checks it against federal law.</p>
          <ul>
            <li>No account</li>
            <li>Nothing stored</li>
            <li>10 federal checks</li>
          </ul>
        </div>
      </section>

      <main className="db-work">
        <section className="db-notice" aria-labelledby="db-notice-h">
          <h2 id="db-notice-h" className="db-h2">
            The notice
          </h2>
          <div className="db-tabs" role="tablist" aria-label="How to add the notice">
            <button type="button" role="tab" aria-selected={mode === "paste"} onClick={() => setMode("paste")}>
              Paste text
            </button>
            <button type="button" role="tab" aria-selected={mode === "upload"} onClick={() => setMode("upload")}>
              Upload file
            </button>
          </div>
          <div className="db-samples">
            <span>Or try a sample:</span>
            <button type="button" onClick={() => loadSample("defective")}>
              Defective
            </button>
            <button type="button" onClick={() => loadSample("compliant")}>
              Compliant
            </button>
          </div>

          {mode === "paste" ? (
            <>
              <textarea
                className="db-paper"
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                placeholder="Paste the full text of your SNAP notice, including dates, amounts and the fine print."
                spellCheck={false}
                aria-label="Notice text"
              />
              <button
                type="button"
                className="db-run"
                disabled={busy || notice.trim().length < 20}
                onClick={() => {
                  setPdfName("");
                  run(notice);
                }}
              >
                {busy ? "Checking…" : "Check this notice"}
              </button>
            </>
          ) : (
            <label
              className="db-drop"
              data-over={dragOver ? "" : undefined}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
            >
              <input
                type="file"
                accept="application/pdf,.pdf,text/plain,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) handleFile(file);
                }}
              />
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 2.5H6.5v19h11V6zM14 2.5V6h3.5M12 17.5v-6M9.5 14l2.5-2.5 2.5 2.5" />
              </svg>
              {pdfName ? <b>{pdfName}</b> : <b>Drop the notice here, or choose a file</b>}
              <span>PDF up to 10 MB, or a .txt file. PDF text is read on the server.</span>
            </label>
          )}
          {fileError && (
            <p className="db-file-error" role="alert">
              {fileError}
            </p>
          )}
        </section>

        <section className="db-out" aria-live="polite" aria-busy={busy || checking} aria-label="Results">
          {!busy && !error && !result && (
            <div className="db-idle">
              <h2 className="db-h2">How it works</h2>
              <ol>
                <li>
                  <p>
                    <b>Add the notice.</b> Paste it, upload the PDF, or load a sample.
                  </p>
                </li>
                <li>
                  <p>
                    <b>Claude reads it.</b> Dates, amounts and appeal rights become structured fields.
                  </p>
                </li>
                <li>
                  <p>
                    <b>Ten federal rules check it.</b> Every defect comes with its citation and a next step.
                  </p>
                </li>
              </ol>
            </div>
          )}

          {busy && (
            <ol className="db-steps">
              <li data-s="done">Reading the notice</li>
              <li data-s="on">Claude is pulling out dates, amounts and appeal rights</li>
              <li>Checking 10 federal rules</li>
            </ol>
          )}

          {!busy && error && (
            <div className="db-verdict" data-v="error">
              <h2>The check didn’t run</h2>
              <p>{error}</p>
            </div>
          )}

          {!busy && result?.verdict === "extraction_error" && (
            <div className="db-verdict" data-v="error">
              <h2>This notice couldn’t be read</h2>
              <p>{text(result.extracted_fields.error) ?? "Try pasting the text instead."}</p>
            </div>
          )}

          {!busy && result && result.verdict !== "extraction_error" && (
            <>
              <div className="db-verdict" data-v={done ? result.verdict : "checking"}>
                {checking && <h2>Checking rule {shown + 1} of {total}</h2>}
                {done && result.verdict === "defects_found" && (
                  <>
                    <h2>
                      {result.defect_count} {result.defect_count === 1 ? "defect" : "defects"} found
                    </h2>
                    <p>
                      {result.critical_count} critical, {result.defect_count - result.critical_count}{" "}
                      {result.defect_count - result.critical_count === 1 ? "warning" : "warnings"}. You may have
                      grounds to request a fair hearing.
                    </p>
                  </>
                )}
                {done && result.verdict === "clean" && (
                  <>
                    <h2>No defects found</h2>
                    <p>This notice includes everything the ten federal rules require.</p>
                  </>
                )}
              </div>

              {done && defects.length > 0 && (
                <>
                  <h3 className="db-h3">Issues found</h3>
                  <ul className="db-issues">
                    {defects.map((r) => (
                      <li key={r.rule_id} data-s={r.severity}>
                        <p className="db-sev">{r.severity === "critical" ? "Critical" : "Warning"}</p>
                        <p className="db-issue">{r.defect_message}</p>
                        {r.action_hint && <p className="db-hint">{r.action_hint}</p>}
                        <code>
                          {r.citation} · {r.rule_id}
                        </code>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h3 className="db-h3">All checks ({total})</h3>
              <ul className="db-rules">
                {result.rule_results.slice(0, shown).map((r) => (
                  <li key={r.rule_id} data-s={r.passed ? "pass" : r.severity}>
                    <span className="db-mark" aria-hidden="true" />
                    <span className="db-sr">
                      {r.passed ? "Pass:" : r.severity === "critical" ? "Critical defect:" : "Warning:"}
                    </span>
                    <p>{r.description}</p>
                    <code>{r.citation}</code>
                  </li>
                ))}
              </ul>

              {done && (
                <>
                  <h3 className="db-h3">What the notice says</h3>
                  <dl className="db-fields">
                    {FIELD_ROWS.map(([label, get]) => {
                      const v = get(result.extracted_fields);
                      return (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd data-missing={v === null ? "" : undefined}>{v ?? "Not stated"}</dd>
                        </div>
                      );
                    })}
                  </dl>

                  {result.defect_count > 0 && (
                    <>
                      <h3 className="db-h3">Hearing request</h3>
                      {letter ? (
                        <div className="db-letter">
                          <textarea
                            value={letter}
                            onChange={(e) => setLetter(e.target.value)}
                            spellCheck={false}
                            aria-label="Hearing request letter"
                          />
                          <button type="button" className="db-run" onClick={copyLetter}>
                            {copied ? "Copied" : "Copy letter"}
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="db-note">
                            A draft letter to your state agency listing each defect and its citation. Edit it before
                            you send it.
                          </p>
                          <button type="button" className="db-run" onClick={() => setLetter(hearingRequest(result))}>
                            Draft a hearing request
                          </button>
                        </>
                      )}
                    </>
                  )}

                  <h3 className="db-h3">What to do next</h3>
                  <div className="db-next">
                    {NEXT_STEPS.map((s) => (
                      <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">
                        <b>{s.title}</b>
                        <span>{s.body}</span>
                      </a>
                    ))}
                  </div>

                  <button type="button" className="db-reset" onClick={reset}>
                    Check another notice
                  </button>
                </>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="db-foot">
        ClaimGuard is not a law firm and doesn’t give legal advice. Citations are for reference; check them with legal
        aid before a hearing. Nothing you paste is stored.
      </footer>
    </div>
  );
}
