import React, { useState } from "react";
import { HeaderNav } from "./HeaderNav";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { SnapshotToReport } from "./SnapshotToReport";
import { PricingCards } from "./PricingCards";
import { ProofTrust } from "./ProofTrust";
import { ComparisonTable } from "./ComparisonTable";
import { FAQ } from "./FAQ";
import { FinalCTA } from "./FinalCTA";
import { SampleReportModal } from "./SampleReportModal";
import { Footer } from "./Footer";

export function LandingPage({ onStartSnapshot }: { onStartSnapshot?: () => void } = {}) {
  const [sampleOpen, setSampleOpen] = useState(false);
  // TODO: wire up foundersActive/foundersCountdown from config or state
  const foundersActive = false;
  const foundersCountdown = "2:14:59";

  // Analytics/event handlers
  const handleStartSnapshot = () => {
    (window as any)?.gtag?.("event", "cta.click", {
      id: "cta_start_snapshot_top",
      position: "hero",
    });
    onStartSnapshot?.();
  };
  const handleSampleReport = () => {
    setSampleOpen(true);
    (window as any)?.gtag?.("event", "sample_report.open");
  };
  const handleGet97Report = () => {
    (window as any)?.gtag?.("event", "cta.click", {
      id: "cta_get_97_report",
      position: "snapshot",
    });
    // TODO: route to paid report start
  };
  const handleStartCore = () => {
    (window as any)?.gtag?.("event", "cta.click", {
      id: "cta_start_core",
      position: "pricing",
    });
    // TODO: route to core checkout
  };
  const handleStartFamily = () => {
    (window as any)?.gtag?.("event", "cta.click", {
      id: "cta_start_family",
      position: "pricing",
    });
    // TODO: route to family checkout
  };
  const handleCompare = () => {
    (window as any)?.gtag?.("event", "cta.click", {
      id: "cta_compare_options",
      position: "pricing",
    });
    // TODO: open comparison modal
  };
  return (
    <main className="bg-background min-h-screen">
      <HeaderNav onStartSnapshot={handleStartSnapshot} />
      <Hero
        onStartSnapshot={handleStartSnapshot}
        onSampleReport={handleSampleReport}
        foundersActive={foundersActive}
        foundersCountdown={foundersCountdown}
      />
      <HowItWorks />
      <SnapshotToReport
        onStartSnapshot={handleStartSnapshot}
        onGet97Report={handleGet97Report}
      />
      <PricingCards
        onStartCore={handleStartCore}
        onStartFamily={handleStartFamily}
        onCompare={handleCompare}
      />
      <ProofTrust />
      <ComparisonTable />
      <FAQ />
      <FinalCTA
        onStartSnapshot={handleStartSnapshot}
        onGet97Report={handleGet97Report}
      />
      <SampleReportModal
        open={sampleOpen}
        onClose={() => {
          setSampleOpen(false);
          (window as any)?.gtag?.("event", "sample_report.close");
        }}
      />
      <Footer />
    </main>
  );
}
