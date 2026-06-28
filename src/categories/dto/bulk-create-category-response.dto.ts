import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BulkCreateCategoryResponseDto {
  @ApiProperty({
    description: 'Number of categories successfully created',
    example: 3,
  })
  @Expose()
  count: number;

  constructor(partial: Partial<BulkCreateCategoryResponseDto>) {
    Object.assign(this, partial);
  }
}
