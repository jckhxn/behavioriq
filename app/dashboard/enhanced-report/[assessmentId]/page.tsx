import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import ClientEnhancedReportWrapper from "@/components/reports/ClientEnhancedReportWrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EnhancedReportPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const session = await auth();
  const { assessmentId } = await params;

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch assessment with enhanced report data
  const assessment = (await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      userId: session.user.id,
    },
    select: {
      id: true,
      subjectName: true,
      completedAt: true,
      hasEnhancedReport: true,
      enhancedReportPurchasedAt: true,
      childResponses: true,
      enhancedAnalysis: true,
      isConversational: true,
    },
  })) as any; // TypeScript cache workaround - these fields exist in DB

  if (!assessment) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Assessment Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This assessment doesn't exist or you don't have access to it.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!assessment.hasEnhancedReport) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Enhanced Report Not Available
        </h1>
        <p className="text-muted-foreground mb-6">
          This assessment doesn't have an enhanced report yet.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href={`/checkout-enhanced/${assessmentId}`}>
              Upgrade to Enhanced Report
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Parse JSON fields
  const childResponses = (assessment.childResponses as any[]) || [];
  const enhancedAnalysis = (assessment.enhancedAnalysis as any) || {
    overallAlignment: "No analysis available yet.",
    keyDifferences: [],
    insights: [],
    recommendations: [],
    quotes: [],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ClientEnhancedReportWrapper
        assessment={{
          id: assessment.id,
          title: assessment.subjectName,
          completedAt: assessment.completedAt,
          score: 0, // Score is in separate scores relation, not needed for report
          enhancedReportPurchasedAt: assessment.enhancedReportPurchasedAt,
        }}
        childResponses={childResponses}
        enhancedAnalysis={enhancedAnalysis}
      />
    </div>
  );
}
