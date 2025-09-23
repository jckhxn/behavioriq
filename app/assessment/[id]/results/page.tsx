import { redirect } from "next/navigation";

interface AssessmentResultsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssessmentResultsPage({
  params,
}: AssessmentResultsPageProps) {
  const { id } = await params;

  // Redirect to the main assessment page which handles both in-progress and completed states
  redirect(`/assessment/${id}`);
}
