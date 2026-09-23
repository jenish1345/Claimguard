# ClaimGuard — AI Health Claim Denial Defense & 360° Advocacy Ecosystem

**ClaimGuard** empowers patients to combat erroneous health insurance claim denials by combining deterministic OCR grounding, contract RAG discrepancy analysis, a plan-type legal gate, a sourced state prompt-pay statutory registry, and a 360° defense ecosystem (Visual Evidence, 1-Click Appeal Letter with PDF export, and a 4-Step Phone Negotiation Battle Card).

---

## Key Capabilities

### 1. Plan-Type Detector & Legal Preemption Gate
Before asserting any legal citations, ClaimGuard establishes whether ERISA or State Prompt-Pay law applies:
- **Employer Self-Funded (ASO / ERISA Only)**: Governed exclusively under ERISA § 503 (29 U.S.C. § 1133) and 29 C.F.R. § 2560.503-1. State prompt-pay penalties are preempted under ERISA § 514 (29 U.S.C. § 1144). Asserting state penalties on a self-funded plan undermines appeal credibility.
- **Employer Fully-Insured**: Both ERISA § 503 and State Department of Insurance Prompt-Pay statutes apply concurrently.
- **Individual / ACA Marketplace**: ERISA does *not* apply. Governed by ACA § 2719 (42 U.S.C. § 300gg-19) and State Insurance Code.
- **Government (Medicare / Medicaid / Tricare)**: Governed under CMS Title XVIII/XIX (42 CFR § 405.940 Redetermination / ALJ), not commercial prompt-pay laws.
- **Unknown / Unspecified**: Safe universal fallback to ACA § 2719 external review standards, strictly avoiding guessing specific state statutes.

### 2. Sourced Statutory Citation Module (Zero Hallucinations)
ClaimGuard maintains a verified lookup table of state prompt-pay and claim adjudication statutes:
- Includes exact citations (e.g. *Minn. Stat. § 62Q.75*, *Tex. Ins. Code § 1301.103*, *Cal. Ins. Code § 10123.13*), statutory penalty terms (e.g. *1.5% monthly interest penalty*), `last_verified` timestamps, and visible clickable links to official state legislature portals.
- **Strict Verification Rule**: If a user's state is not in the verified table, ClaimGuard displays *"Statutory penalty info not yet available for this state"* rather than fabricating one.

### 3. Phone Negotiation Battle Card (Verbal Defense)
Interactive 4-step call script with 1-click copy buttons per step:
1. **Opening & Representative Authentication**: Authenticate patient info and log rep name, ID, and call reference number.
2. **State Specific Error**: Cite exact Remark Code (e.g., CO-50) and cross-reference approved Prior Auth # and Policy Exception clauses.
3. **Supervisor / Level-2 Escalation**:
   - For ERISA plans: Cites ERISA § 1133 "Full and Fair Review" mandate, with plain-English coaching that it guarantees a clinical review process rather than an instant call-routing entitlement.
   - For Non-ERISA/Unknown: Frames supervisor escalation as an administrative negotiation tactic.
4. **Call Audit Trail & Timelines**: Live interactive call logging for Rep Name, Badge ID, Call Ref #, Supervisor Name, and Promised Resolution Deadlines.

### 4. 360° Defense Ecosystem
- **Visual Evidence**: Side-by-side Red/Green comparison between Denied EOB and Policy Contract with interactive grounded citation inspector.
- **Written Defense**: 1-Click Appeal Letter tailored to plan type, verified state statutes, and clinical evidence, with in-browser editing and clean PDF export.
- **Verbal Defense**: 4-Step Phone Battle Card with copy buttons and call documentation.

### 5. Persistent Legal-Accuracy Disclaimer
Unmissable disclaimer baked into every panel, preview, and PDF export:
> *"ClaimGuard is not a law firm and does not provide legal advice. Citations are provided for reference and should be verified before use in a formal appeal."*

### 6. Ethical Edge-Case Handling (Marcus T. — Valid Denial)
When analyzing contractually valid denials (e.g. elective cosmetic surgery without documented airway obstruction under Policy Section 9.1), ClaimGuard **ethically declines to generate an appeal letter**, providing alternative patient assistance pathways (cash discount negotiation, charity care, payment plans) instead of fabricating baseless claims.

---

## Running Locally

Serve the ClaimGuard web application:

```bash
# Direct HTTP Server
python3 -m http.server 8090
```

Open `http://localhost:8090` in your browser.
