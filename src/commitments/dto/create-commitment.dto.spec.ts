import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCommitmentDto } from './create-commitment.dto';
import { TransactionType, CommitmentFrequency } from '@prisma/client';

describe('CreateCommitmentDto', () => {
  const validDto = {
    amountCents: 150000,
    type: TransactionType.EXPENSE,
    description: 'Monthly rent',
    date: new Date('2025-05-01T00:00:00Z'),
    frequency: CommitmentFrequency.MONTHLY,
    categoryId: 'category-id-test',
  };

  describe('amountCents @Max constraint', () => {
    it('should accept amountCents at the maximum value (9999999999999)', async () => {
      const dto = plainToInstance(CreateCommitmentDto, {
        ...validDto,
        amountCents: 9999999999999,
      });

      const errors = await validate(dto);
      const amountErrors = errors.filter((e) => e.property === 'amountCents');

      expect(amountErrors).toHaveLength(0);
    });

    it('should reject amountCents exceeding the maximum value', async () => {
      const dto = plainToInstance(CreateCommitmentDto, {
        ...validDto,
        amountCents: 10000000000000,
      });

      const errors = await validate(dto);
      const amountErrors = errors.filter((e) => e.property === 'amountCents');

      expect(amountErrors).toHaveLength(1);
      expect(amountErrors[0].constraints).toHaveProperty('max');
    });

    it('should accept amountCents at the minimum value (1)', async () => {
      const dto = plainToInstance(CreateCommitmentDto, {
        ...validDto,
        amountCents: 1,
      });

      const errors = await validate(dto);
      const amountErrors = errors.filter((e) => e.property === 'amountCents');

      expect(amountErrors).toHaveLength(0);
    });
  });
});
