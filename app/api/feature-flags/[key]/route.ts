import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth-helpers";
import { isFeatureFlagEnabled } from "@/lib/utils/featureFlags";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ enabled: false });
    }

    const { key } = await params;
    const enabled = await isFeatureFlagEnabled(key);
    return NextResponse.json({ enabled });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
