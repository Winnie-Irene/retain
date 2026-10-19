import type { BudgetSummary, Category, CategoryBreakdown, Expense, ExpenseKind, PaymentMethod, User } from "./models";

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
  byKind: Record<ExpenseKind, { total: number; count: number }>;
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

export interface AdminExpenseSummary {
  month: string;
  totalSpent: number;
  expenseCount: number;
  averageExpense: number;
  activeSpenders: number;
  averagePerSpender: number;
  previousMonthSpent: number;
  changeFromPrevious: number | null;
  byCategory: CategoryBreakdown[];
  byPaymentMethod: PaymentMethodBreakdown[];
  byKind: Record<ExpenseKind, { total: number; count: number }>;
  byWeekday: { day: string; total: number; count: number }[];
  daily: { day: number; total: number }[];
}

export interface AdminBudgetHistoryPoint {
  month: string;
  withBudget: number;
  within: number;
  approaching: number;
  over: number;
}

export interface AdminBudgetSummary {
  month: string;
  members: number;
  withBudget: number;
  withoutBudget: number;
  statusCounts: { within: number; approaching: number; over: number };
  averageBudget: number;
  averagePercentUsed: number;
  totalBudgeted: number;
  totalSpentAgainstBudgets: number;
  history: AdminBudgetHistoryPoint[];
}

export interface AdminSavingsSummary {
  goals: number;
  savers: number;
  totalSaved: number;
  totalTarget: number;
  completed: number;
  withDeadline: number;
  overdue: number;
  averageProgress: number;
  addedThisMonth: number;
  progress: { label: string; count: number }[];
  popular: { name: string; count: number; saved: number }[];
}