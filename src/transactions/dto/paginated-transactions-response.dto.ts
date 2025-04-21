import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { TransactionResponseDto } from './transaction-response.dto';

export class PaginatedTransactionsResponseDto extends PaginatedResponseDto<TransactionResponseDto> {
  @ApiProperty({
    type: [TransactionResponseDto],
    description: 'List of transactions on the current page',
  })
  declare data: TransactionResponseDto[];
}
