import { Expose } from 'class-transformer';

export class BalanceResponseDto {
  @Expose()
  totalBalance: number;

  @Expose()
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
  }[];

  constructor(partial: Partial<BalanceResponseDto>) {
    Object.assign(this, partial);
  }
}
