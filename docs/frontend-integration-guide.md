# Frontend Integration Guide

## Goal
This API now uses cents-only writes for money fields and nullable visual fields for categories. This guide shows how the frontend should send data, render data, and handle validation errors.

## Write Contracts

### Transactions
Use `amountCents` as an integer.

Example request:

```json
{
  "amountCents": 45025,
  "type": "EXPENSE",
  "description": "Rent",
  "date": "2026-06-18T12:00:00.000Z",
  "categoryId": "9d3f9d3d-0000-0000-0000-123456789abc"
}
```

Rules:
1. Do not send `amount` as a decimal field.
2. Do not send strings like `"450,25"` or `"450.25"`.
3. Always convert UI money input to integer cents before calling the API.

### Categories
`budgetAmount` is also written as integer cents.

Example request:

```json
{
  "name": "Groceries",
  "description": "Monthly groceries",
  "budgetAmount": 100000,
  "color": null,
  "icon": null,
  "isActive": true
}
```

Rules:
1. `budgetAmount` must be cents.
2. `color` and `icon` can be omitted or sent as `null`.

## Response Contracts

### Transactions
Transaction response `amount` is still a formatted string for display.

Example response:

```json
{
  "id": "tx-id",
  "amount": "450,25",
  "type": "EXPENSE",
  "description": "Rent",
  "date": "2026-06-18T12:00:00.000Z",
  "userId": "user-id",
  "categoryId": "category-id",
  "createdAt": "2026-06-18T12:00:00.000Z",
  "updatedAt": "2026-06-18T12:00:00.000Z"
}
```

Important:
1. Use `amountCents` in requests.
2. Use `amount` in responses only for display.
3. Do not parse display strings back into write payloads.

### Categories
`color` and `icon` may be `null`.

Example response:

```json
{
  "id": "category-id",
  "name": "Uncategorized",
  "description": "Default category for transactions from deleted categories",
  "color": null,
  "icon": null,
  "budgetAmount": "0,00",
  "userId": "user-id",
  "isActive": false,
  "createdAt": "2026-06-18T12:00:00.000Z",
  "updatedAt": "2026-06-18T12:00:00.000Z",
  "spentAmount": "0,00",
  "incomeAmount": "0,00",
  "remainingAmount": "0,00",
  "transactionCount": 0
}
```

## Frontend Helpers

### Convert form value to cents
Use UI parsing only at the frontend boundary.

```ts
export function parseMoneyInputToCents(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.');

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error('Invalid money input');
  }

  const [integerPart, fractionalPart = ''] = normalized.split('.');
  const cents = `${integerPart}${fractionalPart.padEnd(2, '0')}`;
  return Number(cents);
}
```

Examples:
1. `"450,25" -> 45025`
2. `"450.25" -> 45025`

### Resolve category visuals

```ts
type CategoryStyle = { color: string; icon: string };

const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  color: '#9CA3AF',
  icon: 'tag',
};

function isBlank(value: string | null | undefined): boolean {
  return value == null || value.trim() === '';
}

export function resolveCategoryStyle(category: {
  color?: string | null;
  icon?: string | null;
}): CategoryStyle {
  return {
    color: isBlank(category.color)
      ? DEFAULT_CATEGORY_STYLE.color
      : category.color,
    icon: isBlank(category.icon)
      ? DEFAULT_CATEGORY_STYLE.icon
      : category.icon,
  };
}
```

## Error Handling
If the frontend sends the old transaction payload, the API returns `400`.

Typical validation messages:
1. `property amount should not exist`
2. `amountCents must be an integer number`
3. `amountCents should not be empty`

Frontend recommendation:
1. Map validation arrays into field-level form errors.
2. Show a generic fallback message when the array is unavailable.
3. Treat these as client-side payload bugs, not retryable server errors.

## Migration Checklist
1. Replace transaction write payloads from `amount` to `amountCents`.
2. Ensure category `budgetAmount` is sent in cents.
3. Keep response `amount`/`budgetAmount` as display-only strings.
4. Add frontend helpers for cents conversion and category style fallback.
5. Update form validation so decimals are converted before request submission.

## Recommended Frontend Pattern
1. Keep money input as string in form state.
2. Convert to cents only when submitting.
3. Keep API response money strings for display.
4. Never reuse display strings as write payloads.
