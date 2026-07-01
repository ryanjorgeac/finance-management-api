import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  Max,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Groceries',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'Expenses related to groceries',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(48)
  description?: string;

  @ApiProperty({
    description: 'Color associated with the category',
    example: '#FF5733',
    required: false,
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({
    description: 'Icon associated with the category',
    example: 'icon-name',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Budget amount for the category in cents',
    example: 100000,
    required: true,
  })
  @IsInt()
  @Min(0)
  @Max(9999999999999)
  budgetAmount: number;

  @ApiProperty({
    description: 'Indicates if the category is active',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  isActive?: boolean;
}
