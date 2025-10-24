"use client";
import { HeroSection } from "./HeroSection";
import { SocialProofSection } from "./SocialProofSection";
import { ContentSection } from "./ContentSection";
import { WalkthroughSection } from "./WalkthroughSection";
import { ComparisonSection } from "./ComparisonSection";
import { LeadMagnetSection } from "./LeadMagnetSection";
import { FAQSection } from "./FAQSection";
import { FinalCTASection } from "./FinalCTASection";
import { Footer } from "./Footer";

export default function SlugClientShell(props: any) {
  return (
    <main className="min-h-screen">
      <HeroSection {...props.hero} />
      <SocialProofSection {...props.socialProof} />
      <ContentSection {...props.definition} />
      <WalkthroughSection {...props.process} />
      <ComparisonSection {...props.comparison} />
      <LeadMagnetSection {...props.leadMagnet} />
      <FAQSection faqs={props.faq} />
      <FinalCTASection />
      <Footer {...props.footer} />
    </main>
  );
}
