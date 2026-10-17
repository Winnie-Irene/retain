import type { Request, Response } from "express";
import { Types } from "mongoose";
import { Expense } from "../models/Expense.js";
import { currentUser } from "../middleware/auth.js";
import { currentMonthKey, daysInMonth, monthRange, previousMonthKey } from "../utils/dates.js";
import { serializeExpense } from "../utils/serializers.js";
import { round, spentInMonth, summarizeBudget } from "../services/budgetService.js";
import { attachCategories, type CategoryGroupRow } from "../services/aggregations.js";
import { monthQuerySchema } from "../validators/budget.js";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "../config/constants.js";

export async function userDashboard(req: Request, res: Response) {
  const { id } = currentUser(req);
  const { month = currentMonthKey() } = monthQuerySchema.parse(req.query);
  const { start, end } = monthRange(month);
  const match = { user: new Types.ObjectId(id), date: { $gte: start, $lt: end } };

  const [budget, previousSpent, highest, categoryRows, dailyRows, methodRows, recent, expenseCount] = await Promise.all([
    summarizeBudget(id, month),
    spentInMonth(id, previousMonthKey(month)),
    Expense.findOne(match).sort({ amount: -1 }).populate("category"),
    Expense.aggregate<CategoryGroupRow>([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Expense.aggregate<{ _id: number; total: number }>([
      { $match: match },
      { $group: { _id: { $dayOfMonth: "$date" }, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate<{ _id: PaymentMethod; total: number; count: number }>([
      { $match: match },
      { $group: { _id: "$paymentMethod", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Expense.find(match).sort({ date: -1, createdAt: -1 }).limit(6).populate("category"),
    Expense.countDocuments(match),
  ]);

  const totals = new Map(dailyRows.map((row) => [row._id, row.total]));
  let running = 0;
  const daily = Array.from({ length: daysInMonth(month) }, (_, index) => {
    const day = index + 1;
    const total = totals.get(day) ?? 0;
    running += total;
    return { day, total: round(total), cumulative: round(running) };
  });

  const changeFromPrevious = previousSpent > 0 ? round(((budget.spent - previousSpent) / previousSpent) * 100) : null;

  res.json({
    month,
    totalSpent: budget.spent,
    expenseCount,
    averageExpense: expenseCount > 0 ? round(budget.spent / expenseCount) : 0,
    previousMonthSpent: round(previousSpent),
    changeFromPrevious,
    budget,
    highestExpense: highest ? serializeExpense(highest) : null,
    byCategory: await attachCategories(categoryRows),
    byPaymentMethod: methodRows.map((row) => ({
      method: row._id,
      label: PAYMENT_METHOD_LABELS[row._id] ?? row._id,
      total: round(row.total),
      count: row.count,
    })),
    daily,
    recentExpenses: recent.map(serializeExpense),
  });
}