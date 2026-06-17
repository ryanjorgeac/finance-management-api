import { Category } from '@/categories/entities/category.entity';
import { CategoryResponseDto } from '@/categories/dto';
import { bigintToMoneyString } from '@/common/utils/bigint-transform';

function normalizeNullableVisual(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }

  return value.trim() === '' ? null : value;
}

export function fromEntity(category: Category): CategoryResponseDto {
  return new CategoryResponseDto({
    id: category.id,
    name: category.name,
    description: category.description,
    color: normalizeNullableVisual(category.color),
    icon: normalizeNullableVisual(category.icon),
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
