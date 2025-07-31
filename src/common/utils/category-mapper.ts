import { Category } from 'src/categories/entities/category.entity';
import { CategoryResponseDto } from 'src/categories/dto';
import { bigintToMoneyString } from './bigint-transform';

export function fromEntity(category: Category): CategoryResponseDto {
  return new CategoryResponseDto({
    id: category.id,
    name: category.name,
    description: category.description,
    color: category.color,
    icon: category.icon,
    budgetAmount: bigintToMoneyString(category.budgetAmount),
    userId: category.userId,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    spentAmount: bigintToMoneyString(category.spentAmount),
    incomeAmount: bigintToMoneyString(category.incomeAmount),
    remainingAmount: bigintToMoneyString(category.remainingAmount),
    transactionCount: category.transactionCount,
  });
}

export function fromEntities(categories: Category[]): CategoryResponseDto[] {
  return categories.map((category) => fromEntity(category));
}
