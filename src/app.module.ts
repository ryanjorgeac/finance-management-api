import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
// import { AccountsModule } from './accounts/accounts.module';
import { ReportsModule } from './reports/reports.module';
import { PrismaModule } from './database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    TransactionsModule,
    CategoriesModule,
    // AccountsModule,
    ReportsModule,
    PrismaModule,
  ],
})
export class AppModule {}
