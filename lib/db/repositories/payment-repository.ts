import { prisma } from "@/lib/db/prisma";
import type { Payment, Prisma } from "@prisma/client";

export class PaymentRepository {
  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return prisma.payment.create({ data });
  }

  async findByStripePaymentIntent(
    paymentIntentId: string
  ): Promise<Payment | null> {
    return prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });
  }

  async findByUser(
    userId: string,
    options?: {
      limit?: number;
      orderBy?: Prisma.PaymentOrderByWithRelationInput;
    }
  ): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { userId },
      take: options?.limit,
      orderBy: options?.orderBy || { createdAt: "desc" },
    });
  }

  async findByStripeCustomer(customerId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { stripeCustomerId: customerId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Check if user has any successful payments
   */
  async hasSuccessfulPayment(userId: string): Promise<boolean> {
    const count = await prisma.payment.count({
      where: {
        userId,
        status: "SUCCEEDED",
      },
    });
    return count > 0;
  }

  /**
   * Get total revenue for a user
   */
  async getTotalRevenue(userId: string): Promise<number> {
    const result = await prisma.payment.aggregate({
      where: {
        userId,
        status: "SUCCEEDED",
      },
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  }
}

export const paymentRepository = new PaymentRepository();
