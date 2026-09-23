export const FAQ_ITEMS = [
  {
    q: "What does ClaimGuard check?",
    a: "Ten rules from federal SNAP law: the notice date, the effective date, the reason, the old and new benefit amounts, your right to appeal, the appeal deadline, how to request a hearing, language assistance, whether the math adds up, and at least 10 days’ advance notice.",
  },
  {
    q: "Where does the AI come in?",
    a: "Claude reads the notice and turns it into structured fields: dates, amounts, and whether appeal rights are there. It never decides the outcome. Ten deterministic rules do that, so the same notice always gets the same answer, and every finding cites a regulation.",
  },
  {
    q: "Is my notice stored anywhere?",
    a: "No. The text is sent to Claude to read the fields and checked in memory. ClaimGuard never saves it and never writes it to logs; only its length and the defect count are.",
  },
  {
    q: "What if my notice has defects?",
    a: "Each defect comes with a next step. Most point to a fair hearing, which you can usually request within 90 days. Ask before the effective date and your benefits may continue while you wait. Legal aid offices help for free.",
  },
  {
    q: "Is this legal advice?",
    a: "No. ClaimGuard is not a law firm. It flags where a notice falls short of federal notice rules, and a clean result doesn’t mean the decision itself is right. Talk to legal aid before a hearing.",
  },
] as const;
