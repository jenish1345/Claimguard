/**
 * ClaimGuard — Verified Data Engine, Plan Types, Statutory Table, & Grounding Models
 */

const LEGAL_DISCLAIMER_TEXT = "ClaimGuard is not a law firm and does not provide legal advice. Citations are provided for reference and should be verified before use in a formal appeal.";

const PLAN_TYPES = {
  employer_self_funded: {
    id: "employer_self_funded",
    name: "Employer Self-Funded (ASO / ERISA Only)",
    shortName: "Self-Funded (ERISA)",
    governingLaw: "ERISA 29 U.S.C. § 1133 (Section 503) & Federal DOL Guidelines",
    stateLawApplies: false,
    erisaApplies: true,
    preemptionNote: "State insurance prompt-pay statutes are preempted under ERISA § 514 (29 U.S.C. § 1144). Remedies are governed exclusively by Federal ERISA claims procedure regulations (29 C.F.R. § 2560.503-1). Asserting state prompt-pay penalties on a self-funded plan undermines appeal credibility.",
    legalBasisText: "Pursuant to Section 503 of the Employee Retirement Income Security Act of 1974 (ERISA, 29 U.S.C. § 1133) and 29 C.F.R. § 2560.503-1, plan administrators and their third-party administrators (TPAs) are legally obligated to provide a full and fair review that takes into account all comments, documents, and clinical records submitted by the claimant.",
    battleCardNote: "State prompt-pay statutes do not apply due to ERISA preemption. Demand Level-2 compliance under ERISA § 1133 'full and fair review' regulations.",
    erisaExplanation: "ERISA 29 U.S.C. § 1133 guarantees a full and fair review process of all submitted records by an appropriate clinical peer who was not involved in the initial denial — it guarantees a thorough procedural review process, not a specific call-routing demand."
  },
  employer_fully_insured: {
    id: "employer_fully_insured",
    name: "Employer Fully-Insured Group Policy (ERISA + State Law)",
    shortName: "Fully-Insured Group",
    governingLaw: "ERISA § 503 + State Insurance Department Prompt-Pay Statutes",
    stateLawApplies: true,
    erisaApplies: true,
    preemptionNote: "Both ERISA procedural rights (29 U.S.C. § 1133) and State Department of Insurance prompt-pay statutes apply concurrently to commercial insurance carriers.",
    legalBasisText: "Pursuant to ERISA Section 503 (29 U.S.C. § 1133) and applicable State Insurance Prompt Payment and Claims Adjudication Statutes, the commercial carrier is legally required to maintain procedural compliance and prompt claim re-adjudication.",
    battleCardNote: "Both ERISA § 1133 procedural standards and State Prompt-Pay interest penalties apply concurrently to this commercial insurer.",
    erisaExplanation: "ERISA 29 U.S.C. § 1133 guarantees a full and fair review process of all submitted records by an appropriate clinical peer who was not involved in the initial adverse determination."
  },
  individual_marketplace: {
    id: "individual_marketplace",
    name: "Individual / ACA Marketplace Exchange (State Law Only)",
    shortName: "ACA Marketplace / Individual",
    governingLaw: "ACA § 2719 (42 U.S.C. § 300gg-19) & State Insurance Mandates",
    stateLawApplies: true,
    erisaApplies: false,
    preemptionNote: "ERISA does NOT apply to individual or state exchange policies. Asserting ERISA rights on this policy is legally incorrect. Enforcement is governed by ACA § 2719 and the State Department of Insurance.",
    legalBasisText: "Pursuant to Section 2719 of the Public Health Service Act (42 U.S.C. § 300gg-19) and State Insurance Code provisions governing prompt adjudication and external independent review.",
    battleCardNote: "ERISA does not apply to this individual policy. Cite ACA § 2719 external review rights and state prompt-pay statutory interest penalties.",
    erisaExplanation: null
  },
  government_medicare_medicaid: {
    id: "government_medicare_medicaid",
    name: "Government Plan (Medicare / Medicaid / Tricare)",
    shortName: "Medicare / Medicaid / Tricare",
    governingLaw: "CMS Title XVIII / Title XIX Guidelines (42 CFR Part 405 / 438)",
    stateLawApplies: false,
    erisaApplies: false,
    preemptionNote: "Neither ERISA nor commercial state prompt-pay laws apply. Governed strictly under CMS statutory administrative law judges (ALJ), Medicare Redetermination (42 CFR § 405.940), or State Medicaid Fair Hearing regulations.",
    legalBasisText: "Pursuant to Centers for Medicare & Medicaid Services (CMS) Redetermination guidelines under 42 CFR § 405.940 et seq., the Medicare Administrative Contractor (MAC) is required to re-examine all medical necessity records and pre-authorizations.",
    battleCardNote: "Commercial ERISA and state prompt-pay rules do not apply. Reference Medicare Redetermination Form CMS-20027 and 60-day MAC decision deadlines.",
    erisaExplanation: null
  },
  unknown: {
    id: "unknown",
    name: "Plan Type Unknown / Not Specified (ACA § 2719 Default)",
    shortName: "General Appeal Rights",
    governingLaw: "ACA § 2719 Universal Internal & External Review Framework",
    stateLawApplies: false,
    erisaApplies: false,
    preemptionNote: "Plan classification unverified. Defaulting safely to universal ACA § 2719 internal/external review standards to prevent ungrounded statutory assertions.",
    legalBasisText: "Pursuant to universal patient protections under Section 2719 of the Public Health Service Act (42 U.S.C. § 300gg-19) governing internal claims and external independent review processes.",
    battleCardNote: "Plan structure unverified. Rely on standard administrative escalation, factual pre-auth refutation, and universal ACA § 2719 appeal rights.",
    erisaExplanation: null
  }
};

