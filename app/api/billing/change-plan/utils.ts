import { prisma } from "@/lib/db/prisma";

export async function getUserWithStripeCustomerId(userId: string) {
  // Adjust field name if needed
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      stripeCustomerId: true,
    },
  });
}
