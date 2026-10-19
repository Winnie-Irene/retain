import { Types } from "mongoose";
import { Budget } from "../models/Budget.js";
import { Expense } from "../models/Expense.js";
import { User } from "../models/User.js";
import { DEFAULT_ALERT_PERCENT } from "../config/constants.js";
import { currentMonthKey, monthRange } from "../utils/dates.js";

export type BudgetStatus = "unset" | "within" | "approaching" | "over";

export interface BudgetSummary {
  month: string;
  amount: number | null;
  spent: number;
  remaining: number | null;
  percentUsed: number | null;
  status: BudgetStatus;
  alertAt: number;
}

export function budgetStatus(
  spent: number,
  amount: number | null,
  isPastMonth = false,
  alertAt = DEFAULT_ALERT_PERCENT,
): BudgetStatus {
  if (amount === null || amount <= 0) return "unset";
  const ratio = spent / amount;
  if (ratio > 1) return "over";
  if (!isPastMonth && ratio >= alertAt / 100) return "approaching";
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
  const [budget, spent, owner] = await Promise.all([
    Budget.findOne({ user: userId, month }),
    spentInMonth(userId, month),
    User.findById(userId).select("preferences"),
  ]);
  const amount = budget ? budget.amount : null;
  const alertAt = owner?.preferences?.alertAt ?? DEFAULT_ALERT_PERCENT;

  return {
    month,
    amount,
    spent: round(spent),
    remaining: amount === null ? null : round(amount - spent),
    percentUsed: amount ? round((spent / amount) * 100) : null,
    status: budgetStatus(spent, amount, month < currentMonthKey(), alertAt),
    alertAt,
  };
}

export function round(value: number): number {
  return Math.round(value * 100) / 100;
}