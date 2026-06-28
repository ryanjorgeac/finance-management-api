-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- Update existing default categories
UPDATE "categories" SET "isDefault" = true WHERE "name" = 'Sem categoria';
