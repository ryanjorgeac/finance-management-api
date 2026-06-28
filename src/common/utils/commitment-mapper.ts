import { Commitment } from '@/commitments/entities/commitment.entity';
import { CommitmentResponseDto } from '@/commitments/dto';
import { bigintToMoneyString } from '@/common/utils/bigint-transform';

export function fromEntity(commitment: Commitment): CommitmentResponseDto {
  return new CommitmentResponseDto({
    id: commitment.id,
    amount: bigintToMoneyString(commitment.amount),
    type: commitment.type,
    description: commitment.description,
    date: commitment.date ?? null,
    frequency: commitment.frequency,
    userId: commitment.userId,
    categoryId: commitment.categoryId,
    createdAt: commitment.createdAt,
    updatedAt: commitment.updatedAt,
  });
}

export function fromEntities(
  commitments: Commitment[],
): CommitmentResponseDto[] {
  return commitments.map((commitment) => fromEntity(commitment));
}
