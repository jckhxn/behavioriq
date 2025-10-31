import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

interface LeadResponse {
  id: string;
  email: string;
  consentMarketing: boolean;
  createdAt: string;
  sessionId: string;
}

interface DeleteLeadsRequest {
  ids: string[];
}

interface DeleteResponse {
  deletedCount: number;
  success: boolean;
}

/**
 * GET /api/admin/leads
 *
 * Fetch all trial leads (email captures).
 * Only accessible to ADMIN and SUPER_ADMIN roles.
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await getCurrentUserWithRole();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - no user found" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden - only admins can access this endpoint",
        },
        { status: 403 }
      );
    }

    // Fetch all leads with session info
    const leads = await prisma.lead.findMany({
      select: {
        id: true,
        email: true,
        consentMarketing: true,
        createdAt: true,
        sessionId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to response format (ISO string for dates)
    const response: LeadResponse[] = leads.map((lead) => ({
      id: lead.id,
      email: lead.email,
      consentMarketing: lead.consentMarketing,
      createdAt: lead.createdAt.toISOString(),
      sessionId: lead.sessionId,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("[admin/leads] GET failed", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/leads
 *
 * Delete multiple leads by ID.
 * Only accessible to ADMIN and SUPER_ADMIN roles.
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await getCurrentUserWithRole();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - no user found" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden - only admins can delete leads",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = (await request.json()) as DeleteLeadsRequest;

    // Validate request
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid request - ids array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Ensure all IDs are strings and non-empty
    const validIds = body.ids.filter((id): id is string => typeof id === "string" && id.length > 0);

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid IDs provided" },
        { status: 400 }
      );
    }

    console.log(`[admin/leads] Deleting ${validIds.length} leads`, { ids: validIds });

    // Delete leads
    const result = await prisma.lead.deleteMany({
      where: {
        id: {
          in: validIds,
        },
      },
    });

    console.log(`[admin/leads] Deleted ${result.count} leads successfully`);

    const response: DeleteResponse = {
      deletedCount: result.count,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[admin/leads] DELETE failed", error);
    return NextResponse.json(
      { error: "Failed to delete leads" },
      { status: 500 }
    );
  }
}
