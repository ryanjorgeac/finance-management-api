import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCategoryDto } from './create-category.dto';

describe('CreateCategoryDto', () => {
  const validDto = {
    name: 'Groceries',
    budgetAmount: 100000,
  };

  describe('budgetAmount @Max constraint', () => {
    it('should accept budgetAmount at the maximum value (9999999999999)', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        ...validDto,
        budgetAmount: 9999999999999,
      });

      const errors = await validate(dto);
      const budgetErrors = errors.filter((e) => e.property === 'budgetAmount');

      expect(budgetErrors).toHaveLength(0);
    });

    it('should reject budgetAmount exceeding the maximum value', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        ...validDto,
        budgetAmount: 10000000000000,
      });

      const errors = await validate(dto);
      const budgetErrors = errors.filter((e) => e.property === 'budgetAmount');

      expect(budgetErrors).toHaveLength(1);
      expect(budgetErrors[0].constraints).toHaveProperty('max');
    });

    it('should accept budgetAmount at the minimum value (0)', async () => {
      const dto = plainToInstance(CreateCategoryDto, {
        ...validDto,
        budgetAmount: 0,
      });

      const errors = await validate(dto);
      const budgetErrors = errors.filter((e) => e.property === 'budgetAmount');

      expect(budgetErrors).toHaveLength(0);
    });
  });
});
