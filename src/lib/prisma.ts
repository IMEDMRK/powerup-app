import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

function createPrismaClient() {
  let dbUrl = process.env.DATABASE_URL || "";
  
  // Auto-fix for Supabase Connection Limits
  if (dbUrl.includes("supabase.com") && !dbUrl.includes("pgbouncer=true")) {
    dbUrl = dbUrl.replace(":5432/", ":6543/");
    dbUrl += dbUrl.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
}

export const prisma = global.prismaInstance ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prismaInstance = prisma;
}
