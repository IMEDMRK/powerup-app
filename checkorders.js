const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany();
  console.log(orders);
  await prisma.$disconnect();
}

main().catch(console.error);
