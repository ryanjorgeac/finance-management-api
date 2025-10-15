import { Prisma } from '@prisma/client';

export const getUserCategoriesQuery = (userId: string) => Prisma.sql`
  SELECT
    c.id,
    c.name,
    c.description,
    c.color,
    c.icon,
    c."budgetAmount",
    c."isActive",
    c."createdAt",
    c."updatedAt",
    COALESCE(CAST(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END) AS BIGINT), CAST(0 AS BIGINT)) AS "spentAmount",
    COALESCE(CAST(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END) AS BIGINT), CAST(0 AS BIGINT)) AS "incomeAmount",
    COALESCE(CAST(COUNT(t.id) AS INTEGER), CAST(0 AS INTEGER)) AS "transactionCount"
  FROM
    categories AS c
  LEFT JOIN
    transactions AS t ON c.id = t."categoryId"
  WHERE
    c."userId" = ${userId}
  GROUP BY
    c.id
  ORDER BY
    c.name ASC;
`;

export const getCategoriesSummaryQuery = (userId: string) => Prisma.sql`
  WITH budget_total AS (
    SELECT COALESCE(SUM("budgetAmount"), 0)::BIGINT AS total_budget
    FROM categories
    WHERE "userId" = ${userId} AND "isActive" = true
  ),
  transaction_totals AS (
    SELECT 
      COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0)::BIGINT AS total_spent,
      COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0)::BIGINT AS total_income
    FROM transactions t
    INNER JOIN categories c ON t."categoryId" = c.id
    WHERE c."userId" = ${userId} AND c."isActive" = true
  )
  SELECT 
    COALESCE(bt.total_budget, 0)::BIGINT AS "totalBudget",
    COALESCE(tt.total_spent, 0)::BIGINT AS "totalSpent",
    COALESCE(tt.total_income, 0)::BIGINT AS "totalIncome",
    (COALESCE(bt.total_budget, 0) - COALESCE(tt.total_spent, 0) + COALESCE(tt.total_income, 0))::BIGINT AS "remainingBudget"
  FROM budget_total bt
  CROSS JOIN transaction_totals tt;
`;
