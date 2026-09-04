import { prisma } from "../lib/prisma.js";

export class AdminRepository {
  findById(id: string) {
    return prisma.admin.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string) {
    return prisma.admin.findUnique({
      where: { email },
    });
  }

  findAll() {
    return prisma.admin.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  countActive() {
    return prisma.admin.count({
      where: { isActive: true },
    });
  }

  updateProfile(id: string, data: { name?: string | null; email?: string }) {
    return prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updateStatus(id: string, isActive: boolean) {
    return prisma.$transaction(async (tx) => {
      if (!isActive) {
        const activeCount = await tx.admin.count({
          where: { isActive: true },
        });
        if (activeCount <= 1) {
          const target = await tx.admin.findUnique({
            where: { id },
            select: { isActive: true },
          });
          if (target?.isActive) {
            const err = new Error("Cannot deactivate the last active administrator account");
            Object.assign(err, { code: "ADMIN_LAST_ACTIVE_ACCOUNT", statusCode: 400 });
            throw err;
          }
        }
      }

      return tx.admin.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  }

  updatePassword(id: string, passwordHash: string) {
    return prisma.admin.update({
      where: { id },
      data: { passwordHash },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  createAdmin(data: {
    email: string;
    passwordHash: string;
    name?: string;
  }) {
    return prisma.admin.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: "EMPLOYEE",
        ...(data.name ? { name: data.name } : {}),
      },
    });
  }

  createPasswordResetToken(
    adminId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return prisma.$transaction(async (transaction) => {
      const now = new Date();

      await transaction.passwordResetToken.updateMany({
        where: {
          adminId,
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      });

      return transaction.passwordResetToken.create({
        data: {
          adminId,
          tokenHash,
          expiresAt,
        },
      });
    });
  }

  findUsablePasswordResetToken(tokenHash: string, now: Date) {
    return prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      select: {
        id: true,
        adminId: true,
        admin: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    });
  }

  resetPassword(
    tokenId: string,
    adminId: string,
    passwordHash: string,
    now: Date,
  ) {
    return prisma.$transaction(async (transaction) => {
      const consumedToken = await transaction.passwordResetToken.updateMany({
        where: {
          id: tokenId,
          adminId,
          usedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          usedAt: now,
        },
      });

      if (consumedToken.count !== 1) {
        return false;
      }

      await transaction.admin.update({
        where: {
          id: adminId,
        },
        data: {
          passwordHash,
        },
      });

      await transaction.passwordResetToken.updateMany({
        where: {
          adminId,
          id: {
            not: tokenId,
          },
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      });

      return true;
    });
  }
}

export const adminRepository = new AdminRepository();
