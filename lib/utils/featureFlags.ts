import { prisma } from "@/lib/db/prisma";

export async function isFeatureFlagEnabled(key: string): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) return false;
    return flag.isEnabled;
  } catch {
    return false;
  }
}