const VERIFIED_STATUTE_TABLE = {
  MN: {
    stateCode: "MN",
    stateName: "Minnesota",
    statuteTitle: "Minn. Stat. § 62Q.75",
    lawName: "Minnesota Prompt Payment of Health Claims Act",
    penaltyTerms: "Mandatory 1.5% monthly interest penalty accrued on clean claims not paid or re-adjudicated within 30 days.",
    penaltySummary: "1.5% monthly penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-06-15",
    officialUrl: "https://www.revisor.mn.gov/statutes/cite/62Q.75",
    verifierOrg: "Minnesota Office of the Revisor of Statutes"
  },
  CA: {
    stateCode: "CA",
    stateName: "California",
    statuteTitle: "Cal. Ins. Code § 10123.13 / Cal. Health & Safety § 1371",
    lawName: "California Knox-Keene & Commercial Insurance Prompt Pay Standard",
    penaltyTerms: "Mandatory 15% per annum interest penalty on uncontested clean claims not settled within 30 business days (45 for HMOs).",
    penaltySummary: "15% annual penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-05-20",
    officialUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=10123.13.&lawCode=INS",
    verifierOrg: "California State Legislature Official Legal Information"
  },
  TX: {
    stateCode: "TX",
    stateName: "Texas",
    statuteTitle: "Tex. Ins. Code § 1301.103 & § 1301.137 / § 542.057",
    lawName: "Texas Prompt Pay Act for Clean Claims",
    penaltyTerms: "Graduated statutory penalty up to 18% per annum plus mandatory reasonable attorney fees on delinquent clean claims.",
    penaltySummary: "Up to 18% annual penalty + attorney fees",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-04-10",
    officialUrl: "https://statutes.capitol.texas.gov/Docs/IN/htm/IN.1301.htm",
    verifierOrg: "Texas Legislature Online Official Statutes"
  },
  NY: {
    stateCode: "NY",
    stateName: "New York",
    statuteTitle: "N.Y. Ins. Law § 3224-a",
    lawName: "New York Comprehensive Prompt Pay Law",
    penaltyTerms: "Mandatory 12% per annum interest penalty on claims not paid or adjudicated within 30 days of electronic submission.",
    penaltySummary: "12% annual penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-06-01",
    officialUrl: "https://www.nysenate.gov/legislation/laws/ISC/3224-A",
    verifierOrg: "New York State Senate Legislative Portal"
  },
  FL: {
    stateCode: "FL",
    stateName: "Florida",
    statuteTitle: "Fla. Stat. § 627.6131",
    lawName: "Florida Health Claims Payment & Timeliness Standard",
    penaltyTerms: "Mandatory 10% annual interest penalty for uncontested claims overdue past 45 calendar days.",
    penaltySummary: "10% annual penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-03-18",
    officialUrl: "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&Search_String=&URL=0600-0699/0627/Sections/0627.6131.html",
    verifierOrg: "The Florida Senate Official Statutes"
  },
  IL: {
    stateCode: "IL",
    stateName: "Illinois",
    statuteTitle: "215 ILCS 5/368a",
    lawName: "Illinois Health Care Services Prompt Pay Act",
    penaltyTerms: "Mandatory 9% annual interest penalty accrued daily on overdue undisputed claims past 30 days.",
    penaltySummary: "9% annual penalty (accrued daily)",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-05-02",
    officialUrl: "https://www.ilga.gov/legislation/ilcs/documents/021500050K368a.htm",
    verifierOrg: "Illinois General Assembly Legislative Reference"
  },
  PA: {
    stateCode: "PA",
    stateName: "Pennsylvania",
    statuteTitle: "40 P.S. § 991.2166 (Act 68)",
    lawName: "Pennsylvania Quality Health Care Accountability & Prompt Pay Act",
    penaltyTerms: "Mandatory 10% annual interest penalty on clean claims not paid within 45 days of receipt.",
    penaltySummary: "10% annual penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-04-15",
    officialUrl: "https://www.legis.state.pa.us/cfdocs/legis/LI/consCheck.cfm?txtType=HTM&ttl=40&div=0&chpt=9&sctn=2166&subsctn=0",
    verifierOrg: "Pennsylvania General Assembly Official Statutes"
  },
  OH: {
    stateCode: "OH",
    stateName: "Ohio",
    statuteTitle: "Ohio Rev. Code § 3901.381",
    lawName: "Ohio Prompt Payment of Health Benefit Claims Statute",
    penaltyTerms: "Mandatory 18% annual interest penalty on clean claims not paid or processed within 30 days.",
    penaltySummary: "18% annual penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-05-12",
    officialUrl: "https://codes.ohio.gov/ohio-revised-code/section-3901.381",
    verifierOrg: "Ohio Laws and Administrative Rules"
  },
  WA: {
    stateCode: "WA",
    stateName: "Washington",
    statuteTitle: "Wash. Rev. Code § 48.43.093",
    lawName: "Washington Clean Claims Adjudication & Prompt Pay Standard",
    penaltyTerms: "Mandatory 12% annual interest penalty on undisputed clean claims unpaid after 30 days.",
    penaltySummary: "12% annual penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-05-30",
    officialUrl: "https://app.leg.wa.gov/rcw/default.aspx?cite=48.43.093",
    verifierOrg: "Washington State Legislature Official Portal"
  },
  MA: {
    stateCode: "MA",
    stateName: "Massachusetts",
    statuteTitle: "Mass. Gen. Laws ch. 176O § 7",
    lawName: "Massachusetts Health Plan Clean Claims Adjudication Law",
    penaltyTerms: "Mandatory 12% annual interest penalty on undisputed clean claims unpaid after 45 days.",
    penaltySummary: "12% annual penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-06-10",
    officialUrl: "https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXII/Chapter176O/Section7",
    verifierOrg: "The 193rd General Court of the Commonwealth of Massachusetts"
  },
  CO: {
    stateCode: "CO",
    stateName: "Colorado",
    statuteTitle: "Colo. Rev. Stat. § 10-16-106.5",
    lawName: "Colorado Prompt Payment of Health Claims Law",
    penaltyTerms: "Mandatory 10% annual interest penalty for first 90 days, increasing to 15% thereafter on delinquent clean claims.",
    penaltySummary: "10% to 15% annual penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-04-28",
    officialUrl: "https://leg.colorado.gov/sites/default/files/images/olls/crs2023-title-10.pdf",
    verifierOrg: "Colorado General Assembly Office of Legislative Legal Services"
  },
  NC: {
    stateCode: "NC",
    stateName: "North Carolina",
    statuteTitle: "N.C. Gen. Stat. § 58-3-225",
    lawName: "North Carolina Prompt Pay Statute for Health Benefit Plans",
    penaltyTerms: "Mandatory 18% annual interest penalty on clean claims unpaid after 30 calendar days.",
    penaltySummary: "18% annual penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-05-18",
    officialUrl: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_58/GS_58-3-225.html",
    verifierOrg: "North Carolina General Assembly Official Statutes"
  },
  VA: {
    stateCode: "VA",
    stateName: "Virginia",
    statuteTitle: "Va. Code Ann. § 38.2-3407.15",
    lawName: "Virginia Ethics and Fairness in Carrier Business Practices Act",
    penaltyTerms: "Mandatory penalty at prime rate plus 2% (approx 8.5% annual) on clean claims unpaid past 40 days.",
    penaltySummary: "Prime + 2% interest penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-03-25",
    officialUrl: "https://law.lis.virginia.gov/vacode/title38.2/chapter34/section38.2-3407.15/",
    verifierOrg: "Virginia Law Information System"
  },
  GA: {
    stateCode: "GA",
    stateName: "Georgia",
    statuteTitle: "Ga. Code Ann. § 33-24-59.5",
    lawName: "Georgia Timely Payment of Health Care Claims Act",
    penaltyTerms: "Mandatory 12% annual interest penalty on clean claims unpaid after 15 working days (electronic) or 30 days (paper).",
    penaltySummary: "12% annual penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-06-05",
    officialUrl: "https://law.justia.com/codes/georgia/2022/title-33/chapter-24/article-1/section-33-24-59-5/",
    verifierOrg: "Georgia General Assembly / State Insurance Commissioner Portal"
  },
  AZ: {
    stateCode: "AZ",
    stateName: "Arizona",
    statuteTitle: "Ariz. Rev. Stat. § 20-3102",
    lawName: "Arizona Health Care Provider Prompt Pay Statute",
    penaltyTerms: "Mandatory 10% annual interest penalty on clean claims unpaid after 30 days.",
    penaltySummary: "10% annual penalty",
    appliesToFullyInsured: true,
    lastVerifiedDate: "2026-04-20",
    officialUrl: "https://www.azleg.gov/ars/20/03102.htm",
    verifierOrg: "Arizona State Legislature Official Statutes"
  }
};

