import { PrismaClient } from '@prisma/client';

export let prisma: PrismaClient;

beforeAll(() => {
  prisma = new PrismaClient();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  const tables = ['commitments', 'transactions', 'categories', 'users'];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
});
