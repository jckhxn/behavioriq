import { Suspense } from "react";
import { AssessmentsView } from "@/components/assessment/AssessmentsView";

export default function AssessmentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="p-8">Loading assessments...</div>}>
        <AssessmentsView />
      </Suspense>
    </div>
  );
}
