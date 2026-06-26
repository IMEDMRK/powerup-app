const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.count();
  const orders = await prisma.order.count();
  console.log('Users:', users, 'Orders:', orders);
}
main().finally(() => prisma.$disconnect());
