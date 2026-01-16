"use client";

import { useState } from "react";
import { HeaderNav } from "./HeaderNav";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { PricingCards } from "./PricingCards";
import { FAQ } from "./FAQ";
import { FinalCTA } from "./FinalCTA";
import { Footer } from "./Footer";
import { SampleReportModal } from "./SampleReportModal";

interface LandingPageProps {
  onStartSnapshot?: () => void;
}

export function LandingPage({ onStartSnapshot }: LandingPageProps) {
  const [sampleOpen, setSampleOpen] = useState(false);
  const foundersActive = false;
  const foundersCountdown = "2:14:59";

  const handleStartSnapshot = () => {
    (window as any)?.gtag?.("event", "cta.click", {
      id: "cta_start_snapshot",
      position: "hero",
    });
    onStartSnapshot?.();
  };

  const handleSampleReport = () => {
    setSampleOpen(true);
    (window as any)?.gtag?.("event", "sample_report.open");
  };

  const handleStartCore = () => {
    (window as any)?.gtag?.("event", "cta.click", {
      id: "cta_start_core",
      position: "pricing",
    });
    onStartSnapshot?.();
  };

  const handleStartFamily = () => {
    (window as any)?.gtag?.("event", "cta.click", {
      id: "cta_start_family",
      position: "pricing",
    });
    // Route to family checkout
  };

  const handleCompare = () => {
    // Scroll to comparison section or open modal
  };

  return (
    <main className="min-h-screen bg-background">
      <HeaderNav onStartSnapshot={handleStartSnapshot} />

      <Hero
        onStartSnapshot={handleStartSnapshot}
        onSampleReport={handleSampleReport}
        foundersActive={foundersActive}
        foundersCountdown={foundersCountdown}
      />

      <HowItWorks />

      <PricingCards
        onStartCore={handleStartCore}
        onStartFamily={handleStartFamily}
        onCompare={handleCompare}
      />

      <FAQ />

      <FinalCTA onStartSnapshot={handleStartSnapshot} />

      <Footer />

      <SampleReportModal
        open={sampleOpen}
        onClose={() => {
          setSampleOpen(false);
          (window as any)?.gtag?.("event", "sample_report.close");
        }}
      />
    </main>
  );
}
