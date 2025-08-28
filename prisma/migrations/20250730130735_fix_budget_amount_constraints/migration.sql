/*
  Warnings:

  - Made the column `budgetAmount` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- Set a default value and ensure NOT NULL
ALTER TABLE "categories" 
  ALTER COLUMN "budgetAmount" SET DEFAULT 0,
  ALTER COLUMN "budgetAmount" SET NOT NULL;

-- Update any existing NULL values to 0 (just in case)
UPDATE "categories" SET "budgetAmount" = 0 WHERE "budgetAmount" IS NULL;
