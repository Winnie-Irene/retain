import type { Types } from "mongoose";

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface PublicExpense {
  id: string;
  title: string;
  amount: number;
  category: PublicCategory | null;
  date: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryLike {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  color: string;
  icon?: string | null;
  isDefault?: boolean | null;
}

interface ExpenseLike {
  _id: Types.ObjectId;
  title: string;
  amount: number;
  category: unknown;
  date: Date;
  paymentMethod: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function isCategoryLike(value: unknown): value is CategoryLike {
  return typeof value === "object" && value !== null && "name" in value && "slug" in value;
}

export function serializeCategory(category: CategoryLike): PublicCategory {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    color: category.color,
    icon: category.icon ?? "tag",
    isDefault: Boolean(category.isDefault),
  };
}

export function serializeExpense(expense: ExpenseLike): PublicExpense {
  return {
    id: expense._id.toString(),
    title: expense.title,
    amount: expense.amount,
    category: isCategoryLike(expense.category) ? serializeCategory(expense.category) : null,
    date: expense.date.toISOString(),
    paymentMethod: expense.paymentMethod,
    notes: expense.notes ?? "",
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  };
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}