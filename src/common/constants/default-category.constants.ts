export const DEFAULT_CATEGORY_NAME = 'Sem categoria';

export const DEFAULT_CATEGORY_DATA = {
  name: DEFAULT_CATEGORY_NAME,
  description: 'Categoria padrão para transações sem categorias',
  color: null,
  icon: null,
  budgetAmount: 0,
  isActive: true,
  isDefault: true,
} as const;
