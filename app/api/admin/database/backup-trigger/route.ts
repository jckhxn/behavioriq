import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { execSync } from "child_process";
import path from "path";

/**
 * POST /api/admin/database/backup-trigger
 *
 * Manually trigger a database backup
 * Requires SUPER_ADMIN role
 *
 * Returns the backup file path and status
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Super Admin access required" },
        { status: 403 }
      );
    }

    // Check if backup script exists
    const backupScriptPath = path.join(process.cwd(), "scripts", "backup-database.sh");

    try {
      // Execute backup script
      // This will use DATABASE_URL or DIRECT_URL from environment
      const output = execSync(`bash ${backupScriptPath}`, {
        cwd: process.cwd(),
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      // Parse output to get backup filename
      const filenameMatch = output.match(/Backup file: (.+)/);
      const sizeMatch = output.match(/File size: (.+)/);

      const backupFile = filenameMatch ? filenameMatch[1].trim() : "unknown";
      const size = sizeMatch ? sizeMatch[1].trim() : "unknown";

      return NextResponse.json({
        status: "success",
        message: "Backup completed successfully",
        backupFile,
        size,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error("Backup script error:", errorMessage);

      return NextResponse.json(
        {
          error: "Backup failed",
          message: errorMessage,
          hint: "Ensure pg_dump is installed and DATABASE_URL or DIRECT_URL is set",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error triggering backup:", error);
    return NextResponse.json(
      { error: "Failed to trigger backup" },
      { status: 500 }
    );
  }
}
