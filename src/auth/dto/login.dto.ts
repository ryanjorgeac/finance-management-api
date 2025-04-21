import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User email address',
    example: 'test@test.com',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  password: string;
}
