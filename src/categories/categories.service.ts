import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { z } from 'zod';
import {
  getCategoriesSummaryQuery,
  getUserCategoriesQuery,
} from '../queries/category.queries';
import { PrismaService } from '../database/prisma.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesSummaryDto } from './dto/categories-summary.dto';
import {
  bigintToMoneyString,
  reaisToCents,
  centsToBigInt,
} from '../common/utils/bigint-transform';

const RawCategoryData = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string(),
  icon: z.string(),
  budgetAmount: z.bigint(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  spentAmount: z.bigint(),
  incomeAmount: z.bigint(),
  transactionCount: z.number(),
});

const CategoriesSummaryArraySchema = z.array(RawCategoryData);

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(CategoriesService.name);

  async create(
    userId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const budgetAmountInCents: bigint = createCategoryDto.budgetAmount
      ? centsToBigInt(createCategoryDto.budgetAmount)
      : 0n;

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
    const categoriesWithSummary = await this.prisma.$queryRaw(
      getUserCategoriesQuery(userId),
    );

    const validateResults = CategoriesSummaryArraySchema.parse(
      categoriesWithSummary,
    );

    return validateResults.map((data) => {
      return new Category(data);
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
      ? reaisToCents(updateCategoryDto.budgetAmount)
      : undefined;

    const updatedPrismaCategory = await this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        budgetAmount: budgetAmountInCents,
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
    const summary = await this.prisma.$queryRaw(
      getCategoriesSummaryQuery(userId),
    );

    if (!summary) {
      this.logger.log(`No summary data found for user ${userId}`);
      return new CategoriesSummaryDto({
        totalBudget: '0,00',
        totalSpent: '0,00',
        remainingBudget: '0,00',
      });
    }

    const result = summary[0] as unknown as {
      totalBudget: bigint;
      totalSpent: bigint;
      totalIncome: bigint;
      remainingBudget: bigint;
    };

    this.logger.debug(
      `Summary for user ${userId}: Budget=${result.totalBudget}, Spent=${result.totalSpent}, Income=${result.totalIncome}, Remaining=${result.remainingBudget}`,
    );

    const totalBudgetStr = bigintToMoneyString(result.totalBudget);
    const totalSpentStr = bigintToMoneyString(result.totalSpent);
    const remainingBudgetStr = bigintToMoneyString(result.remainingBudget);

    this.logger.log(`User ${userId} summary retrieved successfully`);

    return new CategoriesSummaryDto({
      totalBudget: totalBudgetStr,
      totalSpent: totalSpentStr,
      remainingBudget: remainingBudgetStr,
    });
  }
}
