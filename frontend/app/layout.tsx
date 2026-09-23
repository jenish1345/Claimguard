import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SNAP Notice Checker — Check Your Benefits Notice for Errors",
  description:
    "Upload or paste your SNAP (food stamps) notice to check it for defects under federal law (7 CFR 273.13). Free, anonymous, no account needed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Fonts loaded via @import in globals.css */}

      <body className="antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <header className="site-header" role="banner">
          <div className="header-inner">
            <div className="header-brand">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="header-logo-icon" aria-hidden="true">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <span className="header-title">SNAP Notice Checker</span>
            </div>
            <span className="header-badge">Free · Anonymous · Open Source</span>
          </div>
        </header>
        <main id="main-content">{children}</main>
        <footer className="site-footer" role="contentinfo">
          <div className="footer-inner">
            <p className="footer-disclaimer">
              This tool does not provide legal advice. It checks for common notice defects under federal regulations.
              No personal information is stored or logged.
            </p>
            <p className="footer-credit">
              Built for <strong>LexHack 2026</strong> — Access to Justice Track
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
