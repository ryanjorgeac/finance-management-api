import { User } from '../../users/entities/user.entity';
import { Category } from './category.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

describe('Category Entity', () => {
  describe('constructor', () => {
    it('should create category with all properties', () => {
      const categoryData = {
        id: 'category-123',
        name: 'Test Category',
        description: 'Test Description',
        color: '#FF5733',
        icon: 'test-icon',
        budgetAmount: 50000, // 500.00 in cents
        userId: 'user-123',
        user: new User({ id: 'user-123' }),
        transactions: [new Transaction({ id: 't-1234' })],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        spentAmount: 25000, // 250.00 in cents
        incomeAmount: 5000, // 50.00 in cents
        transactionCount: 1,
      };

      const category = new Category(categoryData);

      expect(category.id).toBe(categoryData.id);
      expect(category.name).toBe(categoryData.name);
      expect(category.spentAmount).toBe(25000);
      expect(category.incomeAmount).toBe(5000);
      expect(category.transactionCount).toBe(1);
      expect(category.budgetAmount).toBe(50000);
    });

    it('should handle BigInt values from database queries', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const categoryData = {
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
      } as any; // Type assertion to handle BigInt values

      const category = new Category(categoryData);

      expect(category.spentAmount).toBe(25000);
      expect(category.incomeAmount).toBe(5000);
      expect(category.transactionCount).toBe(10);
      expect(category.budgetAmount).toBe(50000);
    });

    it('should handle null and undefined values', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const categoryData = {
        id: 'category-123',
        name: 'Test Category',
        budgetAmount: null,
        userId: 'user-123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        spentAmount: undefined,
        incomeAmount: undefined, // Changed from null to undefined for consistency
        transactionCount: undefined,
      } as any; // Type assertion to handle mixed null/undefined values

      const category = new Category(categoryData);

      expect(category.spentAmount).toBe(0);
      expect(category.incomeAmount).toBe(0);
      expect(category.transactionCount).toBe(0);
      expect(category.budgetAmount).toBeNull();
    });
  });

  describe('getRemainingAmount', () => {
    it('should calculate remaining amount correctly with budget', () => {
      const category = new Category({
        budgetAmount: 50000, // 500.00 in cents
        spentAmount: 25000, // 250.00 in cents
        incomeAmount: 5000, // 50.00 in cents
      });

      const remaining = category.getRemainingAmount();

      // 500.00 - 250.00 + 50.00 = 300.00 (30000 cents)
      expect(remaining).toBe(30000);
    });

    it('should return 0 when budget is null', () => {
      const category = new Category({
        budgetAmount: null,
        spentAmount: 25000,
        incomeAmount: 5000,
      });

      const remaining = category.getRemainingAmount();

      expect(remaining).toBe(0);
    });

    it('should handle negative remaining amount', () => {
      const category = new Category({
        budgetAmount: 20000, // 200.00 in cents
        spentAmount: 35000, // 350.00 in cents
        incomeAmount: 5000, // 50.00 in cents
      });

      const remaining = category.getRemainingAmount();

      // 200.00 - 350.00 + 50.00 = -100.00 (-10000 cents)
      expect(remaining).toBe(-10000);
    });

    it('should handle zero values', () => {
      const category = new Category({
        budgetAmount: 0,
        spentAmount: 0,
        incomeAmount: 0,
      });

      const remaining = category.getRemainingAmount();

      expect(remaining).toBe(0);
    });
  });

  describe('convertToNumber', () => {
    it('should convert BigInt to number', () => {
      const category = new Category({});
      const result = category['convertToNumber'](BigInt(12345));

      expect(result).toBe(12345);
      expect(typeof result).toBe('number');
    });

    it('should return number as is', () => {
      const category = new Category({});
      const result = category['convertToNumber'](12345);

      expect(result).toBe(12345);
    });

    it('should return null for null input', () => {
      const category = new Category({});
      const result = category['convertToNumber'](null);

      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const category = new Category({});
      const result = category['convertToNumber'](undefined);

      expect(result).toBeNull();
    });

    it('should convert string numbers to number', () => {
      const category = new Category({});
      const result = category['convertToNumber']('12345');

      expect(result).toBe(12345);
    });
  });
});
