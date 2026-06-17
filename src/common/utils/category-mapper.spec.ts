import { fromEntity } from './category-mapper';
import { Category } from '@/categories/entities/category.entity';

describe('category-mapper', () => {
  const baseCategory = {
    id: 'c1',
    name: 'Category',
    description: null,
    budgetAmount: 1000n,
    userId: 'u1',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    spentAmount: 0n,
    incomeAmount: 0n,
    transactionCount: 0,
  };

  it('maps empty visual strings to null', () => {
    const category = new Category({
      ...baseCategory,
      color: '',
      icon: '   ',
    });

    const dto = fromEntity(category);

    expect(dto.color).toBeNull();
    expect(dto.icon).toBeNull();
  });

  it('keeps configured visual values', () => {
    const category = new Category({
      ...baseCategory,
      color: '#FF5733',
      icon: 'wallet',
    });

    const dto = fromEntity(category);

    expect(dto.color).toBe('#FF5733');
    expect(dto.icon).toBe('wallet');
  });
});
