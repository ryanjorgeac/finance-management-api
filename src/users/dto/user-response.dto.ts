import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '1234567890abcdef',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'test@test.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'Name',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Lastname',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'USER',
  })
  @Expose()
  role: UserRole;

  @Exclude()
  password?: string;

  @ApiProperty({
    description: 'Indicates the time when the user was created',
    example: '2025-04-21T12:00:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Indicates the time when the user was last updated',
    example: '2025-04-21T12:00:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
