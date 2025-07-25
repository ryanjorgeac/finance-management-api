import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryWithSummary } from 'src/common/types/category-with-summary';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const prismaCategory = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
      },
    });

    return new Category(prismaCategory);
  }

  async findAll(userId: string): Promise<Category[]> {
    const categoriesWithSummary = await this.prisma.$queryRaw`
    SELECT
      c.id,
      c.name,
      c.description,
      c.color,
      c.icon,
      c."budgetAmount",
      c."isActive",
      c."createdAt",
      c."updatedAt",
      COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0)::float AS "spentAmount",
      COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0)::float AS "incomeAmount",
      COALESCE(COUNT(t.id), 0)::integer AS "transactionCount"
    FROM
      categories AS c
    LEFT JOIN
      transactions AS t ON c.id = t."categoryId"
    WHERE
      c."userId" = ${userId}
    GROUP BY
      c.id
    ORDER BY
      c.name ASC;
  `;

    return (categoriesWithSummary as CategoryWithSummary[]).map(
      (data) => new Category(data),
    );
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const prismaCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!prismaCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (prismaCategory.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this category',
      );
    }

    return new Category(prismaCategory);
  }

  async update(
    id: string,
    userId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.findOne(id, userId);
    const updatedPrismaCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return new Category(updatedPrismaCategory);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    const transactionsCount = await this.prisma.transaction.count({
      where: { categoryId: id },
    });

    if (transactionsCount > 0) {
      let defaultCategory = await this.prisma.category.findFirst({
        where: {
          userId,
          name: 'Deleted category',
        },
      });

      if (!defaultCategory) {
        defaultCategory = await this.prisma.category.create({
          data: {
            name: 'Uncategorized',
            description:
              'Default category for transactions from deleted categories',
            color: '#999999',
            userId,
            budgetAmount: 0,
            isActive: false,
          },
        });
      }

      await this.prisma.transaction.updateMany({
        where: { categoryId: id },
        data: {
          categoryId: defaultCategory.id,
          updatedAt: new Date(),
        },
      });

      console.log(
        `Moved ${transactionsCount} transactions to "Deleted category"`,
      );
    }
    await this.prisma.category.delete({
      where: { id },
    });
  }
}
