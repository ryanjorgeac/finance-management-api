import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { getCategoriesSummary, getUserCategories } from '@prisma/client/sql';
import { PrismaService } from '../database/prisma.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesSummaryDto } from './dto/categories-summary.dto';

// Interface to type the raw query result
interface RawCategoryData {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  budgetAmount: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  spentAmount: bigint;
  incomeAmount: bigint;
  transactionCount: number;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const budgetAmountInCents = createCategoryDto.budgetAmount
      ? Math.round(createCategoryDto.budgetAmount * 100)
      : 0;

    const prismaCategory = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        budgetAmount: budgetAmountInCents,
        userId,
      },
    });

    return new Category(prismaCategory);
  }

  private convertRawCategoryData(data: RawCategoryData): Partial<Category> {
    return {
      ...data,
      spentAmount: this.convertBigIntToNumber(data.spentAmount),
      incomeAmount: this.convertBigIntToNumber(data.incomeAmount),
      budgetAmount: data.budgetAmount ?? 0,
    };
  }

  private convertBigIntToNumber(
    value: bigint | number | null | undefined,
  ): number | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'number') return value;
    const converted = Number(value);
    return isNaN(converted) ? undefined : converted;
  }

  async findAll(userId: string): Promise<Category[]> {
    const categoriesWithSummary = (await this.prisma.$queryRawTyped(
      getUserCategories(userId),
    )) as RawCategoryData[];

    return categoriesWithSummary.map((data) => {
      const processed = this.convertRawCategoryData(data);
      return new Category(processed);
    });
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

    const budgetAmountInCents = updateCategoryDto.budgetAmount
      ? Math.round(updateCategoryDto.budgetAmount * 100)
      : 0;

    const updatedPrismaCategory = await this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        budgetAmount: budgetAmountInCents,
        userId,
      },
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
    const summary = await this.prisma.$queryRawTyped(
      getCategoriesSummary(userId),
    );

    const result = summary as Array<{
      totalBudget: bigint | null;
      totalSpent: bigint;
      totalIncome: bigint;
    }>;
    // AND c."isActive" = true -> This condition ensures we only consider active categories but in the future we might want to calculate the user balance including inactive categories as well.

    const { totalBudget, totalSpent, totalIncome } = result[0];

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
