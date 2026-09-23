/**
 * ClaimGuard — 360° Defense Ecosystem Controller
 */

let currentDatasetKey = "sarah_mri";
let currentDataset = null;
let currentPlanType = "employer_fully_insured";
let currentStateCode = "MN";
let currentTab = "visual";
let isEditMode = false;

// Call log state for Step 4 of the Battle Card
let callLogState = {
  repName: "",
  repBadgeId: "",
  callRefNumber: "",
  supervisorName: "",
  promisedDate: "",
  notes: ""
};

document.addEventListener("DOMContentLoaded", () => {
  populateStateDropdown();
  loadDataset("sarah_mri");
});

/**
 * Populate State Dropdown from Verified Statute Table
 */
function populateStateDropdown() {
  const select = document.getElementById("state-select");
  if (!select) return;

  const currentVal = select.value || "MN";
  let html = "";

  // Add all verified states sorted alphabetically
  const verifiedList = Object.values(window.VERIFIED_STATUTE_TABLE || {}).sort((a, b) => a.stateName.localeCompare(b.stateName));
  verifiedList.forEach(st => {
    html += `<option value="${st.stateCode}">${st.stateName} (${st.stateCode}) — Verified</option>`;
  });

  // Add unlisted state option
  html += `<option value="OTHER">Other / Unlisted State (No Statute)</option>`;
  select.innerHTML = html;
  select.value = currentVal;
}

/**
 * Load Dataset
 */
function loadDataset(key) {
  currentDatasetKey = key;
  currentDataset = window.CLAIM_DATASETS[key];
  if (!currentDataset) return;

  // Set default plan type & state from dataset if available
  currentPlanType = currentDataset.inferredPlanType || "employer_fully_insured";
  currentStateCode = currentDataset.stateCode || "MN";

  // Update UI selector dropdowns
  const planSelect = document.getElementById("plan-type-select");
  if (planSelect) planSelect.value = currentPlanType;

  const stateSelect = document.getElementById("state-select");
  if (stateSelect) stateSelect.value = currentStateCode;

  // Update demo preset buttons
  document.querySelectorAll(".demo-btn").forEach(btn => btn.classList.remove("active"));
  if (key === "sarah_mri") {
    const btn = document.getElementById("btn-demo-sarah");
    if (btn) btn.classList.add("active");
  } else if (key === "marcus_cosmetic") {
    const btn = document.getElementById("btn-demo-marcus");
    if (btn) btn.classList.add("active", "edge-case");
  }

  // Update Metrics
  const patient = currentDataset.patient;
  document.getElementById("metric-billed").textContent = formatCurrency(patient.patientResponsibility);
  document.getElementById("metric-sub-billed").textContent = `Billed for CPT ${patient.cptCode} (${patient.cptDescription.substring(0, 24)}...)`;
  
  const metricSavings = document.getElementById("metric-savings");
  metricSavings.textContent = formatCurrency(patient.potentialSavings);
  
  if (patient.status === "VALID_DENIAL") {
    metricSavings.style.color = "#94A3B8";
    document.getElementById("metric-sub-savings").textContent = "Valid Exclusion Applied";
    document.getElementById("metric-grounding").textContent = "100% Policy Grounded";
  } else {
    metricSavings.style.color = "#34D399";
    document.getElementById("metric-sub-savings").textContent = "100% In-Network Benefit";
    document.getElementById("metric-grounding").textContent = "100% Cited & Verified";
  }

  document.getElementById("metric-probability").textContent = patient.winProbability;
  document.getElementById("metric-sub-probability").textContent = patient.status === "ERRONEOUS_DENIAL" ? `Pre-Auth ${patient.priorAuthNumber} on File` : "Contractual Exclusion";

  // Update Status Banner
  const statusBanner = document.getElementById("status-banner");
  const statusBadge = document.getElementById("status-badge-icon");
  const statusHeadline = document.getElementById("status-headline");
  const statusDesc = document.getElementById("status-desc");

  if (patient.status === "ERRONEOUS_DENIAL") {
    statusBanner.className = "status-banner erroneous";
    statusBadge.textContent = "⚠️";
    statusHeadline.textContent = "Erroneous Claim Denial Detected (Payer Clearinghouse Error)";
    statusDesc.textContent = `ApexHealth cited Remark Code ${patient.denialCode} (${patient.denialCategory}), but valid Prior Authorization #${patient.priorAuthNumber} was approved on ${patient.priorAuthApprovedDate}. Full procedural coverage applies.`;
  } else {
    statusBanner.className = "status-banner valid";
    statusBadge.textContent = "⚖️";
    statusHeadline.textContent = "Valid Denial Verified (Policy Exclusion 9.1 Applies)";
    statusDesc.textContent = `CareShield correctly applied Exclusion 9.1 for elective cosmetic surgery (ICD-10 ${patient.icdCode}). No documented functional airway obstruction. Appeal generator ethically declined.`;
  }

  // Update Plan-Type & Jurisdiction UI
  updateJurisdictionUI();

  // Render Visual Diff
  renderDenialDocument(currentDataset.denialDocument);
  renderPolicyDocument(currentDataset.policyDocument);
  renderDiscrepancyBridge(currentDataset.mismatchAnalysis);

  // Render Written & Verbal Panels
  renderWrittenDefense();
  renderVerbalDefense();

  // Update Tab Badges & Warnings for Valid Denial
  updateTabStatus();
}

