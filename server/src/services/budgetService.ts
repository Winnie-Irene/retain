import { Types } from "mongoose";
import { Budget } from "../models/Budget.js";
import { Expense } from "../models/Expense.js";
import { APPROACHING_BUDGET_RATIO } from "../config/constants.js";
import { currentMonthKey, monthRange } from "../utils/dates.js";

export type BudgetStatus = "unset" | "within" | "approaching" | "over";

export interface BudgetSummary {
  month: string;
  amount: number | null;
  spent: number;
  remaining: number | null;
  percentUsed: number | null;
  status: BudgetStatus;
}

export function budgetStatus(spent: number, amount: number | null, isPastMonth = false): BudgetStatus {
  if (amount === null || amount <= 0) return "unset";
  const ratio = spent / amount;
  if (ratio > 1) return "over";
  if (!isPastMonth && ratio >= APPROACHING_BUDGET_RATIO) return "approaching";
  return "within";
}

export async function spentInMonth(userId: string, month: string): Promise<number> {
  const { start, end } = monthRange(month);
  const result = await Expense.aggregate<{ total: number }>([
    { $match: { user: new Types.ObjectId(userId), date: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return result[0]?.total ?? 0;
}

export async function summarizeBudget(userId: string, month: string): Promise<BudgetSummary> {
  const [budget, spent] = await Promise.all([Budget.findOne({ user: userId, month }), spentInMonth(userId, month)]);
  const amount = budget ? budget.amount : null;

  return {
    month,
    amount,
    spent: round(spent),
    remaining: amount === null ? null : round(amount - spent),
    percentUsed: amount ? round((spent / amount) * 100) : null,
    status: budgetStatus(spent, amount, month < currentMonthKey()),
  };
}

export function round(value: number): number {
  return Math.round(value * 100) / 100;
}