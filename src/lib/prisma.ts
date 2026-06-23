import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({ log: ['query'] });
}

export const prisma = global.prismaInstance ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prismaInstance = prisma;
}
