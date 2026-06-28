import { CategoriesSummaryDto } from './categories-summary.dto';
import { plainToClass } from 'class-transformer';

describe('CategoriesSummaryDto', () => {
  describe('constructor', () => {
    it('should create DTO with all properties', () => {
      const data = {
        totalBudget: '1.000,00',
        totalSpent: '450,00',
        remainingBudget: '550,00',
      };

      const dto = new CategoriesSummaryDto(data);

      expect(dto.totalBudget).toBe('1.000,00');
      expect(dto.totalSpent).toBe('450,00');
      expect(dto.remainingBudget).toBe('550,00');
    });

    it('should handle zero values', () => {
      const data = {
        totalBudget: '0,00',
        totalSpent: '0,00',
        remainingBudget: '0,00',
      };

      const dto = new CategoriesSummaryDto(data);

      expect(dto.totalBudget).toBe('0,00');
      expect(dto.totalSpent).toBe('0,00');
      expect(dto.remainingBudget).toBe('0,00');
    });

    it('should handle negative remaining budget', () => {
      const data = {
        totalBudget: '500,00',
        totalSpent: '750,00',
        remainingBudget: '-250,00',
      };

      const dto = new CategoriesSummaryDto(data);

      expect(dto.remainingBudget).toBe('-250,00');
    });
  });

  describe('class-transformer integration', () => {
    it('should have proper structure for transformation', () => {
      const plainObject = {
        totalBudget: '1.000,00',
        totalSpent: '450,00',
        remainingBudget: '550,00',
      };

      const dto = plainToClass(CategoriesSummaryDto, plainObject);

      expect(dto.totalBudget).toBeDefined();
      expect(dto.totalSpent).toBeDefined();
      expect(dto.remainingBudget).toBeDefined();
      expect(dto.totalBudget).toBe('1.000,00');
    });
  });
});
