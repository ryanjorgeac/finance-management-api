import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Groceries',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'Expenses related to groceries',
  })
  @IsOptional()
  @IsString()
  @MaxLength(48)
  description?: string;

  @ApiProperty({
    description: 'Color associated with the category',
    example: '#FF5733',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({
    description: 'Icon associated with the category',
    example: 'icon-name',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Budget amount for the category',
    example: 1000,
  })
  @IsNumber()
  budgetAmount: number;

  @ApiProperty({
    description: 'Indicates if the category is active',
    example: true,
  })
  @IsOptional()
  isActive?: boolean;
}
