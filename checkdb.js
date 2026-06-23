const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('users', await prisma.user.count());
  console.log('orders', await prisma.order.count());
  await prisma.$disconnect();
}

main().catch(console.error);
