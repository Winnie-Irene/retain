export type Role = "user" | "admin";

export type PaymentMethod = "cash" | "card" | "mobile_money" | "bank_transfer";

export type BudgetStatus = "unset" | "within" | "approaching" | "over";

export type SortField = "date" | "amount" | "title" | "createdAt";

export type SortOrder = "asc" | "desc";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  currency: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category | null;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface BudgetSummary {
  month: string;
  amount: number | null;
  spent: number;
  remaining: number | null;
  percentUsed: number | null;
  status: BudgetStatus;
}

export interface CategoryBreakdown {
  category: Category;
  total: number;
  count: number;
  share: number;
}