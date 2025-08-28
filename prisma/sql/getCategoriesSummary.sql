WITH budget_total AS (
  SELECT COALESCE(SUM("budgetAmount"), 0) AS total_budget
  FROM categories
  WHERE "userId" = $1 AND "isActive" = true
),
transaction_totals AS (
  SELECT 
    COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS total_spent,
    COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS total_income
  FROM transactions t
  INNER JOIN categories c ON t."categoryId" = c.id
  WHERE c."userId" = $1 AND c."isActive" = true
)
SELECT 
  bt.total_budget AS "totalBudget",
  tt.total_spent AS "totalSpent",
  tt.total_income AS "totalIncome"
FROM budget_total bt
CROSS JOIN transaction_totals tt;