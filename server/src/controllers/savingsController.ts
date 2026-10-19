import type { Request, Response } from "express";
import { SavingsGoal, type SavingsGoalDocument } from "../models/SavingsGoal.js";
import { currentUser } from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";
import { round } from "../services/budgetService.js";
import { contributionSchema, goalCreateSchema, goalUpdateSchema } from "../validators/savings.js";

function monthsUntil(date: Date): number {
  const now = new Date();
  const months = (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
  return Math.max(1, months + (date.getDate() >= now.getDate() ? 1 : 0));
}

function serializeGoal(goal: SavingsGoalDocument) {
  const saved = round(goal.contributions.reduce((sum, entry) => sum + entry.amount, 0));
  const remaining = round(Math.max(0, goal.targetAmount - saved));
  const isComplete = saved >= goal.targetAmount;
  const isPastDue = Boolean(goal.targetDate && goal.targetDate.getTime() < Date.now() && !isComplete);
  const perMonth =
    goal.targetDate && !isComplete && !isPastDue ? round(remaining / monthsUntil(goal.targetDate)) : null;

  return {
    id: goal._id.toString(),
    name: goal.name,
    targetAmount: goal.targetAmount,
    targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
    color: goal.color,
    saved,
    remaining,
    percent: round(Math.min(100, (saved / goal.targetAmount) * 100)),
    isComplete,
    isPastDue,
    perMonth,
    contributions: [...goal.contributions]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map((entry) => ({
        id: entry._id.toString(),
        amount: entry.amount,
        note: entry.note ?? "",
        date: entry.date.toISOString(),
      })),
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}

async function findOwnGoal(req: Request) {
  const { id } = currentUser(req);
  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: id });
  if (!goal) {
    throw AppError.notFound("Savings goal not found");
  }
  return goal;
}

export async function listGoals(req: Request, res: Response) {
  const { id } = currentUser(req);
  const goals = (await SavingsGoal.find({ user: id }).sort({ createdAt: 1 })).map(serializeGoal);

  const totalSaved = round(goals.reduce((sum, goal) => sum + goal.saved, 0));
  const totalTarget = round(goals.reduce((sum, goal) => sum + goal.targetAmount, 0));
  const upcoming = goals
    .filter((goal) => goal.targetDate && !goal.isComplete && !goal.isPastDue)
    .sort((a, b) => String(a.targetDate).localeCompare(String(b.targetDate)))[0];

  res.json({
    goals,
    summary: {
      totalSaved,
      totalTarget,
      completed: goals.filter((goal) => goal.isComplete).length,
      count: goals.length,
      nextDeadline: upcoming ? { id: upcoming.id, name: upcoming.name, date: upcoming.targetDate } : null,
    },
  });
}

export async function createGoal(req: Request, res: Response) {
  const { id } = currentUser(req);
  const { startingAmount, ...input } = goalCreateSchema.parse(req.body);

  const goal = await SavingsGoal.create({
    ...input,
    user: id,
    contributions: startingAmount > 0 ? [{ amount: startingAmount, note: "Starting amount" }] : [],
  });

  res.status(201).json({ goal: serializeGoal(goal) });
}

export async function updateGoal(req: Request, res: Response) {
  const input = goalUpdateSchema.parse(req.body);
  const goal = await findOwnGoal(req);
  goal.set(input);
  await goal.save();
  res.json({ goal: serializeGoal(goal) });
}

export async function deleteGoal(req: Request, res: Response) {
  const goal = await findOwnGoal(req);
  await goal.deleteOne();
  res.status(204).send();
}

export async function addContribution(req: Request, res: Response) {
  const input = contributionSchema.parse(req.body);
  const goal = await findOwnGoal(req);
  const saved = goal.contributions.reduce((sum, entry) => sum + entry.amount, 0);

  if (input.amount < 0 && saved + input.amount < 0) {
    throw AppError.badRequest("You cannot take out more than you have saved", [
      { field: "amount", message: `You only have ${saved.toLocaleString("en-US")} saved in this goal` },
    ]);
  }

  goal.contributions.push({ amount: input.amount, note: input.note, date: new Date() });
  await goal.save();
  res.status(201).json({ goal: serializeGoal(goal) });
}

export async function removeContribution(req: Request, res: Response) {
  const goal = await findOwnGoal(req);
  const entry = goal.contributions.id(String(req.params.contributionId));
  if (!entry) {
    throw AppError.notFound("That entry no longer exists");
  }
  entry.deleteOne();
  await goal.save();
  res.json({ goal: serializeGoal(goal) });
}