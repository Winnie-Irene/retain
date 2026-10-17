import { request, toQueryString, type QueryValue } from "./client";
import type {
  AdminInsightsResponse,
  AuthResponse,
  DashboardResponse,
  DeleteCategoryResponse,
  ExpenseListResponse,
} from "../types/api";
import type { BudgetSummary, Category, Expense, ExpenseInput, User } from "../types/models";

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends Credentials {
  name: string;
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