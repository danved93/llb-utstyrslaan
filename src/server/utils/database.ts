import { PrismaClient } from '@prisma/client';

// Opprett Prisma client instans
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔌 Lukker database forbindelse...');
  await prisma.$disconnect();
});

export { prisma };