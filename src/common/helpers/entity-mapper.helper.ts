// import { User } from '../../users/entities/user.entity';
// import { Account } from '../../accounts/entities/account.entity';
// import { Category } from '../../categories/entities/category.entity';
// import { Transaction } from '../../transactions/entities/transaction.entity';
// import { Prisma } from '@prisma/client';

// type PrismaUser = Prisma.UserCreateInput;
// type PrismaAccount = Prisma.AccountCreateInput;
// type PrismaCategory = Prisma.CategoryCreateInput;
// type PrismaTransaction = Prisma.TransactionCreateInput;

// export class EntityMapper {
//   static toUserEntity(prismaUser: PrismaUser): User {
//     const userData = { ...prismaUser };
//     return new User(userData);
//   }

//   static toAccountEntity(prismaAccount: PrismaAccount): Account {
//     const { user, transactions, ...accountData } = prismaAccount;
//     return new Account(accountData);
//   }

//   static toCategoryEntity(prismaCategory: PrismaCategory): Category {
//     const { transactions, ...categoryData } = prismaCategory;
//     return new Category(categoryData);
//   }

//   static toTransactionEntity(
//     prismaTransaction: PrismaTransaction,
//   ): Transaction {
//     const { account, category, ...transactionData } = prismaTransaction;
//     return new Transaction(transactionData);
//   }

//   /**
//    * Map an array of Prisma models to entity classes
//    */
//   static toEntities<T, E>(
//     prismaModels: T[],
//     mapperFunction: (model: T) => E,
//   ): E[] {
//     return prismaModels.map((model) => mapperFunction(model));
//   }
// }
