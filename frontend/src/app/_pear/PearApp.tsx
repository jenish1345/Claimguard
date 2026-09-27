"use client";

import { useEffect, useState } from "react";
import { Hero } from "./Hero";
import { Signature } from "./Signature";
import { Faq } from "./Faq";
import { Fly } from "./Fly";
import { Footer } from "./Footer";
import { ContactForm } from "./ContactForm";
import { Fin } from "./Fin";
import { Portfolio } from "./Portfolio";
import { MenuOverlay } from "./MenuOverlay";
import { Overlay } from "./Overlay";
import "./form.css";
import { pickReel } from "./reels";
import { initPearEngine } from "./engine";

export function PearApp() {
  const [reel] = useState(pickReel);

  useEffect(() => {
    initPearEngine(reel);
  }, [reel]);

  return (
    <main id="top">
      <section className="stage">
        <div className="pin">
          <Hero poster={reel.poster} />
          <Signature />
          <Faq />
          <Fly />
          <Footer />
          <ContactForm />
          <Fin />
          <Portfolio />
          <MenuOverlay />
          <Overlay />
        </div>
      </section>
      <video className="src" src={reel.src} muted loop playsInline preload="auto" autoPlay aria-hidden="true" />
    </main>
  );
}
