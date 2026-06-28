import { PrismaClient } from '@prisma/client';

const DEFAULT_CATEGORY_NAME = 'Sem categoria';

const DEFAULT_CATEGORY_DATA = {
  name: DEFAULT_CATEGORY_NAME,
  description: 'Categoria padrão para transações sem categorias',
  color: null,
  icon: null,
  budgetAmount: 0,
  isActive: true,
  isDefault: true,
} as const;

const prisma = new PrismaClient();

async function main() {
  const usersWithoutDefault = await prisma.user.findMany({
    where: {
      categories: {
        none: {
          name: DEFAULT_CATEGORY_NAME,
        },
      },
    },
    select: { id: true, email: true },
  });

  console.log(
    `Found ${usersWithoutDefault.length} user(s) without a default category`,
  );

  for (const user of usersWithoutDefault) {
    await prisma.category.create({
      data: {
        ...DEFAULT_CATEGORY_DATA,
        userId: user.id,
      },
    });
    console.log(`Created default category for user ${user.email}`);
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
