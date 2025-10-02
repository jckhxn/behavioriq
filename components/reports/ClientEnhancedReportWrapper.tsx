"use client";

import { useRouter } from "next/navigation";
import EnhancedReportView from "@/components/reports/EnhancedReportView";

interface ClientEnhancedReportWrapperProps {
  assessment: {
    id: string;
    title: string;
    completedAt: Date | null;
    score: number;
    enhancedReportPurchasedAt: Date | null;
  };
  childResponses: any[];
  enhancedAnalysis: any;
}

export default function ClientEnhancedReportWrapper({
  assessment,
  childResponses,
  enhancedAnalysis,
}: ClientEnhancedReportWrapperProps) {
  const handleDownloadPdf = async () => {
    try {
      const res = await fetch(`/api/assessment/${assessment.id}/download-enhanced-pdf`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `enhanced-report-${assessment.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
    }
  };

  return (
    <EnhancedReportView
      assessment={assessment}
      childResponses={childResponses}
      enhancedAnalysis={enhancedAnalysis}
      onDownloadPdf={handleDownloadPdf}
    />
  );
}
