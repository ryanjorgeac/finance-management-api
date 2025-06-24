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

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const category = await this.prisma.category.findUnique({
      where: { id: createTransactionDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createTransactionDto.categoryId} not found`,
      );
    }

    if (category.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to use this category',
      );
    }

    const amountInCents = Math.round(createTransactionDto.amount * 100);

    return this.prisma.$transaction(async (prismaClient) => {
      const prismaTransaction = await prismaClient.transaction.create({
        data: {
          ...createTransactionDto,
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

    const transactions = prismaTransactions.map(
      (t) => new TransactionResponseDto(t),
    );

    return { transactions, total, page, limit };
  }

  async findOne(id: string, userId: string): Promise<TransactionResponseDto> {
    const prismaTransaction = await this.prisma.transaction.findUnique({
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
    return new TransactionResponseDto(prismaTransaction);
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const existingTransaction = await this.findOne(id, userId);
    if (
      updateTransactionDto.categoryId &&
      updateTransactionDto.categoryId !== existingTransaction.categoryId
    ) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateTransactionDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateTransactionDto.categoryId} not found`,
        );
      }

      if (category.userId !== userId) {
        throw new ForbiddenException(
          'You do not have permission to use this category',
        );
      }
    }

    return this.prisma.$transaction(async (prismaClient) => {
      const updatedPrismaTransaction = await prismaClient.transaction.update({
        where: { id },
        data: updateTransactionDto,
        include: {
          category: true,
        },
      });

      return new TransactionResponseDto(updatedPrismaTransaction);
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
}
