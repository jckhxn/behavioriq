import { NextResponse } from "next/server";
import { isMaintenanceModeEnabled } from "@/lib/platform/settings";

export const runtime = "nodejs";

export async function GET() {
  const maintenanceMode = await isMaintenanceModeEnabled();
  return NextResponse.json({ maintenanceMode });
}
