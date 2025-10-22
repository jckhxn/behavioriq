import { prisma } from "@/lib/db/prisma";

// Device fingerprinting: store deviceId on click/attribution, block duplicate signups
export async function isDeviceBanned(deviceId: string) {
  if (!deviceId) return false;
  const banned = await prisma.bannedDevice.findUnique({ where: { deviceId } });
  return !!banned;
}

// Velocity limits: max X signups per device/IP per day
export async function isVelocityLimited(deviceId: string, ip: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const deviceCount = await prisma.affiliateAttribution.count({
    where: { deviceId, timestamp: { gte: since } },
  });
  const ipCount = await prisma.affiliateAttribution.count({
    where: { ip, timestamp: { gte: since } },
  });
  return deviceCount > 3 || ipCount > 5;
}

// Household rule: block >1 signup per household (same address/email domain)
export async function isHouseholdLimited(email: string) {
  const domain = email.split("@")[1];
  const count = await prisma.affiliateAttribution.count({
    where: { user: { email: { endsWith: domain } } },
  });
  return count > 2;
}

// Ban list: check if user or email is banned
export async function isUserBanned(userId: string, email: string) {
  const bannedUser = await prisma.bannedUser.findUnique({ where: { userId } });
  const bannedEmail = await prisma.bannedEmail.findUnique({ where: { email } });
  return !!bannedUser || !!bannedEmail;
}

// KYC/W-9 required for payout
export function isKYCRequired(totalEarnedCents: number) {
  return totalEarnedCents >= 60000; // $600 threshold
}

// Chargeback clawback: mark commissions as clawed back
export async function clawbackCommissions(refCode: string) {
  await prisma.affiliateCommission.updateMany({
    where: { refCode, status: "paid" },
    data: { status: "clawed_back" },
  });
}
