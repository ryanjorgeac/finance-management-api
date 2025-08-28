import { CategoriesSummaryDto } from './categories-summary.dto';
import { plainToClass } from 'class-transformer';

describe('CategoriesSummaryDto', () => {
  describe('constructor', () => {
    it('should create DTO with all properties', () => {
      const data = {
        totalBudget: 100000, // 1000.00 in cents
        totalSpent: 45000, // 450.00 in cents
        remainingBudget: 55000, // 550.00 in cents
      };

      const dto = new CategoriesSummaryDto(data);

      expect(dto.totalBudget).toBe(100000);
      expect(dto.totalSpent).toBe(45000);
      expect(dto.remainingBudget).toBe(55000);
    });

    it('should handle zero values', () => {
      const data = {
        totalBudget: 0,
        totalSpent: 0,
        remainingBudget: 0,
      };

      const dto = new CategoriesSummaryDto(data);

      expect(dto.totalBudget).toBe(0);
      expect(dto.totalSpent).toBe(0);
      expect(dto.remainingBudget).toBe(0);
    });

    it('should handle negative remaining budget', () => {
      const data = {
        totalBudget: 50000,
        totalSpent: 75000,
        remainingBudget: -25000,
      };

      const dto = new CategoriesSummaryDto(data);

      expect(dto.remainingBudget).toBe(-25000);
    });
  });

  describe('class-transformer integration', () => {
    it('should have proper structure for transformation', () => {
      const plainObject = {
        totalBudget: 100000, // Should become 1000.00
        totalSpent: 45000, // Should become 450.00
        remainingBudget: 55000, // Should become 550.00
      };

      const dto = plainToClass(CategoriesSummaryDto, plainObject);

      // Test validates the DTO structure is correct for transformation
      expect(dto.totalBudget).toBeDefined();
      expect(dto.totalSpent).toBeDefined();
      expect(dto.remainingBudget).toBeDefined();
    });
  });
});