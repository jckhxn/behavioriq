import { TrialAssessment } from "@/components/trial/TrialAssessment";
import { Suspense } from "react";
import { LoadingPage } from "@/components/ui/loading";

export default function TrialAssessmentPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingPage text="Loading trial assessment..." />}>
        <TrialAssessment />
      </Suspense>
    </div>
  );
}
