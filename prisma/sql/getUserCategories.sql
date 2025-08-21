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
      c."userId" = $1
    GROUP BY
      c.id
    ORDER BY
      c.name ASC;