import type { BudgetSummary, Category, CategoryBreakdown, Expense, PaymentMethod, User } from "./models";

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExpenseListResponse {
  items: Expense[];
  pagination: Pagination;
  totalAmount: number;
}

export interface DailyPoint {
  day: number;
  total: number;
  cumulative: number;
}

export interface PaymentMethodBreakdown {
  method: PaymentMethod;
  label: string;
  total: number;
  count: number;
}

export interface DashboardResponse {
  month: string;
  totalSpent: number;
  expenseCount: number;
  averageExpense: number;
  previousMonthSpent: number;
  changeFromPrevious: number | null;
  budget: BudgetSummary;
  highestExpense: Expense | null;
  byCategory: CategoryBreakdown[];
  byPaymentMethod: PaymentMethodBreakdown[];
  daily: DailyPoint[];
  recentExpenses: Expense[];
}

export interface AdminExpense extends Expense {
  owner: { name: string; email: string } | null;
}

export interface MonthlyTrendPoint {
  month: string;
  total: number;
  count: number;
}

export interface AdminInsightsResponse {
  month: string;
  totals: {
    users: number;
    admins: number;
    expenses: number;
    value: number;
    expensesThisMonth: number;
    valueThisMonth: number;
  };
  spendingByCategory: CategoryBreakdown[];
  topCategories: CategoryBreakdown[];
  bottomCategories: CategoryBreakdown[];
  monthlyTrend: MonthlyTrendPoint[];
  recentExpenses: AdminExpense[];
  recentUsers: User[];
}

export interface DeleteCategoryResponse {
  message: string;
  reassignedCount: number;
  fallbackCategory: Category;
}

export interface ApiErrorBody {
  message: string;
  details?: { field: string; message: string }[] | string;
}