import { prisma } from "../lib/prisma.js";

export class AdminRepository {
  findByEmail(email: string) {
    return prisma.admin.findUnique({
      where: { email },
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
