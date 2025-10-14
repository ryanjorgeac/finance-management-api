import { User } from '@/users/entities/user.entity';
import { Category } from '@/categories/entities/category.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';

describe('Category Entity', () => {
  describe('constructor', () => {
    it('should create category with all properties', () => {
      const categoryData: Partial<Category> = {
        id: 'category-123',
        name: 'Test Category',
        description: 'Test Description',
        color: '#FF5733',
        icon: 'test-icon',
        budgetAmount: 50000n,
        userId: 'user-123',
        user: new User({ id: 'user-123' }),
        transactions: [new Transaction({ id: 't-1234' })],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        spentAmount: 25000n,
        incomeAmount: 5000n,
        transactionCount: 1,
      };

      const category = new Category(categoryData);

      expect(category.id).toBe(categoryData.id);
      expect(category.name).toBe(categoryData.name);
      expect(category.spentAmount).toBe(25000n);
      expect(category.incomeAmount).toBe(5000n);
      expect(category.transactionCount).toBe(1);
      expect(category.budgetAmount).toBe(50000n);
    });

    it('should handle BigInt values from database queries', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const categoryData: Partial<Category> = {
        id: 'category-123',
        name: 'Test Category',
        budgetAmount: BigInt(50000),
        userId: 'user-123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        spentAmount: BigInt(25000),
        incomeAmount: BigInt(5000),
        transactionCount: BigInt(10),
      } as any;

      const category = new Category(categoryData);

      expect(category.spentAmount).toBe(25000n);
      expect(category.incomeAmount).toBe(5000n);
      expect(category.transactionCount).toBe(10n);
      expect(category.budgetAmount).toBe(50000n);
    });

    it('should handle null and undefined values', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const categoryData: Partial<Category> = {
        id: 'category-123',
        name: 'Test Category',
        budgetAmount: 200,
        userId: 'user-123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        spentAmount: undefined,
        incomeAmount: undefined,
        transactionCount: undefined,
      } as any; // Type assertion to handle mixed null/undefined values

      const category = new Category(categoryData);

      expect(category.spentAmount).toBe(0);
      expect(category.incomeAmount).toBe(0);
      expect(category.transactionCount).toBe(0);
      expect(category.budgetAmount).toBe(200n);
    });
  });

  describe('getRemainingAmount', () => {
    it('should calculate remaining amount correctly with budget', () => {
      const category = new Category({
        budgetAmount: 50000n,
        spentAmount: 25000n,
        incomeAmount: 5000n,
      });

      const remaining = category.getRemainingAmount();

      // 500.00 - 250.00 + 50.00 = 300.00 (30000 cents)
      expect(remaining).toBe(30000n);
    });

    it('should handle negative remaining amount', () => {
      const category = new Category({
        budgetAmount: 20000n,
        spentAmount: 35000n,
        incomeAmount: 5000n,
      });

      const remaining = category.getRemainingAmount();

      // 200.00 - 350.00 + 50.00 = -100.00 (-10000 cents)
      expect(remaining).toBe(-10000n);
    });

    it('should handle zero values', () => {
      const category = new Category({
        budgetAmount: 0n,
        spentAmount: 0n,
        incomeAmount: 0n,
      });

      const remaining = category.getRemainingAmount();

      expect(remaining).toBe(0n);
    });
  });
});
