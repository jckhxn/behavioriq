/**
 * Email Jobs API
 *
 * Handles manual triggering of email jobs and notifications
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { EmailJobScheduler } from "@/lib/email/email-scheduler";

// POST /api/admin/email-jobs/run - Manually run email jobs
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jobType } = body;

    switch (jobType) {
      case "license-expiration":
        await EmailJobScheduler.checkLicenseExpirations();
        return NextResponse.json({
          message: "License expiration notifications sent",
        });

      case "daily-digest":
        await EmailJobScheduler.sendDailyDigest();
        return NextResponse.json({
          message: "Daily digest sent to administrators",
        });

      case "all":
        await EmailJobScheduler.runScheduledJobs();
        return NextResponse.json({
          message: "All scheduled email jobs completed",
        });

      default:
        return NextResponse.json(
          {
            error:
              "Invalid job type. Use: license-expiration, daily-digest, or all",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Email job error:", error);
    return NextResponse.json(
      { error: "Failed to run email job" },
      { status: 500 }
    );
  }
}
