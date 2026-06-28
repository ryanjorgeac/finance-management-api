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
  centsToBigInt,
} from '../common/utils/bigint-transform';
import {
  DEFAULT_CATEGORY_NAME,
  DEFAULT_CATEGORY_DATA,
} from '../common/constants';

const RawCategoryData = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  icon: z.string().nullable(),
  budgetAmount: z.bigint(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
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

    const categories = validateResults.map((data) => new Category(data));

    const hasDefault = categories.some(
      (cat) => cat.name === DEFAULT_CATEGORY_NAME,
    );

    if (!hasDefault) {
      const defaultCategory = await this.ensureDefaultCategory(userId);
      categories.unshift(defaultCategory);
    }

    return categories;
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
    const category = await this.findOne(id, userId);

    if (category.isDefault) {
      throw new ForbiddenException('The default category cannot be modified');
    }

    this.logger.log(`Updating category ${id}`);

    const budgetAmountInCents = updateCategoryDto.budgetAmount
      ? centsToBigInt(updateCategoryDto.budgetAmount)
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
    const category = await this.findOne(id, userId);

    if (category.isDefault) {
      throw new ForbiddenException('The default category cannot be deleted');
    }

    const [transactionsCount, commitmentsCount] = await Promise.all([
      this.prisma.transaction.count({ where: { categoryId: id } }),
      this.prisma.commitment.count({ where: { categoryId: id } }),
    ]);

    if (transactionsCount > 0 || commitmentsCount > 0) {
      let defaultCategory = await this.prisma.category.findFirst({
        where: {
          userId,
          name: DEFAULT_CATEGORY_NAME,
        },
      });

      if (!defaultCategory) {
        defaultCategory = await this.prisma.category.create({
          data: {
            ...DEFAULT_CATEGORY_DATA,
            userId,
          },
        });
      }

      if (transactionsCount > 0) {
        await this.prisma.transaction.updateMany({
          where: { categoryId: id },
          data: {
            categoryId: defaultCategory.id,
            updatedAt: new Date(),
          },
        });
        this.logger.log(
          `Reassigned ${transactionsCount} transactions from category ${id} to default category ${defaultCategory.id}`,
        );
      }

      if (commitmentsCount > 0) {
        await this.prisma.commitment.updateMany({
          where: { categoryId: id },
          data: {
            categoryId: defaultCategory.id,
            updatedAt: new Date(),
          },
        });
        this.logger.log(
          `Reassigned ${commitmentsCount} commitments from category ${id} to default category ${defaultCategory.id}`,
        );
      }
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }

  async getUserSummary(userId: string): Promise<CategoriesSummaryDto> {
    const summary = await this.prisma.$queryRaw<Array<bigint>>(
      getCategoriesSummaryQuery(userId),
    );

    if (!summary || summary.length === 0) {
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

  async bulkCreate(
    userId: string,
    dtos: CreateCategoryDto[],
  ): Promise<{ count: number }> {
    const reserved = dtos.find((dto) => dto.name === DEFAULT_CATEGORY_NAME);

    if (reserved) {
      throw new ForbiddenException('The default category name is reserved');
    }

    const data = dtos.map((dto) => ({
      ...dto,
      budgetAmount: dto.budgetAmount ? centsToBigInt(dto.budgetAmount) : 0n,
      userId,
    }));

    const result = await this.prisma.category.createMany({ data });

    this.logger.log(
      `Bulk created ${result.count} categories for user ${userId}`,
    );

    return { count: result.count };
  }

  async ensureDefaultCategory(userId: string): Promise<Category> {
    let defaultCategory = await this.prisma.category.findFirst({
      where: {
        userId,
        name: DEFAULT_CATEGORY_NAME,
      },
    });

    if (!defaultCategory) {
      defaultCategory = await this.prisma.category.create({
        data: {
          ...DEFAULT_CATEGORY_DATA,
          userId,
        },
      });
      this.logger.log(`Created default category for user ${userId}`);
    }

    return new Category({
      ...defaultCategory,
      spentAmount: 0n,
      incomeAmount: 0n,
      transactionCount: 0,
    });
  }
}