/**
 * Handle Plan Type Change
 */
function onPlanTypeChanged(planType) {
  currentPlanType = planType;
  updateJurisdictionUI();
  renderWrittenDefense();
  renderVerbalDefense();
}

/**
 * Handle State Jurisdiction Change
 */
function onStateChanged(stateCode) {
  currentStateCode = stateCode;
  updateJurisdictionUI();
  renderWrittenDefense();
  renderVerbalDefense();
}

/**
 * Update Jurisdiction & Sourced Statutory Lookup Card
 */
function updateJurisdictionUI() {
  const planInfo = window.PLAN_TYPES[currentPlanType] || window.PLAN_TYPES.unknown;
  const statuteInfo = window.VERIFIED_STATUTE_TABLE[currentStateCode];

  // Jurisdiction details
  const nameEl = document.getElementById("jurisdiction-name");
  const noteEl = document.getElementById("jurisdiction-note");
  if (nameEl) nameEl.textContent = `${planInfo.name} — ${planInfo.governingLaw}`;
  if (noteEl) noteEl.textContent = planInfo.preemptionNote;

  // Statute card elements
  const statuteBox = document.getElementById("statute-box-container");
  const statuteTitle = document.getElementById("statute-tag-title");
  const statuteDate = document.getElementById("statute-verified-date");
  const statutePenalty = document.getElementById("statute-penalty-text");
  const statuteLink = document.getElementById("statute-official-link");
  const statuteSourceBadge = document.getElementById("statute-source-badge");

  if (!planInfo.stateLawApplies && currentPlanType === "employer_self_funded") {
    statuteTitle.textContent = "ERISA Preemption Applies (29 U.S.C. § 1144)";
    statuteDate.textContent = "Federal DOL Mandate";
    statuteDate.style.color = "#93C5FD";
    statutePenalty.innerHTML = "<strong>State prompt-pay statutes do not apply.</strong> Governed strictly under Federal DOL ERISA claims regulations (29 C.F.R. § 2560.503-1). Asserting state prompt-pay penalties on a self-funded plan undermines appeal credibility.";
    statuteLink.style.display = "none";
    if (statuteSourceBadge) statuteSourceBadge.textContent = "Federal ERISA Jurisdiction";
  } else if (!planInfo.stateLawApplies && currentPlanType === "government_medicare_medicaid") {
    statuteTitle.textContent = "CMS Guidelines Apply (42 CFR § 405.940)";
    statuteDate.textContent = "Federal CMS Jurisdiction";
    statuteDate.style.color = "#93C5FD";
    statutePenalty.innerHTML = "<strong>Medicare / Medicaid regulations apply.</strong> Governed by CMS Redetermination and Administrative Law Judge (ALJ) review standards rather than commercial state prompt-pay laws.";
    statuteLink.style.display = "none";
    if (statuteSourceBadge) statuteSourceBadge.textContent = "CMS Federal Registry";
  } else if (currentPlanType === "unknown") {
    statuteTitle.textContent = "ACA § 2719 Universal Standard";
    statuteDate.textContent = "Universal Fallback";
    statuteDate.style.color = "#FCD34D";
    statutePenalty.innerHTML = "<strong>Plan type unverified.</strong> Defaulting safely to universal ACA § 2719 external review standards. No state prompt-pay penalty cited to prevent ungrounded statutory claims.";
    statuteLink.style.display = "none";
    if (statuteSourceBadge) statuteSourceBadge.textContent = "ACA Universal Fallback";
  } else if (statuteInfo) {
    statuteTitle.textContent = `${statuteInfo.statuteTitle} (${statuteInfo.lawName})`;
    statuteDate.textContent = `✓ Verified: ${statuteInfo.lastVerifiedDate}`;
    statuteDate.style.color = "#34D399";
    statutePenalty.innerHTML = `<strong>Sourced Penalty:</strong> ${statuteInfo.penaltyTerms} <br><span style="font-size:0.72rem; color:#94A3B8;">Verified from ${statuteInfo.verifierOrg}.</span>`;
    statuteLink.style.display = "inline-flex";
    statuteLink.href = statuteInfo.officialUrl;
    if (statuteSourceBadge) statuteSourceBadge.textContent = "ClaimGuard Verified Registry";
  } else {
    statuteTitle.textContent = "Statutory penalty info not yet available for this state";
    statuteDate.textContent = "Unverified State";
    statuteDate.style.color = "#F87171";
    statutePenalty.innerHTML = "<strong>Verified statutory citation not in database.</strong> ClaimGuard strictly avoids fabricating statute citations or penalty rates from memory. Defaulting to general ACA § 2719 appeal rights.";
    statuteLink.style.display = "none";
    if (statuteSourceBadge) statuteSourceBadge.textContent = "Statute Unlisted";
  }
}

