/*
  Warnings:

  - You are about to alter the column `budgetAmount` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `amount` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "budgetAmount" DROP DEFAULT,
ALTER COLUMN "budgetAmount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "amount" SET DATA TYPE INTEGER;
