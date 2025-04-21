import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Expose } from 'class-transformer';

export class AuthUserDto {
  @ApiProperty({
    description: 'User ID',
    example: '123456',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'test@test.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Ryan',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Carvalho',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'User role',
    example: 'USER',
    enum: UserRole,
  })
  @Expose()
  role: UserRole;

  constructor(partial: Partial<AuthUserDto>) {
    Object.assign(this, partial);
  }
}

export class AuthResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @Expose()
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @Expose()
  @ApiProperty({
    description: 'User information',
    type: AuthUserDto,
    example: {
      id: '123456',
      email: 'test@test.com',
      firstName: 'Ryan',
      lastName: 'Carvalho',
      role: 'user',
    },
  })
  user: AuthUserDto;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
