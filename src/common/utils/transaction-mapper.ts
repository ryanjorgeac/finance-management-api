import { Transaction } from '@/transactions/entities/transaction.entity';
import { TransactionResponseDto } from '@/transactions/dto';
import { bigintToMoneyString } from '@/common/utils/bigint-transform';
import { Category } from '@/categories/entities/category.entity';
import { TransactionWithCategory } from '@/transactions/types/transaction-with-category.type';

export function fromEntity(transaction: Transaction): TransactionResponseDto {
  return new TransactionResponseDto({
    id: transaction.id,
    amount: bigintToMoneyString(transaction.amount),
    type: transaction.type,
    description: transaction.description,
    date: transaction.date,
    userId: transaction.userId,
    categoryId: transaction.categoryId,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  });
}

export function fromEntities(
  transactions: Transaction[],
): TransactionResponseDto[] {
  return transactions.map((transaction) => fromEntity(transaction));
}

export function toEntity(
  prismaTransaction: TransactionWithCategory,
): Transaction {
  return new Transaction({
    id: prismaTransaction.id,
    amount: prismaTransaction.amount,
    type: prismaTransaction.type,
    description: prismaTransaction.description,
    date: prismaTransaction.date,
    userId: prismaTransaction.userId,
    categoryId: prismaTransaction.categoryId,
    category: new Category(prismaTransaction.category),
    createdAt: prismaTransaction.createdAt,
    updatedAt: prismaTransaction.updatedAt,
  });
}