const CLAIM_DATASETS = {
  sarah_mri: {
    id: "sarah_mri",
    title: "Sarah M. — $3,500 Knee MRI (Erroneous CO-50 Denial)",
    shortDescription: "Denial citing 'lack of medical necessity & missing prior auth' despite active pre-approval #PA-884920 on file.",
    inferredPlanType: "employer_fully_insured",
    stateCode: "MN",
    patient: {
      name: "Sarah Miller",
      dob: "1989-04-14",
      memberId: "BLU-98421094-01",
      groupNumber: "GRP-88301-A",
      provider: "Metro Orthopedic Imaging Center",
      orderingPhysician: "Dr. Robert Chen, MD (NPI: 1948201948)",
      claimNumber: "CLM-2026-88492-X",
      dateOfService: "2026-08-12",
      totalBilled: 3500.00,
      patientResponsibility: 3500.00,
      potentialSavings: 3500.00,
      denialCode: "CO-50",
      denialCategory: "Medical Necessity / Missing Authorization",
      status: "ERRONEOUS_DENIAL",
      winProbability: "98.2%",
      cptCode: "73721",
      cptDescription: "MRI Knee Joint without Contrast (Unilateral)",
      icdCode: "M23.22",
      icdDescription: "Derangement of meniscus due to tear (Left Knee)",
      priorAuthNumber: "PA-884920",
      priorAuthApprovedDate: "2026-07-31"
    },
    denialDocument: {
      title: "Explanation of Benefits (EOB) / Denial Notice",
      documentType: "Insurer Notice of Adverse Benefit Determination",
      payerName: "ApexHealth Assurance Premier PPO",
      noticeDate: "August 28, 2026",
      pages: [
        {
          pageNumber: 1,
          lines: [
            { num: 1, text: "APEXHEALTH ASSURANCE PREMIER PPO — NOTICE OF ADVERSE BENEFIT DETERMINATION" },
            { num: 2, text: "Claims Processing Department | P.O. Box 9042, Minneapolis, MN 55440" },
            { num: 3, text: "Date of Notice: 08/28/2026 | Member ID: BLU-98421094-01 | Claim #: CLM-2026-88492-X" },
            { num: 4, text: "----------------------------------------------------------------------------------------" },
            { num: 5, text: "Patient Name: Sarah Miller | Date of Service: 08/12/2026 | Group #: GRP-88301-A" },
            { num: 6, text: "Provider: Metro Orthopedic Imaging Center | Referring Physician: Dr. Robert Chen, MD" },
            { num: 7, text: "" },
            { num: 8, text: "CLAIM BREAKDOWN & SERVICE LINE ITEMS:" },
            { num: 9, text: "Line | DOS        | Code  | Description                        | Billed    | Allowed | Patient Owes" },
            { num: 10, text: " 01  | 08/12/2026 | 73721 | MRI KNEE W/O CONTRAST (LEFT)       | $3,500.00 | $0.00   | $3,500.00" },
            { num: 11, text: "     | Remark Code: CO-50 (Non-Covered Service / Medical Necessity Not Established)" },
            { num: 12, text: "" },
            { num: 13, text: "PAYER REMARK EXPLANATION:" },
            { 
              num: 14, 
              text: "CO-50: Claim denied because payer clinical guidelines require prior authorization and documented conservative therapy (6 weeks PT) for CPT 73721. Payer records indicate no prior authorization approval was submitted with this claim.",
              isHighlight: true,
              highlightType: "denial",
              citationId: "cit_denial_reason"
            },
            { num: 15, text: "" },
            { num: 16, text: "APPEAL RIGHTS: Under ACA § 2719 and ERISA Section 503, you have 180 days from receipt of this notice" },
            { num: 17, text: "to file a Level 1 Internal Appeal in writing. Direct appeals to: ApexHealth Appeals, Box 9043, Minneapolis, MN." }
          ]
        }
      ]
    },
    policyDocument: {
      title: "ApexHealth Comprehensive PPO Benefit Handbook",
      documentType: "Master Policy & Clinical Coverage Guideline",
      effectiveYear: "2026",
      pages: [
        {
          pageNumber: 34,
          lines: [
            { num: 40, text: "SECTION 4: DIAGNOSTIC RADIOLOGY & ADVANCED IMAGING BENEFIT PROVISIONS" },
            { num: 41, text: "4.2 Musculoskeletal MRI Protocols (CPT Codes 73721, 73722, 73723)" },
            { 
              num: 42, 
              text: "4.2.a Coverage Standard: MRI of the knee joint (CPT 73721) is 100% covered as a Medically Necessary diagnostic benefit subject to deductible and 10% in-network coinsurance when ordered by a licensed orthopedic specialist or primary care provider.",
              isHighlight: true,
              highlightType: "policy_rule",
              citationId: "cit_policy_coverage"
            },
            { 
              num: 43, 
              text: "4.2.b Prior Authorization Rule: Prior authorization is required for outpatient advanced imaging. When prior authorization has been formally granted and assigned an active Authorization Reference ID (e.g., PA-######), the claim shall not be denied under CO-50 medical necessity guidelines unless treatment parameters deviated from approved scope.",
              isHighlight: true,
              highlightType: "policy_exception",
              citationId: "cit_policy_prior_auth"
            },
            { num: 44, text: "4.2.c Conservative Therapy Exception: If MRI confirms acute structural mechanical derangement (ICD-10 M23 series / Meniscal Tear), the 6-week physical therapy prerequisite is waived pursuant to Clinical Imaging Guideline RAD-409." },
            { num: 45, text: "" },
            { num: 46, text: "SECTION 12: CLAIMS ADJUDICATION & APPEAL OBLIGATIONS" },
            { num: 47, text: "12.3 Insurer Burden of Record Matching: ApexHealth automated adjudication systems must reconcile existing pre-authorization logs within 5 business days before issuing adverse determinations under CO-50." }
          ]
        }
      ]
    },
    corroboratingEvidence: {
      title: "Verified Prior Authorization Certificate on Record",
      authNumber: "PA-884920",
      status: "APPROVED & ACTIVE",
      approvedProcedure: "CPT 73721 - MRI Knee Joint (Left)",
      approvedDates: "2026-07-31 through 2026-10-31",
      issuedBy: "ApexHealth Utilization Management Portal",
      orderingPhysician: "Dr. Robert Chen, MD"
    },
    mismatchAnalysis: {
      summary: "Direct Payer Adjudication Error: The insurer claimed lack of pre-authorization, but Authorization #PA-884920 was approved on 07/31/2026. Furthermore, Policy Section 4.2.c explicitly waives conservative therapy for diagnosed Meniscus Tears (ICD-10 M23.22).",
      rootCause: "Automated billing scrubber failed to cross-index outpatient radiology claim with existing Pre-Authorization token #PA-884920 in the ApexHealth clearinghouse.",
      discrepancyPoints: [
        {
          title: "Prior Authorization Was In Fact Granted",
          detail: "Denial states 'no prior authorization was submitted', directly contradicting ApexHealth UM Approval Token PA-884920 issued July 31, 2026.",
          denialCite: "cit_denial_reason",
          policyCite: "cit_policy_prior_auth"
        },
        {
          title: "Conservative Therapy Prerequisite is Waived",
          detail: "Policy Section 4.2.c expressly waives 6 weeks of physical therapy for ICD-10 M23.22 (Torn Meniscus), rendering the insurer's cited guideline inapplicable.",
          denialCite: "cit_denial_reason",
          policyCite: "cit_policy_coverage"
        },
        {
          title: "Full Coverage Guaranteed by Section 4.2.a",
          detail: "In-network diagnostic MRI ordered by Dr. Robert Chen is a fully covered tier-1 benefit.",
          denialCite: "cit_denial_reason",
          policyCite: "cit_policy_coverage"
        }
      ],
      citations: [
        {
          id: "cit_denial_reason",
          tag: "Denial Notice: P.1, L.14",
          sourceDoc: "Denial Notice (EOB)",
          location: "Page 1, Line 14",
          exactQuote: "CO-50: Claim denied because payer clinical guidelines require prior authorization and documented conservative therapy (6 weeks PT) for CPT 73721. Payer records indicate no prior authorization approval was submitted with this claim.",
          groundingMethod: "Deterministic OCR extraction via dual-pass layout analysis",
          verified: true
        },
        {
          id: "cit_policy_coverage",
          tag: "Policy Handbook: §4.2.a",
          sourceDoc: "ApexHealth Comprehensive PPO Handbook",
          location: "Page 34, Line 42 (Section 4.2.a)",
          exactQuote: "4.2.a Coverage Standard: MRI of the knee joint (CPT 73721) is 100% covered as a Medically Necessary diagnostic benefit subject to deductible and 10% in-network coinsurance when ordered by a licensed orthopedic specialist or primary care provider.",
          groundingMethod: "RAG Semantic Embedding & Exact Section Match",
          verified: true
        },
        {
          id: "cit_policy_prior_auth",
          tag: "Policy Handbook: §4.2.b",
          sourceDoc: "ApexHealth Comprehensive PPO Handbook",
          location: "Page 34, Line 43 (Section 4.2.b)",
          exactQuote: "4.2.b Prior Authorization Rule: Prior authorization is required for outpatient advanced imaging. When prior authorization has been formally granted and assigned an active Authorization Reference ID (e.g., PA-######), the claim shall not be denied under CO-50 medical necessity guidelines...",
          groundingMethod: "RAG Semantic Embedding & Rule Match",
          verified: true
        }
      ]
    }
  },

  marcus_cosmetic: {
    id: "marcus_cosmetic",
    title: "Marcus T. — $1,800 Elective Rhinoplasty (Valid Denial Edge Case)",
    shortDescription: "Valid denial: Cosmetic septorhinoplasty without clinical nasal airway obstruction documentation. Demonstrates ethical, unbiased AI declining baseless appeals.",
    inferredPlanType: "employer_fully_insured",
    stateCode: "CA",
    patient: {
      name: "Marcus Taylor",
      dob: "1994-11-02",
      memberId: "AET-339104-09",
      groupNumber: "CORP-4019",
      provider: "Aesthetic ENT Clinic",
      orderingPhysician: "Dr. Lisa Vance, MD",
      claimNumber: "CLM-2026-11029-C",
      dateOfService: "2026-07-15",
      totalBilled: 1800.00,
      patientResponsibility: 1800.00,
      potentialSavings: 0.00,
      denialCode: "PR-96",
      denialCategory: "Non-Covered Benefit / Cosmetic Exclusion",
      status: "VALID_DENIAL",
      winProbability: "4.8%",
      cptCode: "30410",
      cptDescription: "Rhinoplasty, primary; lateral and alar cartilages",
      icdCode: "Z41.1",
      icdDescription: "Encounter for cosmetic surgery",
      priorAuthNumber: "NONE",
      priorAuthApprovedDate: "N/A"
    },
    denialDocument: {
      title: "Explanation of Benefits (EOB) — Marcus Taylor",
      documentType: "Insurer Notice of Adverse Benefit Determination",
      payerName: "CareShield National Health Plan",
      noticeDate: "August 10, 2026",
      pages: [
        {
          pageNumber: 1,
          lines: [
            { num: 1, text: "CARESHIELD NATIONAL HEALTH PLAN — EXPLANATION OF BENEFITS" },
            { num: 2, text: "Member ID: AET-339104-09 | Claim #: CLM-2026-11029-C | Date: 08/10/2026" },
            { num: 3, text: "Patient: Marcus Taylor | Provider: Aesthetic ENT Clinic | CPT: 30410 | ICD-10: Z41.1" },
            { num: 4, text: "Line 1 | 07/15/2026 | Billed: $1,800.00 | Allowed: $0.00 | Patient Owes: $1,800.00" },
            { 
              num: 5, 
              text: "Remark Code PR-96: Non-covered charge. Service is classified as elective cosmetic surgery (ICD-10 Z41.1) and is excluded under general plan provisions.",
              isHighlight: true,
              highlightType: "denial",
              citationId: "cit_marcus_denial"
            }
          ]
        }
      ]
    },
    policyDocument: {
      title: "CareShield Standard Health Benefit Plan Booklet",
      documentType: "Master Plan Exclusions Schedule",
      effectiveYear: "2026",
      pages: [
        {
          pageNumber: 58,
          lines: [
            { num: 20, text: "SECTION 9: GENERAL BENEFIT EXCLUSIONS & NON-COVERED SERVICES" },
            { 
              num: 21, 
              text: "9.1 Cosmetic Procedures: Any procedure, surgery, or treatment performed primarily to reshape normal structures of the body in order to improve appearance is strictly excluded from coverage. Surgeries coded under ICD-10 Z41.1 (Cosmetic Surgery) without objective endoscopic or CT evidence of internal nasal airway obstruction are non-payable.",
              isHighlight: true,
              highlightType: "policy_rule",
              citationId: "cit_marcus_policy"
            }
          ]
        }
      ]
    },
    mismatchAnalysis: {
      summary: "Valid Denial: The insurer's denial under PR-96 is supported by the policy contract. The procedure was billed under ICD-10 Z41.1 (Cosmetic Surgery) without medical necessity documentation for structural airway obstruction.",
      rootCause: "The procedure falls squarely within the Section 9.1 cosmetic exclusion policy without qualifying clinical exception codes.",
      discrepancyPoints: [
        {
          title: "Exclusion Clause Applies Contractually",
          detail: "Policy Section 9.1 explicitly excludes elective cosmetic procedures coded under ICD-10 Z41.1.",
          denialCite: "cit_marcus_denial",
          policyCite: "cit_marcus_policy"
        }
      ],
      citations: [
        {
          id: "cit_marcus_denial",
          tag: "Denial Notice: Line 5",
          sourceDoc: "CareShield EOB",
          location: "Page 1, Line 5",
          exactQuote: "Remark Code PR-96: Non-covered charge. Service is classified as elective cosmetic surgery (ICD-10 Z41.1) and is excluded under general plan provisions.",
          groundingMethod: "Deterministic OCR extraction",
          verified: true
        },
        {
          id: "cit_marcus_policy",
          tag: "CareShield Plan: §9.1",
          sourceDoc: "CareShield Benefit Handbook",
          location: "Page 58, Line 21",
          exactQuote: "9.1 Cosmetic Procedures: Any procedure, surgery, or treatment performed primarily to reshape normal structures of the body in order to improve appearance is strictly excluded from coverage...",
          groundingMethod: "RAG Section Match",
          verified: true
        }
      ]
    },
    validDenialAlternatives: [
      {
        title: "1. Request Provider Cash / Self-Pay Fee Discount",
        desc: "Ask Aesthetic ENT Clinic's billing office for the standard prompt-pay cash discount rate (typically 30% to 50% lower than standard Chargemaster rates)."
      },
      {
        title: "2. Inquire About Facility Charity Care / Hardship Program",
        desc: "If income qualifies, nonprofit surgical centers are mandated by ACA Section 501(r) to offer sliding-scale financial assistance."
      },
      {
        title: "3. Clinical Re-evaluation for Airway Obstruction",
        desc: "If nasal obstruction or deviated septum exists, request Dr. Vance perform acoustic rhinometry or endoscopy to bill under functional reconstructive CPT 30520 (Septoplasty)."
      },
      {
        title: "4. Establish 0% Interest Monthly Payment Plan",
        desc: "Request a 12 to 24 month interest-free installment agreement with the provider rather than sending the account to collections."
      }
    ]
  }
};

window.PLAN_TYPES = PLAN_TYPES;
const rawStatuteTable = VERIFIED_STATUTE_TABLE;
window.VERIFIED_STATUTE_TABLE = rawStatuteTable;
window.LEGAL_DISCLAIMER_TEXT = LEGAL_DISCLAIMER_TEXT;
window.CLAIM_DATASETS = CLAIM_DATASETS;
