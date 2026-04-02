import { PrismaClient } from '@prisma/client';

// In development, attach to a global variable to prevent hot-reload from
// creating multiple PrismaClient instances (each consuming a DB connection).
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
