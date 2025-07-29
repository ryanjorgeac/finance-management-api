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
      COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS "spentAmount",
      COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS "incomeAmount",
      CAST(COALESCE(COUNT(t.id), 0) AS INTEGER) AS "transactionCount"
    FROM
      categories AS c
    LEFT JOIN
      transactions AS t ON c.id = t."categoryId"
    WHERE
      c."userId" = $1
    GROUP BY
      c.id
    ORDER BY
      c.name ASC;