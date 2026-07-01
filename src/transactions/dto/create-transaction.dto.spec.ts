import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTransactionDto } from './create-transaction.dto';
import { TransactionType } from '@prisma/client';

describe('CreateTransactionDto', () => {
  const validDto = {
    amountCents: 1059,
    type: TransactionType.INCOME,
    description: 'Test transaction',
    date: new Date('2025-04-21T12:00:00Z'),
    categoryId: '550e8400-e29b-41d4-a716-446655440000',
  };

  describe('amountCents @Max constraint', () => {
    it('should accept amountCents at the maximum value (9999999999999)', async () => {
      const dto = plainToInstance(CreateTransactionDto, {
        ...validDto,
        amountCents: 9999999999999,
      });

      const errors = await validate(dto);
      const amountErrors = errors.filter((e) => e.property === 'amountCents');

      expect(amountErrors).toHaveLength(0);
    });

    it('should reject amountCents exceeding the maximum value', async () => {
      const dto = plainToInstance(CreateTransactionDto, {
        ...validDto,
        amountCents: 10000000000000,
      });

      const errors = await validate(dto);
      const amountErrors = errors.filter((e) => e.property === 'amountCents');

      expect(amountErrors).toHaveLength(1);
      expect(amountErrors[0].constraints).toHaveProperty('max');
    });

    it('should accept amountCents at the minimum value (1)', async () => {
      const dto = plainToInstance(CreateTransactionDto, {
        ...validDto,
        amountCents: 1,
      });

      const errors = await validate(dto);
      const amountErrors = errors.filter((e) => e.property === 'amountCents');

      expect(amountErrors).toHaveLength(0);
    });
  });
});
