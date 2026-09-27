import type { Metadata } from "next";
import "./globals.css";
import { FAQ_ITEMS } from "./_pear/faq-data";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000/";
const TITLE = "ClaimGuard — check a SNAP notice against federal law";
const DESCRIPTION =
  "Paste a SNAP benefits notice. Claude reads it, ten rules from 7 CFR 273.13 check it, and you see every defect with its citation and next step.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  robots: "index, follow",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  openGraph: {
    type: "website",
    siteName: "ClaimGuard",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "A neoclassical painting of a colossal golden pear on a marble pedestal under a cerulean sky",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
  other: {
    "theme-color": "#0b0a09",
  },
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ClaimGuard",
  url: SITE_URL,
  applicationCategory: "LegalService",
  operatingSystem: "Web",
  description: DESCRIPTION,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" style={{ colorScheme: "only light" }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
