import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { IntentGate } from "@/components/district/IntentGate";
import { StudentProfilePage } from "@/components/district/StudentProfilePage";
import { Loader2 } from "lucide-react";

export default async function TeacherStudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get teacher record
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
  });

  if (!teacher) {
    redirect("/dashboard");
  }

  // Get user DB record for role
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  return (
    <IntentGate studentId={studentId} action="VIEW_STUDENT_DETAIL">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <div className="container mx-auto py-8 px-4">
          <StudentProfilePage
            studentId={studentId}
            user={{
              id: user.id,
              role: dbUser?.role || "TEACHER",
            }}
            backUrl="/teacher"
          />
        </div>
      </Suspense>
    </IntentGate>
  );
}
