import { request, toQueryString, type QueryValue } from "./client";
import type {
  AdminInsightsResponse,
  AuthResponse,
  DashboardResponse,
  DeleteCategoryResponse,
  ExpenseListResponse,
} from "../types/api";
import type {
  BudgetSummary,
  Category,
  Expense,
  ExpenseInput,
  SavingsGoal,
  SavingsSummary,
  User,
  UserPreferences,
} from "../types/models";

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends Credentials {
  name: string;
  acceptTerms: boolean;
}

export interface ProfilePayload {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface PasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface GoalPayload {
  name: string;
  targetAmount: number;
  targetDate: string | null;
  color: string;
  startingAmount?: number;
}

export interface CategoryPayload {
  name: string;
  color: string;
  icon?: string;
}

export const authApi = {
  login: (payload: Credentials) => request<AuthResponse>("/auth/login", { method: "POST", body: payload }),
  register: (payload: RegisterPayload) => request<AuthResponse>("/auth/register", { method: "POST", body: payload }),
  me: () => request<{ user: User }>("/auth/me"),
};

export const expenseApi = {
  list: (params: Record<string, QueryValue>, signal?: AbortSignal) =>
    request<ExpenseListResponse>(`/expenses${toQueryString(params)}`, { signal }),
  get: (id: string) => request<{ expense: Expense }>(`/expenses/${id}`),
  create: (payload: ExpenseInput) => request<{ expense: Expense }>("/expenses", { method: "POST", body: payload }),
  update: (id: string, payload: Partial<ExpenseInput>) =>
    request<{ expense: Expense }>(`/expenses/${id}`, { method: "PATCH", body: payload }),
  remove: (id: string) => request<void>(`/expenses/${id}`, { method: "DELETE" }),
};

export const budgetApi = {
  get: (month: string) => request<{ budget: BudgetSummary }>(`/budgets${toQueryString({ month })}`),
  save: (month: string, amount: number) =>
    request<{ budget: BudgetSummary }>(`/budgets/${month}`, { method: "PUT", body: { amount } }),
  remove: (month: string) => request<void>(`/budgets/${month}`, { method: "DELETE" }),
  history: (months = 6) => request<{ history: BudgetSummary[] }>(`/budgets/history${toQueryString({ months })}`),
};

export const categoryApi = {
  list: () => request<{ categories: Category[] }>("/categories"),
  create: (payload: CategoryPayload) =>
    request<{ category: Category }>("/categories", { method: "POST", body: payload }),
  update: (id: string, payload: Partial<CategoryPayload>) =>
    request<{ category: Category }>(`/categories/${id}`, { method: "PATCH", body: payload }),
  remove: (id: string) => request<DeleteCategoryResponse>(`/categories/${id}`, { method: "DELETE" }),
};

export const dashboardApi = {
  get: (month: string) => request<DashboardResponse>(`/dashboard${toQueryString({ month })}`),
};

export const adminApi = {
  insights: () => request<AdminInsightsResponse>("/admin/insights"),
};

export const profileApi = {
  update: (payload: ProfilePayload) => request<{ user: User }>("/profile", { method: "PATCH", body: payload }),
  preferences: (payload: Partial<UserPreferences>) =>
    request<{ user: User }>("/profile/preferences", { method: "PATCH", body: payload }),
  changePassword: (payload: PasswordPayload) =>
    request<{ message: string }>("/profile/password", { method: "PUT", body: payload }),
  remove: (password: string) => request<void>("/profile", { method: "DELETE", body: { password } }),
};

export const savingsApi = {
  list: () => request<{ goals: SavingsGoal[]; summary: SavingsSummary }>("/savings"),
  create: (payload: GoalPayload) => request<{ goal: SavingsGoal }>("/savings", { method: "POST", body: payload }),
  update: (id: string, payload: Partial<GoalPayload>) =>
    request<{ goal: SavingsGoal }>(`/savings/${id}`, { method: "PATCH", body: payload }),
  remove: (id: string) => request<void>(`/savings/${id}`, { method: "DELETE" }),
  contribute: (id: string, amount: number, note: string) =>
    request<{ goal: SavingsGoal }>(`/savings/${id}/contributions`, { method: "POST", body: { amount, note } }),
  removeContribution: (id: string, contributionId: string) =>
    request<{ goal: SavingsGoal }>(`/savings/${id}/contributions/${contributionId}`, { method: "DELETE" }),
};