/**
 * Tab Navigation Controller
 */
function switchEcosystemTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll(".ecosystem-tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".ecosystem-panel").forEach(p => p.classList.remove("active"));

  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  const activePanel = document.getElementById(`panel-${tabName}`);

  if (activeBtn) activeBtn.classList.add("active");
  if (activePanel) activePanel.classList.add("active");

  activePanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function updateTabStatus() {
  const isMarcus = currentDataset && currentDataset.patient.status === "VALID_DENIAL";
  const writtenBadge = document.getElementById("tab-badge-written");
  const verbalBadge = document.getElementById("tab-badge-verbal");

  if (isMarcus) {
    if (writtenBadge) {
      writtenBadge.textContent = "Declined";
      writtenBadge.style.background = "rgba(239, 68, 68, 0.2)";
      writtenBadge.style.color = "#F87171";
    }
    if (verbalBadge) {
      verbalBadge.textContent = "Hardship Guidance";
      verbalBadge.style.background = "rgba(245, 158, 11, 0.2)";
      verbalBadge.style.color = "#FBBF24";
    }
  } else {
    if (writtenBadge) {
      writtenBadge.textContent = "PDF Ready";
      writtenBadge.style.background = "rgba(59, 130, 246, 0.2)";
      writtenBadge.style.color = "#60A5FA";
    }
    if (verbalBadge) {
      verbalBadge.textContent = "4 Steps";
      verbalBadge.style.background = "rgba(16, 185, 129, 0.2)";
      verbalBadge.style.color = "#34D399";
    }
  }
}

/**
 * Render Left Pane Denial Document
 */
function renderDenialDocument(doc) {
  const container = document.getElementById("viewport-denial");
  document.getElementById("doc-title-denial").textContent = doc.title;
  document.getElementById("doc-meta-denial").textContent = `Date: ${doc.noticeDate}`;

  let html = "";
  doc.pages.forEach(page => {
    page.lines.forEach(line => {
      let highlightClass = "";
      if (line.isHighlight && line.highlightType === "denial") {
        highlightClass = "highlight-denial";
      }

      let citeHtml = "";
      if (line.citationId) {
        citeHtml = `<span class="inline-cite-chip" onclick="openCitation('${line.citationId}')" title="Click to inspect verified source">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Grounded [EOB L.${line.num}]
        </span>`;
      }

      html += `
        <div class="doc-line-row ${highlightClass}" id="denial-line-${line.num}">
          <span class="doc-line-num">${line.num}</span>
          <span class="doc-line-content">${escapeHtml(line.text)}${citeHtml}</span>
        </div>
      `;
    });
  });

  container.innerHTML = html;
}

/**
 * Render Right Pane Policy Document
 */
function renderPolicyDocument(doc) {
  const container = document.getElementById("viewport-policy");
  document.getElementById("doc-title-policy").textContent = doc.title;
  document.getElementById("doc-meta-policy").textContent = `Effective: ${doc.effectiveYear || '2026'}`;

  let html = "";
  doc.pages.forEach(page => {
    page.lines.forEach(line => {
      let highlightClass = "";
      if (line.isHighlight) {
        if (line.highlightType === "policy_rule") {
          highlightClass = "highlight-policy";
        } else if (line.highlightType === "policy_exception") {
          highlightClass = "highlight-policy-alt";
        }
      }

      let citeHtml = "";
      if (line.citationId) {
        citeHtml = `<span class="inline-cite-chip" onclick="openCitation('${line.citationId}')" title="Click to inspect verified source">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Policy § Clause
        </span>`;
      }

      html += `
        <div class="doc-line-row ${highlightClass}" id="policy-line-${line.num}">
          <span class="doc-line-num">${line.num}</span>
          <span class="doc-line-content">${escapeHtml(line.text)}${citeHtml}</span>
        </div>
      `;
    });
  });

  container.innerHTML = html;
}

/**
 * Render Center Discrepancy Bridge
 */
function renderDiscrepancyBridge(analysis) {
  const container = document.getElementById("bridge-discrepancy-container");
  const isMarcus = currentDataset && currentDataset.patient.status === "VALID_DENIAL";

  let html = `
    <div style="font-size: 0.76rem; color: #E2E8F0; line-height: 1.45; background: rgba(0,0,0,0.25); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
      <strong>Summary:</strong> ${escapeHtml(analysis.summary)}
    </div>
  `;

  analysis.discrepancyPoints.forEach((point, index) => {
    html += `
      <div class="discrepancy-card ${isMarcus ? 'valid-denial-card' : ''}">
        <div class="discrepancy-title">
          <span style="color: ${isMarcus ? '#FBBF24' : '#60A5FA'};">#${index + 1}</span>
          <span>${escapeHtml(point.title)}</span>
        </div>
        <div class="discrepancy-desc">${escapeHtml(point.detail)}</div>
        <div class="discrepancy-cites">
          ${point.denialCite ? `<button class="inline-cite-chip" onclick="openCitation('${point.denialCite}')">📍 Denial EOB Cite</button>` : ''}
          ${point.policyCite ? `<button class="inline-cite-chip" onclick="openCitation('${point.policyCite}')">📜 Policy Handbook Cite</button>` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Render Written Defense (1-Click Appeal Letter or Valid Denial Refusal)
 */
function renderWrittenDefense() {
  const container = document.getElementById("written-defense-content");
  if (!container || !currentDataset) return;

  const patient = currentDataset.patient;
  const planInfo = window.PLAN_TYPES[currentPlanType] || window.PLAN_TYPES.unknown;
  const statuteInfo = window.VERIFIED_STATUTE_TABLE[currentStateCode];

  // Case 1: Valid Denial (Marcus T. Edge Case)
  if (patient.status === "VALID_DENIAL") {
    container.innerHTML = `
      <div class="valid-denial-refusal-card">
        <div class="refusal-icon-badge">⚖️</div>
        <h3 class="refusal-title">Appeal Generation Ethically Declined</h3>
        <p class="refusal-subtitle">
          ClaimGuard verified that this claim was denied in accordance with <strong>CareShield Policy Section 9.1 (Cosmetic Surgery Exclusion)</strong>. 
          Generating a legal appeal without documented structural airway obstruction would be contractually baseless.
        </p>

        <div class="refusal-reasons-box">
          <div class="refusal-reason-item">
            <span class="reason-bullet">✓</span>
            <div><strong>Exclusion Verified:</strong> ICD-10 Z41.1 is strictly excluded unless accompanied by documented internal nasal valve collapse or severe septal deviation.</div>
          </div>
          <div class="refusal-reason-item">
            <span class="reason-bullet">✓</span>
            <div><strong>Grounding Standard:</strong> ClaimGuard never generates frivolous or hallucinated legal challenges for legitimate contractual exclusions.</div>
          </div>
        </div>

        <div class="alternative-pathways-section">
          <h4 class="alt-heading">Recommended Patient Assistance Pathways (Non-Appeal):</h4>
          <div class="alt-grid">
            ${(currentDataset.validDenialAlternatives || []).map(alt => `
              <div class="alt-card">
                <div class="alt-title">${escapeHtml(alt.title)}</div>
                <div class="alt-desc">${escapeHtml(alt.desc)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Case 2: Erroneous Denial (Sarah Miller)
  let statutoryParagraph = `3. STATUTORY COMPLIANCE & LEGAL BASIS:\n${planInfo.legalBasisText}\n`;
  if (planInfo.stateLawApplies && statuteInfo) {
    statutoryParagraph += `Furthermore, pursuant to ${statuteInfo.statuteTitle} (${statuteInfo.lawName}), clean uncontested claims must be re-adjudicated within statutory deadlines. Failure to process clean claims subjects the insurer to ${statuteInfo.penaltyTerms.toLowerCase()} (verified from ${statuteInfo.verifierOrg} on ${statuteInfo.lastVerifiedDate}).\n`;
  } else if (currentPlanType === "employer_self_funded") {
    statutoryParagraph += `Please note that as an Employer Self-Funded Plan governed by ERISA § 503, the Plan Administrator is subject to direct Department of Labor enforcement for failure to provide full and fair review of pre-authorized diagnostic procedures.\n`;
  } else if (currentPlanType === "unknown") {
    statutoryParagraph += `In accordance with Section 2719 of the Public Health Service Act (ACA § 2719), the patient asserts full rights to internal review and independent external review.\n`;
  }

  const badgeText = planInfo.stateLawApplies && statuteInfo 
    ? `${planInfo.shortName} + ${statuteInfo.statuteTitle}`
    : `${planInfo.shortName}`;
  const writtenBadge = document.getElementById("written-statute-badge");
  if (writtenBadge) writtenBadge.textContent = badgeText;

  const letterText = `DATE: September 22, 2026

VIA CERTIFIED MAIL & ELECTRONIC CLAIMS PORTAL

TO:
ApexHealth Assurance Premier PPO
Claims Appeals & Grievances Department
P.O. Box 9043, Minneapolis, MN 55440

RE: FORMAL FIRST-LEVEL CLAIM APPEAL — EXPEDITED REVIEW REQUESTED
Patient Name: ${patient.name}
Member ID: ${patient.memberId} | Group #: ${patient.groupNumber}
Claim #: ${patient.claimNumber} | Date of Service: ${patient.dateOfService}
Billed Procedure: CPT ${patient.cptCode} (${patient.cptDescription}) — Total Billed: ${formatCurrency(patient.totalBilled)}
Plan Classification: ${planInfo.name}

LEGAL ACCURACY DISCLAIMER:
ClaimGuard is not a law firm and does not provide legal advice. Citations are provided for reference and should be verified before use in a formal appeal.

To the Claims Appeals Committee:

I am writing on behalf of ${patient.name} to formally appeal the adverse benefit determination dated August 28, 2026 regarding Claim #${patient.claimNumber}.

1. BASIS OF ERRONEOUS DENIAL:
The Explanation of Benefits cites Remark Code ${patient.denialCode}, asserting that "no prior authorization approval was submitted" and referencing a failure to satisfy conservative therapy guidelines.

2. FACTUAL & CONTRACTUAL REFUTATION:
a) Prior Authorization Was Formally Approved on File: Prior Authorization #${patient.priorAuthNumber} was issued and approved by ApexHealth Utilization Management on ${patient.priorAuthApprovedDate} for the exact procedure performed by ${patient.orderingPhysician}. A true and complete copy of the Authorization Certificate is attached.

b) Express Policy Clause Violation: Under Section 4.2.b of the ApexHealth Comprehensive PPO Benefit Handbook, "When prior authorization has been formally granted and assigned an active Authorization Reference ID... the claim shall not be denied under CO-50 medical necessity guidelines." Furthermore, Section 4.2.c explicitly waives conservative physical therapy requirements for diagnosed structural internal derangement / Meniscal Tears (ICD-10 ${patient.icdCode}).

${statutoryParagraph}
4. REQUESTED ACTION:
We respectfully request immediate electronic re-adjudication of Claim #${patient.claimNumber} as an in-network covered diagnostic service in accordance with the master policy schedule within thirty (30) calendar days.

Sincerely,

${patient.name} (Member ID: ${patient.memberId})
Prepared with automated assistance from ClaimGuard Patient Defense Engine

ATTACHMENTS:
1. Copy of EOB Denial Notice (Claim #${patient.claimNumber})
2. ApexHealth Prior Authorization Certificate (#${patient.priorAuthNumber})
3. Excerpt of ApexHealth Benefit Handbook (Section 4.2.a through 4.2.c)
4. Attending Physician Referral & Clinical Notes from ${patient.orderingPhysician}`;

  container.innerHTML = `
    <!-- Persistent Legal Disclaimer (Unmissable) -->
    <div class="legal-disclaimer-card">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" style="flex-shrink: 0;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <div>
        <strong>LEGAL ACCURACY DISCLAIMER:</strong>
        <span>ClaimGuard is not a law firm and does not provide legal advice. Citations are provided for reference and should be verified before use in a formal appeal.</span>
      </div>
    </div>

    <div class="written-toolbar">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: #FFFFFF;">Formal Claim Appeal Notice</span>
        <span class="gate-badge" id="written-statute-badge">${badgeText}</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button id="btn-edit-letter" class="btn-secondary" onclick="toggleEditAppealLetter()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <span id="btn-edit-text">Edit Appeal Text</span>
        </button>
        <button class="btn-secondary" onclick="copyAppealLetter()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Copy Full Letter</span>
        </button>
        <button class="btn-primary" onclick="exportAppealPDF()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          <span>Download PDF / Print</span>
        </button>
      </div>
    </div>

    <div class="formal-letter-paper" id="appeal-letter-container">
      <div class="letter-header-grid">
        <div>
          <div class="letter-brand">CLAIM DEFENSE APPEAL NOTICE</div>
          <div style="font-size: 0.75rem; color: #64748B;">Prepared via ClaimGuard Patient Advocacy Engine</div>
        </div>
        <div style="text-align: right; font-size: 0.8rem; color: #475569;">
          <div><strong>Filing Status:</strong> Level 1 Internal Appeal</div>
          <div><strong>Expedited Response Deadline:</strong> 30 Days</div>
        </div>
      </div>

      <div id="appeal-letter-readonly" class="letter-content-text">${escapeHtml(letterText)}</div>
      <textarea id="appeal-letter-editable" class="letter-content-editable" style="display: none;">${escapeHtml(letterText)}</textarea>

      <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #CBD5E1; font-size: 0.75rem; color: #64748B;">
        <strong>Notice:</strong> This document was prepared with automated assistance from ClaimGuard. All underlying clinical records, pre-authorization certificates, and policy citations must be attached with submission.
      </div>
    </div>
  `;
}

/**
 * Render Verbal Defense (4-Step Phone Battle Card + Interactive Call Log)
 */
function renderVerbalDefense() {
  const container = document.getElementById("verbal-defense-content");
  if (!container || !currentDataset) return;

  const patient = currentDataset.patient;
  const planInfo = window.PLAN_TYPES[currentPlanType] || window.PLAN_TYPES.unknown;
  const statuteInfo = window.VERIFIED_STATUTE_TABLE[currentStateCode];

  // Case 1: Valid Denial (Marcus T.)
  if (patient.status === "VALID_DENIAL") {
    container.innerHTML = `
      <div class="valid-denial-refusal-card">
        <div class="refusal-icon-badge">📞</div>
        <h3 class="refusal-title">Phone Negotiation: Hardship & Fee Schedule Script</h3>
        <p class="refusal-subtitle">
          Because this cosmetic procedure was legitimately excluded under Policy Section 9.1, do not demand insurance re-adjudication. Use this <strong>Provider Billing Negotiation Script</strong> instead.
        </p>

        <div class="battle-card-step-box" style="margin-top: 1.5rem;">
          <div class="step-meta-row">
            <span class="step-number-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor" stroke="none" font-weight="bold">1</text></svg>
              Step 1: Call Provider Billing Office for Cash Discount
            </span>
            <button class="btn-secondary" onclick="copyText('Hi, I am calling regarding my recent procedure with Dr. Lisa Vance (Account #${patient.claimNumber}). Because my insurer excluded cosmetic coverage, I am paying directly out of pocket. What is your standard prompt-pay cash discount rate for self-pay patients?')" style="padding: 3px 10px; font-size: 0.72rem;">
              Copy Step Dialogue
            </button>
          </div>
          <div class="step-dialogue-box">
            "Hi, I am calling regarding my recent procedure with Dr. Lisa Vance (Account #${patient.claimNumber}). Because my insurer excluded cosmetic coverage, I am paying directly out of pocket. What is your standard prompt-pay cash discount rate for self-pay patients?"
          </div>
          <div class="step-coach-note">
            <strong>💡 Negotiation Tip:</strong> Providers routinely offer 30% to 50% cash discounts for immediate self-pay settlements to avoid collection agency commissions.
          </div>
        </div>

        <div class="battle-card-step-box" style="margin-top: 1rem;">
          <div class="step-meta-row">
            <span class="step-number-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor" stroke="none" font-weight="bold">2</text></svg>
              Step 2: Request 12-Month Zero-Interest Installment Plan
            </span>
            <button class="btn-secondary" onclick="copyText('I would like to set up a monthly payment arrangement of $75/month for the remaining balance. Can you please confirm this will be at 0% interest with no credit reporting?')" style="padding: 3px 10px; font-size: 0.72rem;">
              Copy Step Dialogue
            </button>
          </div>
          <div class="step-dialogue-box">
            "I would like to set up a monthly payment arrangement of $75/month for the remaining balance. Can you please confirm this will be at 0% interest with no credit reporting?"
          </div>
          <div class="step-coach-note">
            <strong>💡 Negotiation Tip:</strong> Always secure written confirmation that payments are 0% interest before making the first installment.
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Case 2: Erroneous Denial (Sarah Miller)
  // Step 3 dialogue based on ERISA vs Non-ERISA
  let step3Dialogue = "";
  let step3Coach = "";

  if (planInfo.erisaApplies) {
    step3Dialogue = `Under ERISA Section 503 (29 U.S.C. § 1133), plan administrators and TPAs are required to conduct a full and fair review of active pre-authorizations on record. Because your front-desk system failed to match approved Authorization #PA-884920, please escalate this call immediately to a Level-2 Claims Appeals Supervisor or Clinical Appeals Specialist.`;
    step3Coach = `Legal Framing: ERISA 29 U.S.C. § 1133 guarantees a full and fair review process of all submitted records by an appropriate clinical peer who was not involved in the initial adverse determination — it guarantees a thorough procedural review process, not a specific call-routing demand. Frame supervisor transfer as standard procedural compliance.`;
  } else {
    step3Dialogue = `I am requesting an immediate electronic re-adjudication of this claim as a clean in-network service. If you cannot override this clearinghouse error directly at your desk, please escalate this call to a Level-2 Claims Resolution Supervisor.`;
    step3Coach = `Negotiation Tactic: Frontline customer service representatives frequently lack the clearinghouse permissions to overturn automated CO-50 rejections. Asking calmly for a supervisor is a standard, highly effective administrative negotiation technique.`;
  }

  // Step 4 dialogue based on State Law
  let step4Dialogue = `Please provide your full first name, representative badge ID, and the unique call reference number for this recording. What is the exact expected date for electronic re-adjudication?`;
  if (planInfo.stateLawApplies && statuteInfo) {
    step4Dialogue = `Please provide your representative ID and the call tracking number. Please note on the file that under ${statuteInfo.statuteTitle} (${statuteInfo.lawName}), clean undisputed claims are subject to a mandatory ${statuteInfo.penaltySummary} if not settled within statutory deadlines. What is the exact date this will be re-processed?`;
  }

  const steps = [
    {
      num: 1,
      label: "Opening & Representative Authentication",
      dialogue: `Hi, I am calling regarding Claim #${patient.claimNumber} for ${patient.name} (DOB: ${patient.dob}, Member ID: ${patient.memberId}, Group #: ${patient.groupNumber}). Please open the file and confirm you are viewing the Explanation of Benefits for Date of Service ${patient.dateOfService}. Also, please provide your full first name and representative ID number.`,
      coach: "Verify the representative is looking at the exact claim number before giving any clinical details."
    },
    {
      num: 2,
      label: "State the Specific Clearinghouse Error",
      dialogue: `The claim was denied under Remark Code CO-50 asserting 'missing prior authorization'. This is a clearinghouse indexing error. Please check your Utilization Management portal for Prior Authorization #${patient.priorAuthNumber} approved on ${patient.priorAuthApprovedDate} by Dr. Robert Chen. Under Policy Section 4.2.c, conservative therapy is explicitly waived for ICD-10 ${patient.icdCode}.`,
      coach: "Provide the exact Prior Authorization Reference Number so the rep can cross-index the utilization management system."
    },
    {
      num: 3,
      label: "Request Supervisor / Level-2 Review",
      dialogue: step3Dialogue,
      coach: step3Coach
    },
    {
      num: 4,
      label: "Document Call Reference & Timelines",
      dialogue: step4Dialogue,
      coach: "Always log the representative's name, badge ID, call reference number, and promised resolution date in the call audit box below."
    }
  ];

  container.innerHTML = `
    <!-- Persistent Legal Disclaimer -->
    <div class="legal-disclaimer-card">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" style="flex-shrink: 0;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <div>
        <strong>LEGAL ACCURACY DISCLAIMER:</strong>
        <span>ClaimGuard is not a law firm and does not provide legal advice. Phone scripts are negotiation tactics to assist patient advocacy.</span>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
      <div>
        <h3 style="font-size: 1.1rem; font-weight: 800; color: #FFFFFF;">4-Step Insurer Phone Battle Card</h3>
        <p style="font-size: 0.8rem; color: var(--text-light-muted);">Interactive verbal negotiation dialogue with Level-2 supervisor escalation & statutory prompt-pay grounding.</p>
      </div>
      <button class="btn-secondary" onclick="copyFullCallScript()" style="font-size: 0.75rem; padding: 6px 12px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <span>Copy Complete 4-Step Script</span>
      </button>
    </div>

    <div id="phone-steps-list" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
      ${steps.map(s => `
        <div class="battle-card-step-box">
          <div class="step-meta-row">
            <span class="step-number-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor" stroke="none" font-weight="bold">${s.num}</text></svg>
              Step ${s.num}: ${escapeHtml(s.label)}
            </span>
            <button class="btn-secondary" onclick="copyStepText(${s.num})" style="padding: 3px 10px; font-size: 0.72rem;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>Copy Step ${s.num}</span>
            </button>
          </div>
          <div class="step-dialogue-box" id="step-dialogue-${s.num}">
            "${escapeHtml(s.dialogue)}"
          </div>
          <div class="step-coach-note">
            <strong>💡 Coaching Tip:</strong> ${escapeHtml(s.coach)}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Step 4 Real-Time Call Documentation Log -->
    <div class="call-log-audit-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 1rem;">📝</span>
          <span style="font-size: 0.9rem; font-weight: 700; color: #FFFFFF;">Live Call Documentation Audit Trail</span>
        </div>
        <button class="btn-secondary" onclick="copyCallAuditLog()" style="padding: 4px 10px; font-size: 0.72rem;">
          <span>Copy Call Log Notes</span>
        </button>
      </div>

      <div class="call-log-grid">
        <div class="log-field-group">
          <label class="log-field-label">Representative Name:</label>
          <input type="text" class="log-input" id="log-rep-name" placeholder="e.g. Marcus / Sarah" value="${escapeHtml(callLogState.repName)}" oninput="callLogState.repName=this.value">
        </div>
        <div class="log-field-group">
          <label class="log-field-label">Representative Badge ID:</label>
          <input type="text" class="log-input" id="log-rep-id" placeholder="e.g. APX-88219" value="${escapeHtml(callLogState.repBadgeId)}" oninput="callLogState.repBadgeId=this.value">
        </div>
        <div class="log-field-group">
          <label class="log-field-label">Call Reference / Tracking #:</label>
          <input type="text" class="log-input" id="log-call-ref" placeholder="e.g. REF-20260922-901" value="${escapeHtml(callLogState.callRefNumber)}" oninput="callLogState.callRefNumber=this.value">
        </div>
        <div class="log-field-group">
          <label class="log-field-label">Level-2 Supervisor Name:</label>
          <input type="text" class="log-input" id="log-supervisor" placeholder="e.g. Supervisor Jennifer K." value="${escapeHtml(callLogState.supervisorName)}" oninput="callLogState.supervisorName=this.value">
        </div>
        <div class="log-field-group" style="grid-column: span 2;">
          <label class="log-field-label">Promised Action & Resolution Date:</label>
          <input type="text" class="log-input" id="log-promised" placeholder="e.g. Clearinghouse override submitted; re-adjudication check expected by Oct 6, 2026" value="${escapeHtml(callLogState.promisedDate)}" oninput="callLogState.promisedDate=this.value">
        </div>
      </div>
    </div>
  `;
}

/**
 * Open Citation Inspector Modal
 */
function openCitation(citationId) {
  if (!currentDataset || !currentDataset.mismatchAnalysis) return;
  const citation = currentDataset.mismatchAnalysis.citations.find(c => c.id === citationId);
  if (!citation) return;

  document.getElementById("cite-modal-title").textContent = `Grounded Evidence: ${citation.tag}`;
  document.getElementById("cite-modal-location").textContent = `${citation.sourceDoc} — ${citation.location}`;
  document.getElementById("cite-modal-quote").textContent = `"${citation.exactQuote}"`;
  document.getElementById("cite-modal-source").textContent = citation.sourceDoc;
  document.getElementById("cite-modal-method").textContent = citation.groundingMethod;

  const drawer = document.getElementById("citation-drawer");
  if (drawer) drawer.classList.add("active");
}

function closeCitationDrawer() {
  const drawer = document.getElementById("citation-drawer");
  if (drawer) drawer.classList.remove("active");
}

function closeCitationDrawerOnBackdrop(e) {
  if (e.target.id === "citation-drawer") {
    closeCitationDrawer();
  }
}

/**
 * Edit & Copy Handlers for Written Appeal
 */
function toggleEditAppealLetter() {
  isEditMode = !isEditMode;
  const readonlyEl = document.getElementById("appeal-letter-readonly");
  const editableEl = document.getElementById("appeal-letter-editable");
  const btnText = document.getElementById("btn-edit-text");

  if (isEditMode) {
    editableEl.value = readonlyEl.textContent;
    readonlyEl.style.display = "none";
    editableEl.style.display = "block";
    btnText.textContent = "Done Editing";
  } else {
    readonlyEl.textContent = editableEl.value;
    editableEl.style.display = "none";
    readonlyEl.style.display = "block";
    btnText.textContent = "Edit Appeal Text";
  }
}

function copyAppealLetter() {
  const readonlyEl = document.getElementById("appeal-letter-readonly");
  const editableEl = document.getElementById("appeal-letter-editable");
  const text = isEditMode && editableEl ? editableEl.value : (readonlyEl ? readonlyEl.textContent : "");
  copyText(text, "Appeal Letter copied to clipboard!");
}

function copyStepText(stepNum) {
  const el = document.getElementById(`step-dialogue-${stepNum}`);
  if (el) {
    const text = el.textContent.trim().replace(/^"|"$/g, '');
    copyText(text, `Step ${stepNum} dialogue copied!`);
  }
}

function copyFullCallScript() {
  const patient = currentDataset ? currentDataset.patient : null;
  if (!patient) return;

  let fullScript = `=== CLAIMGUARD 4-STEP PHONE BATTLE CARD ===\nPatient: ${patient.name} | Claim #: ${patient.claimNumber} | DOS: ${patient.dateOfService}\n\n`;
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`step-dialogue-${i}`);
    if (el) {
      fullScript += `STEP ${i}:\n${el.textContent.trim().replace(/^"|"$/g, '')}\n\n`;
    }
  }
  copyText(fullScript, "Full 4-Step Call Script copied to clipboard!");
}

function copyCallAuditLog() {
  const patient = currentDataset ? currentDataset.patient : null;
  const logText = `=== CLAIMGUARD CALL AUDIT TRAIL ===
Date/Time: ${new Date().toLocaleString()}
Patient: ${patient ? patient.name : 'N/A'} (Claim #${patient ? patient.claimNumber : 'N/A'})
Representative Name: ${callLogState.repName || 'Not recorded'}
Representative Badge ID: ${callLogState.repBadgeId || 'Not recorded'}
Call Reference #: ${callLogState.callRefNumber || 'Not recorded'}
Supervisor Name: ${callLogState.supervisorName || 'Not recorded'}
Promised Action & Date: ${callLogState.promisedDate || 'Not recorded'}
`;
  copyText(logText, "Call Audit Trail copied to clipboard!");
}

function copyText(text, successMsg = "Copied to clipboard!") {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg);
  }).catch(() => {
    showToast("Copied to clipboard!");
  });
}

function showToast(msg) {
  const existing = document.getElementById("app-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "app-toast";
  toast.className = "app-toast";
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

function exportAppealPDF() {
  window.print();
}

/**
 * Upload Simulation
 */
function toggleUploadStudio() {
  const panel = document.getElementById("upload-panel");
  if (!panel) return;
  panel.classList.toggle("active");
  if (panel.classList.contains("active")) {
    panel.scrollIntoView({ behavior: "smooth" });
  }
}

function simulateUpload(type) {
  const fileName = type === "denial" ? "Sarah_Denial_Notice_EOB_Aug2026.pdf" : "ApexHealth_Benefit_Booklet_2026.pdf";
  showToast(`Uploaded ${fileName} — OCR & RAG Alignment Complete!`);
  loadDataset("sarah_mri");
  const panel = document.getElementById("upload-panel");
  if (panel) panel.classList.remove("active");
  switchEcosystemTab("visual");
}

/**
 * Utilities
 */
function formatCurrency(num) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num || 0);
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
