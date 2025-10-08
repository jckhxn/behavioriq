import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

/**
 * Super Admin Platform Settings Management
 * Only accessible by SUPER_ADMIN role
 */

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin
    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    // Get platform settings (create default if doesn't exist)
    let settings = await prisma.platformSettings.findFirst({
      include: {
        globalTrialAssessment: {
          select: { id: true, name: true, slug: true, description: true },
        },
        globalRegularAssessment: {
          select: { id: true, name: true, slug: true, description: true },
        },
      },
    });

    if (!settings) {
      // Create default platform settings
      settings = await prisma.platformSettings.create({
        data: {
          updatedBy: user.id,
        },
        include: {
          globalTrialAssessment: {
            select: { id: true, name: true, slug: true, description: true },
          },
          globalRegularAssessment: {
            select: { id: true, name: true, slug: true, description: true },
          },
        },
      });
    }

    // Get available assessment templates for selection
    const availableAssessments = await prisma.assessmentTemplate.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      settings,
      availableAssessments,
    });
  } catch (error) {
    console.error("Error fetching platform settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin
    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      globalTrialAssessmentId,
      globalRegularAssessmentId,
      maintenanceMode,
      registrationEnabled,
      trialAssessmentsEnabled,
      aiReportsEnabled,
      maxAiReportsPerUser,
    } = body;

    // Validate assessment template IDs if provided
    if (globalTrialAssessmentId) {
      const trialTemplate = await prisma.assessmentTemplate.findUnique({
        where: { id: globalTrialAssessmentId },
      });
      if (!trialTemplate) {
        return NextResponse.json(
          { error: "Invalid trial assessment template ID" },
          { status: 400 }
        );
      }
    }

    if (globalRegularAssessmentId) {
      const regularTemplate = await prisma.assessmentTemplate.findUnique({
        where: { id: globalRegularAssessmentId },
      });
      if (!regularTemplate) {
        return NextResponse.json(
          { error: "Invalid regular assessment template ID" },
          { status: 400 }
        );
      }
    }

    // Update or create platform settings
    let settings = await prisma.platformSettings.findFirst();

    if (settings) {
      settings = await prisma.platformSettings.update({
        where: { id: settings.id },
        data: {
          globalTrialAssessmentId: globalTrialAssessmentId || null,
          globalRegularAssessmentId: globalRegularAssessmentId || null,
          maintenanceMode: maintenanceMode ?? settings.maintenanceMode,
          registrationEnabled:
            registrationEnabled ?? settings.registrationEnabled,
          trialAssessmentsEnabled:
            trialAssessmentsEnabled ?? settings.trialAssessmentsEnabled,
          aiReportsEnabled: aiReportsEnabled ?? settings.aiReportsEnabled,
          maxAiReportsPerUser:
            maxAiReportsPerUser ?? settings.maxAiReportsPerUser,
          updatedBy: user.id,
        },
        include: {
          globalTrialAssessment: {
            select: { id: true, name: true, slug: true, description: true },
          },
          globalRegularAssessment: {
            select: { id: true, name: true, slug: true, description: true },
          },
        },
      });
    } else {
      settings = await prisma.platformSettings.create({
        data: {
          globalTrialAssessmentId: globalTrialAssessmentId || null,
          globalRegularAssessmentId: globalRegularAssessmentId || null,
          maintenanceMode: maintenanceMode ?? false,
          registrationEnabled: registrationEnabled ?? true,
          trialAssessmentsEnabled: trialAssessmentsEnabled ?? true,
          aiReportsEnabled: aiReportsEnabled ?? true,
          maxAiReportsPerUser: maxAiReportsPerUser ?? 10,
          updatedBy: user.id,
        },
        include: {
          globalTrialAssessment: {
            select: { id: true, name: true, slug: true, description: true },
          },
          globalRegularAssessment: {
            select: { id: true, name: true, slug: true, description: true },
          },
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating platform settings:", error);
    return NextResponse.json(
      { error: "Failed to update platform settings" },
      { status: 500 }
    );
  }
}
