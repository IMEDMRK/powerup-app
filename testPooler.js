const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.uagjlhguhasssqnobaaw:Powerdz123up1@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
    }
  }
});

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected!');
    await prisma.user.findMany();
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
