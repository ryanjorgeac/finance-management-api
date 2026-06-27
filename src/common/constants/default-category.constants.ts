export const DEFAULT_CATEGORY_NAME = 'Sem categoria';

export const DEFAULT_CATEGORY_DATA = {
  name: DEFAULT_CATEGORY_NAME,
  description: 'Default category for transactions from deleted categories',
  color: null,
  icon: null,
  budgetAmount: 0,
  isActive: true,
  isDefault: true,
} as const;
