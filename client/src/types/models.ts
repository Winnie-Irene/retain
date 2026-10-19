export type Role = "user" | "admin";

export type PaymentMethod = "cash" | "card" | "mobile_money" | "bank_transfer";

export type BudgetStatus = "unset" | "within" | "approaching" | "over";

export type ExpenseKind = "fixed" | "variable";

export type SortField = "date" | "amount" | "title" | "createdAt";

export type SortOrder = "asc" | "desc";

export type LandingPage = "dashboard" | "expenses" | "budget" | "savings";

export interface UserPreferences {
  alertAt: number;
  landingPage: LandingPage;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "suspended";
  currency: string;
  avatar: string;
  preferences: UserPreferences;
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
  kind: ExpenseKind;
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
  kind: ExpenseKind;
}

export interface BudgetSummary {
  month: string;
  amount: number | null;
  spent: number;
  remaining: number | null;
  percentUsed: number | null;
  status: BudgetStatus;
  alertAt: number;
}

export interface CategoryBreakdown {
  category: Category;
  total: number;
  count: number;
  share: number;
}

export interface SavingsContribution {
  id: string;
  amount: number;
  note: string;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string | null;
  color: string;
  saved: number;
  remaining: number;
  percent: number;
  isComplete: boolean;
  isPastDue: boolean;
  perMonth: number | null;
  contributions: SavingsContribution[];
  createdAt: string;
  updatedAt: string;
}

export interface SavingsSummary {
  totalSaved: number;
  totalTarget: number;
  completed: number;
  count: number;
  nextDeadline: { id: string; name: string; date: string | null } | null;
}

export interface MonthlyNote {
  month: string;
  goal: string;
  reduce: string;
  win: string;
  updatedAt: string | null;
}