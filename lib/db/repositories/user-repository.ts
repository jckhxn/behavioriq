import { prisma } from "@/lib/db/prisma";
import type { User, Prisma } from "@prisma/client";

export class UserRepository {
  /**
   * Find user by ID with optional relations
   */
  async findById(
    id: string,
    include?: Prisma.UserInclude
  ): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Create new user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  /**
   * Update user
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Find or create user (upsert)
   */
  async upsert(
    email: string,
    createData: Prisma.UserCreateInput,
    updateData?: Prisma.UserUpdateInput
  ): Promise<User> {
    return prisma.user.upsert({
      where: { email },
      create: createData,
      update: updateData || {},
    });
  }

  /**
   * Activate user account
   */
  async activate(id: string): Promise<User> {
    return this.update(id, { isActive: true });
  }

  /**
   * Get user with licenses
   */
  async findWithLicenses(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        licenses: {
          include: {
            license: true,
          },
        },
      },
    });
  }

  /**
   * Get user with all relations
   */
  async findWithRelations(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        licenses: {
          include: {
            license: true,
          },
        },
        assessments: {
          take: 10,
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }
}

export const userRepository = new UserRepository();
