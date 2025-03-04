import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
