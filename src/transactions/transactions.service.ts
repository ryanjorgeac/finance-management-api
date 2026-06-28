import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionQueryCondition } from 'src/common/types/transaction-query-condition';
import { TransactionResponseDto } from './dto';
import { centsToBigInt } from '@/common/utils/bigint-transform';
import { fromEntity, toEntity } from '@/common/utils/transaction-mapper';
import { TransactionWithCategory } from './types/transaction-with-category.type';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  private parseAmountCents(amountCents: number): bigint {
    try {
      return centsToBigInt(amountCents);
    } catch {
      throw new BadRequestException(
        'amountCents must be an integer number of cents',
      );
    }
  }

  async create(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const { amountCents, ...createData } = createTransactionDto;

    const category = await this.prisma.category.findUnique({
      where: { id: createData.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createData.categoryId} not found`,
      );
    }

    if (category.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to use this category',
      );
    }

    const amountInCents = this.parseAmountCents(amountCents);

    return this.prisma.$transaction(async (prismaClient) => {
      const prismaTransaction = await prismaClient.transaction.create({
        data: {
          ...createData,
          amount: amountInCents,
          userId,
        },
      });
      return new Transaction(prismaTransaction);
    });
  }

  async findAll(
    userId: string,
    query: TransactionQueryDto,
  ): Promise<{
    transactions: TransactionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      categoryId,
      type,
      startDate,
      endDate,
      search,
      order = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: TransactionQueryCondition = { userId };
    Object.assign(where, {
      ...(categoryId && { categoryId }),
      ...(type && { type }),
      ...(search && {
        description: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    });
    if (startDate || endDate) {
      where.date = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new BadRequestException(
          'Start date cannot be greater than end date',
        );
      }
    }

    const [prismaTransactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: order },
        include: { category: false },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const transactions = prismaTransactions.map((t) =>
      fromEntity(new Transaction(t)),
    );

    return { transactions, total, page, limit };
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const prismaTransaction: TransactionWithCategory | null =
      await this.prisma.transaction.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

    if (!prismaTransaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (prismaTransaction.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this transaction',
      );
    }
    return toEntity(prismaTransaction);
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const { amountCents, ...updateData } = updateTransactionDto;

    const existingTransaction = await this.findOne(id, userId);
    if (
      updateData.categoryId &&
      updateData.categoryId !== existingTransaction.categoryId
    ) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateData.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateData.categoryId} not found`,
        );
      }

      if (category.userId !== userId) {
        throw new ForbiddenException(
          'You do not have permission to use this category',
        );
      }
    }

    const amountInCents =
      amountCents !== undefined
        ? this.parseAmountCents(amountCents)
        : undefined;

    return this.prisma.$transaction(async (prismaClient) => {
      const updatedPrismaTransaction: TransactionWithCategory =
        await prismaClient.transaction.update({
          where: { id },
          data: {
            ...updateData,
            ...(amountInCents !== undefined ? { amount: amountInCents } : {}),
          },
          include: {
            category: true,
          },
        });

      return toEntity(updatedPrismaTransaction);
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findOne(id, userId);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    if (transaction.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this transaction',
      );
    }

    await this.prisma.$transaction(async (prismaClient) => {
      await prismaClient.transaction.delete({
        where: { id },
      });
    });
  }

  async createFromCommitment(
    commitmentId: string,
    userId: string,
  ): Promise<Transaction> {
    const commitment = await this.prisma.commitment.findUnique({
      where: { id: commitmentId },
    });

    if (!commitment) {
      throw new NotFoundException(
        `Commitment with ID ${commitmentId} not found`,
      );
    }

    if (commitment.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to use this commitment',
      );
    }

    return this.prisma.$transaction(async (prismaClient) => {
      const prismaTransaction = await prismaClient.transaction.create({
        data: {
          amount: commitment.amount,
          type: commitment.type,
          description: commitment.description,
          date: new Date(),
          userId,
          categoryId: commitment.categoryId,
        },
      });
      return new Transaction(prismaTransaction);
    });
  }
}
