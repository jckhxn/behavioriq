import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  prismaService: PrismaClient;
};

// Regular Prisma client - used for authenticated server queries
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Service Prisma client - uses service role to bypass RLS
// Use for: webhooks, background jobs, admin operations
// DO NOT use for user-initiated requests without auth check!
export const prismaService =
  globalForPrisma.prismaService ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaService = prismaService;
}
