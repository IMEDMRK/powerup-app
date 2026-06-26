const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ select: { username: true, createdAt: true } });
  const orders = await prisma.order.findMany({ select: { id: true, createdAt: true }, take: 5, orderBy: { createdAt: 'desc' } });
  console.log('Users:', users);
  console.log('Recent Orders:', orders);
}
main().finally(() => prisma.$disconnect());
