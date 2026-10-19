import type { Request, Response } from "express";
import { Expense } from "../models/Expense.js";
import { Budget } from "../models/Budget.js";
import { User } from "../models/User.js";
import { SavingsGoal } from "../models/SavingsGoal.js";
import { currentMonthKey, daysInMonth, monthRange, previousMonthKey } from "../utils/dates.js";
import { budgetStatus, round, type BudgetStatus } from "../services/budgetService.js";
import { attachCategories, type CategoryGroupRow } from "../services/aggregations.js";
import { monthQuerySchema } from "../validators/budget.js";
import { DEFAULT_ALERT_PERCENT, PAYMENT_METHOD_LABELS, type PaymentMethod } from "../config/constants.js";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function lastMonths(month: string, count: number): string[] {
  const months: string[] = [];
  let cursor = month;
  for (let index = 0; index < count; index += 1) {
    months.unshift(cursor);
    cursor = previousMonthKey(cursor);
  }
  return months;
}

export async function adminExpenseSummary(req: Request, res: Response) {
  const { month = currentMonthKey() } = monthQuerySchema.parse(req.query);
  const { start, end } = monthRange(month);
  const previous = monthRange(previousMonthKey(month));
  const match = { date: { $gte: start, $lt: end } };

  const [totals, previousTotals, spenders, categoryRows, methodRows, kindRows, weekdayRows, dailyRows] =
    await Promise.all([
      Expense.aggregate<{ total: number; count: number }>([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate<{ total: number }>([
        { $match: { date: { $gte: previous.start, $lt: previous.end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.distinct("user", match),
      Expense.aggregate<CategoryGroupRow>([
        { $match: match },
        { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate<{ _id: PaymentMethod; total: number; count: number }>([
        { $match: match },
        { $group: { _id: "$paymentMethod", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate<{ _id: string; total: number; count: number }>([
        { $match: match },
        { $group: { _id: { $ifNull: ["$kind", "variable"] }, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate<{ _id: number; total: number; count: number }>([
        { $match: match },
        { $group: { _id: { $dayOfWeek: "$date" }, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate<{ _id: number; total: number }>([
        { $match: match },
        { $group: { _id: { $dayOfMonth: "$date" }, total: { $sum: "$amount" } } },
      ]),
    ]);

  const totalSpent = round(totals[0]?.total ?? 0);
  const expenseCount = totals[0]?.count ?? 0;
  const previousSpent = round(previousTotals[0]?.total ?? 0);
  const kind = (name: string) => kindRows.find((row) => row._id === name);
  const daily = new Map(dailyRows.map((row) => [row._id, row.total]));

  res.json({
    month,
    totalSpent,
    expenseCount,
    averageExpense: expenseCount > 0 ? round(totalSpent / expenseCount) : 0,
    activeSpenders: spenders.length,
    averagePerSpender: spenders.length > 0 ? round(totalSpent / spenders.length) : 0,
    previousMonthSpent: previousSpent,
    changeFromPrevious: previousSpent > 0 ? round(((totalSpent - previousSpent) / previousSpent) * 100) : null,
    byCategory: await attachCategories(categoryRows),
    byPaymentMethod: methodRows.map((row) => ({
      method: row._id,
      label: PAYMENT_METHOD_LABELS[row._id] ?? row._id,
      total: round(row.total),
      count: row.count,
    })),
    byKind: {
      fixed: { total: round(kind("fixed")?.total ?? 0), count: kind("fixed")?.count ?? 0 },
      variable: { total: round(kind("variable")?.total ?? 0), count: kind("variable")?.count ?? 0 },
    },
    byWeekday: [1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
      const row = weekdayRows.find((entry) => entry._id === dayIndex + 1);
      return { day: WEEKDAYS[dayIndex], total: round(row?.total ?? 0), count: row?.count ?? 0 };
    }),
    daily: Array.from({ length: daysInMonth(month) }, (_, index) => ({
      day: index + 1,
      total: round(daily.get(index + 1) ?? 0),
    })),
  });
}

async function budgetStatusCounts(month: string) {
  const { start, end } = monthRange(month);
  const [budgets, spentRows] = await Promise.all([
    Budget.find({ month }).populate<{
      user: { _id: unknown; role: string; preferences?: { alertAt?: number } } | null;
    }>("user", "role preferences"),
    Expense.aggregate<{ _id: unknown; total: number }>([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: "$user", total: { $sum: "$amount" } } },
    ]),
  ]);

  const spentByUser = new Map(spentRows.map((row) => [String(row._id), row.total]));
  const isPast = month < currentMonthKey();
  const counts: Record<Exclude<BudgetStatus, "unset">, number> = { within: 0, approaching: 0, over: 0 };
  let totalBudgeted = 0;
  let totalSpent = 0;
  let percentSum = 0;
  let withBudget = 0;

  for (const budget of budgets) {
    if (!budget.user || budget.user.role !== "user" || budget.amount <= 0) continue;
    const spent = spentByUser.get(String(budget.user._id)) ?? 0;
    const status = budgetStatus(
      spent,
      budget.amount,
      isPast,
      budget.user.preferences?.alertAt ?? DEFAULT_ALERT_PERCENT,
    );
    if (status !== "unset") counts[status] += 1;
    withBudget += 1;
    totalBudgeted += budget.amount;
    totalSpent += spent;
    percentSum += (spent / budget.amount) * 100;
  }

  return { counts, withBudget, totalBudgeted, totalSpent, percentSum };
}

export async function adminBudgetSummary(req: Request, res: Response) {
  const { month = currentMonthKey() } = monthQuerySchema.parse(req.query);
  const members = await User.countDocuments({ role: "user" });
  const months = lastMonths(month, 6);
  const [current, ...history] = await Promise.all([
    budgetStatusCounts(month),
    ...months.map((key) => budgetStatusCounts(key)),
  ]);

  res.json({
    month,
    members,
    withBudget: current.withBudget,
    withoutBudget: Math.max(0, members - current.withBudget),
    statusCounts: current.counts,
    averageBudget: current.withBudget > 0 ? round(current.totalBudgeted / current.withBudget) : 0,
    averagePercentUsed: current.withBudget > 0 ? round(current.percentSum / current.withBudget) : 0,
    totalBudgeted: round(current.totalBudgeted),
    totalSpentAgainstBudgets: round(current.totalSpent),
    history: months.map((key, index) => ({
      month: key,
      withBudget: history[index].withBudget,
      ...history[index].counts,
    })),
  });
}

export async function adminSavingsSummary(_req: Request, res: Response) {
  const { start, end } = monthRange(currentMonthKey());
  const goals = await SavingsGoal.find().populate<{ user: { _id: unknown; role: string } | null }>("user", "role");

  const memberGoals = goals.filter((goal) => goal.user?.role === "user");
  const now = Date.now();
  const savers = new Set<string>();
  const names = new Map<string, { name: string; count: number; saved: number }>();
  const buckets = [
    { label: "Just started (under 25%)", count: 0 },
    { label: "Building up (25% to 50%)", count: 0 },
    { label: "Past halfway (50% to 75%)", count: 0 },
    { label: "Nearly there (75% and up)", count: 0 },
    { label: "Reached", count: 0 },
  ];
  let totalSaved = 0;
  let totalTarget = 0;
  let progressSum = 0;
  let completed = 0;
  let withDeadline = 0;
  let overdue = 0;
  let addedThisMonth = 0;

  for (const goal of memberGoals) {
    const saved = goal.contributions.reduce((sum, entry) => sum + entry.amount, 0);
    const percent = Math.min(100, (saved / goal.targetAmount) * 100);
    const done = saved >= goal.targetAmount;

    savers.add(String(goal.user?._id));
    totalSaved += saved;
    totalTarget += goal.targetAmount;
    progressSum += percent;
    if (done) completed += 1;
    if (goal.targetDate) {
      withDeadline += 1;
      if (!done && goal.targetDate.getTime() < now) overdue += 1;
    }
    for (const entry of goal.contributions) {
      if (entry.amount > 0 && entry.date >= start && entry.date < end) addedThisMonth += entry.amount;
    }

    if (done) buckets[4].count += 1;
    else if (percent >= 75) buckets[3].count += 1;
    else if (percent >= 50) buckets[2].count += 1;
    else if (percent >= 25) buckets[1].count += 1;
    else buckets[0].count += 1;

    const key = goal.name.trim().toLowerCase();
    const entry = names.get(key) ?? { name: goal.name.trim(), count: 0, saved: 0 };
    entry.count += 1;
    entry.saved += saved;
    names.set(key, entry);
  }

  res.json({
    goals: memberGoals.length,
    savers: savers.size,
    totalSaved: round(totalSaved),
    totalTarget: round(totalTarget),
    completed,
    withDeadline,
    overdue,
    averageProgress: memberGoals.length > 0 ? round(progressSum / memberGoals.length) : 0,
    addedThisMonth: round(addedThisMonth),
    progress: buckets,
    popular: [...names.values()]
      .sort((a, b) => b.count - a.count || b.saved - a.saved)
      .slice(0, 6)
      .map((entry) => ({ ...entry, saved: round(entry.saved) })),
  });
}