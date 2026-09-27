"use client";

import dynamic from "next/dynamic";

const PearApp = dynamic(() => import("./_pear/PearApp").then((m) => m.PearApp), {
  ssr: false,
});

export default function Home() {
  return <PearApp />;
}
