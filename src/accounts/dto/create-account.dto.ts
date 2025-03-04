import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['checking', 'savings', 'credit', 'investment', 'loan'])
  type: string;

  @IsOptional()
  @IsNumber()
  balance?: number;
}
