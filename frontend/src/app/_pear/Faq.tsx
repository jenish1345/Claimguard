import { FAQ_ITEMS } from "./faq-data";

const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

export function Faq() {
  return (
    <div className="faq" aria-hidden="true">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
      <svg className="faq-lead" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1={0} y1={0} x2={0} y2={0} />
        <rect width={8} height={8} x={-99} y={-99} />
      </svg>
    </div>
  );
}
