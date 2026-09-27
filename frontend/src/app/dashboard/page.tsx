import type { Metadata } from "next";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — ClaimGuard",
  description: "Check a SNAP notice against ten federal notice rules and draft a fair hearing request.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
