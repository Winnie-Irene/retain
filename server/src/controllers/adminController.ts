import type { Request, Response } from "express";
import { Expense } from "../models/Expense.js";
import { User, toPublicUser } from "../models/User.js";
import { currentMonthKey, monthRange, previousMonthKey } from "../utils/dates.js";
import { serializeExpense } from "../utils/serializers.js";
import { round } from "../services/budgetService.js";
import { attachCategories, type CategoryGroupRow } from "../services/aggregations.js";

interface PopulatedOwner {
  _id: unknown;
  name: string;
  email: string;
}

function isOwner(value: unknown): value is PopulatedOwner {
  return typeof value === "object" && value !== null && "name" in value && "email" in value;
}

export async function adminInsights(_req: Request, res: Response) {
  const month = currentMonthKey();
  const { start, end } = monthRange(month);

  const trendMonths: string[] = [];
  let cursor = month;
  for (let index = 0; index < 6; index += 1) {
    trendMonths.unshift(cursor);
    cursor = previousMonthKey(cursor);
  }
  const trendStart = monthRange(trendMonths[0]).start;

  const [
    totalUsers,
    totalAdmins,
    totalExpenses,
    totalValueRows,
    expensesThisMonth,
    valueThisMonthRows,
    categoryRows,
    trendRows,
    recentExpenses,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    Expense.countDocuments(),
    Expense.aggregate<{ total: number }>([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    Expense.countDocuments({ date: { $gte: start, $lt: end } }),
    Expense.aggregate<{ total: number }>([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate<CategoryGroupRow>([
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Expense.aggregate<{ _id: string; total: number; count: number }>([
      { $match: { date: { $gte: trendStart, $lt: end } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Expense.find().sort({ createdAt: -1 }).limit(8).populate("category").populate("user", "name email"),
    User.find().sort({ createdAt: -1 }).limit(8),
  ]);

  const breakdown = await attachCategories(categoryRows, true);
  const byUsage = [...breakdown].sort((a, b) => b.count - a.count || b.total - a.total);
  const leastUsed = [...breakdown].sort((a, b) => a.count - b.count || a.total - b.total);
  const trendMap = new Map(trendRows.map((row) => [row._id, row]));

  res.json({
    month,
    totals: {
      users: totalUsers,
      admins: totalAdmins,
      expenses: totalExpenses,
      value: round(totalValueRows[0]?.total ?? 0),
      expensesThisMonth,
      valueThisMonth: round(valueThisMonthRows[0]?.total ?? 0),
    },
    spendingByCategory: breakdown,
    topCategories: byUsage.slice(0, 5),
    bottomCategories: leastUsed.slice(0, 5),
    monthlyTrend: trendMonths.map((key) => ({
      month: key,
      total: round(trendMap.get(key)?.total ?? 0),
      count: trendMap.get(key)?.count ?? 0,
    })),
    recentExpenses: recentExpenses.map((expense) => ({
      ...serializeExpense(expense),
      owner: isOwner(expense.user) ? { name: expense.user.name, email: expense.user.email } : null,
    })),
    recentUsers: recentUsers.map(toPublicUser),
  });
}