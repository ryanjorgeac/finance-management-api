export interface CategoryWithSummary {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  budgetAmount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  spentAmount: number;
  incomeAmount: number;
  transactionCount: number;
  userId: string;
}
