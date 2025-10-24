import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { promises as fs } from "fs";
import path from "path";

interface BackupInfo {
  filename: string;
  size: number;
  sizeFormatted: string;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Super Admin access required" },
        { status: 403 }
      );
    }

    const backupDir = path.join(process.cwd(), "backups");

    // Try to read backup directory
    let backups: BackupInfo[] = [];
    try {
      const files = await fs.readdir(backupDir);
      const backupFiles = files.filter((f) => f.endsWith("_backup.dump"));

      // Get file stats for each backup
      backups = await Promise.all(
        backupFiles.map(async (filename) => {
          const filePath = path.join(backupDir, filename);
          const stats = await fs.stat(filePath);
          return {
            filename,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            createdAt: stats.mtime,
          };
        })
      );

      // Sort by creation date, newest first
      backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      // Backup directory doesn't exist yet, return empty list
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    const latestBackup = backups[0] || null;
    const totalBackups = backups.length;

    return NextResponse.json({
      status: "success",
      latestBackup,
      totalBackups,
      backups: backups.slice(0, 10), // Return last 10 backups
      backupDir: process.env.NODE_ENV === "production" ? "[redacted]" : backupDir,
      note: "Automated backups are created daily. Keep the most recent 30 days of backups.",
    });
  } catch (error) {
    console.error("Error fetching backup status:", error);
    return NextResponse.json(
      { error: "Failed to fetch backup status" },
      { status: 500 }
    );
  }
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
