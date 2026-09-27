"use client";

import dynamic from "next/dynamic";

// Client-only: the dashboard reads sessionStorage for the notice handed over from the story.
export const DashboardClient = dynamic(() => import("../_pear/Dashboard").then((m) => m.Dashboard), {
  ssr: false,
});
