import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { invalidatePlatformSettingsCache } from "@/lib/platform/settings";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }

    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ error: "Assessment template not found" }, { status: 404 });
    }

    const settings = await prisma.platformSettings.findFirst();

    if (settings) {
      await prisma.platformSettings.update({
        where: { id: settings.id },
        data: { globalTrialAssessmentId: templateId, updatedBy: user.id },
      });
    } else {
      await prisma.platformSettings.create({
        data: { globalTrialAssessmentId: templateId, updatedBy: user.id },
      });
    }

    invalidatePlatformSettingsCache();

    return NextResponse.json({ success: true, templateId });
  } catch (error) {
    console.error("[set-trial] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
