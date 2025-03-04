import { Expose } from 'class-transformer';

export class AccountResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  type: string;

  @Expose()
  balance: number;

  @Expose()
  userId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<AccountResponseDto>) {
    Object.assign(this, partial);
  }
}
