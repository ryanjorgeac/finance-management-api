import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryWithSummary } from '../common/types/category-with-summary';
import { CategoriesSummaryDto } from './dto/categories-summary.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const budgetAmountInCents = createCategoryDto.budgetAmount 
      ? Math.round(createCategoryDto.budgetAmount * 100) 
      : null;

    const prismaCategory = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        budgetAmount: budgetAmountInCents,
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
      COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS "spentAmount",
      COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS "incomeAmount",
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
    
    // Convert budgetAmount from dollars to cents if provided
    const updateData: any = { ...updateCategoryDto };
    if (updateCategoryDto.budgetAmount !== undefined) {
      updateData.budgetAmount = updateCategoryDto.budgetAmount 
        ? Math.round(updateCategoryDto.budgetAmount * 100) 
        : null;
    }

    const updatedPrismaCategory = await this.prisma.category.update({
      where: { id },
      data: updateData,
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

  async getUserSummary(userId: string): Promise<CategoriesSummaryDto> {
    const summary = await this.prisma.$queryRaw<
      [
        {
          totalBudget: bigint | null;
          totalSpent: bigint;
          totalIncome: bigint;
        },
      ]
    >`
    WITH budget_total AS (
      SELECT COALESCE(SUM("budgetAmount"), 0) AS total_budget
      FROM categories
      WHERE "userId" = ${userId} AND "isActive" = true
    ),
    transaction_totals AS (
      SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS total_spent,
        COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS total_income
      FROM transactions t
      INNER JOIN categories c ON t."categoryId" = c.id
      WHERE c."userId" = ${userId} AND c."isActive" = true
    )
    SELECT 
      bt.total_budget AS "totalBudget",
      tt.total_spent AS "totalSpent",
      tt.total_income AS "totalIncome"
    FROM budget_total bt
    CROSS JOIN transaction_totals tt;
  `;
    // AND c."isActive" = true -> This condition ensures we only consider active categories but in the future we might want to calculate the user balance including inactive categories as well.

    const { totalBudget, totalSpent, totalIncome } = summary[0];

    const totalBudgetNum = totalBudget ? Number(totalBudget) : 0;
    const totalSpentNum = Number(totalSpent);
    const totalIncomeNum = Number(totalIncome);
    const remainingBudget = totalBudgetNum - totalSpentNum + totalIncomeNum;

    return new CategoriesSummaryDto({
      totalBudget: totalBudgetNum,
      totalSpent: totalSpentNum,
      remainingBudget,
    });
  }
}
