import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { loadAssessmentConfigFromTemplate } from "@/lib/assessment/db-loader";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await params;
    const config = await loadAssessmentConfigFromTemplate(templateId);

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error loading assessment preview config:", error);
    return NextResponse.json(
      { error: "Failed to load assessment preview" },
      { status: 500 }
    );
  }
}
