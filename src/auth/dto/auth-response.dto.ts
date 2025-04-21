import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthUserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  role: string;

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
