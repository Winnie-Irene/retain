import type { Request, Response } from "express";
import { Budget } from "../models/Budget.js";
import { currentUser } from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";
import { currentMonthKey, previousMonthKey } from "../utils/dates.js";
import { summarizeBudget } from "../services/budgetService.js";
import { budgetBodySchema, historyQuerySchema, monthQuerySchema, monthSchema } from "../validators/budget.js";

export async function getBudget(req: Request, res: Response) {
  const { id } = currentUser(req);
  const { month = currentMonthKey() } = monthQuerySchema.parse(req.query);
  res.json({ budget: await summarizeBudget(id, month) });
}

export async function upsertBudget(req: Request, res: Response) {
  const { id } = currentUser(req);
  const month = monthSchema.parse(req.params.month);
  const { amount } = budgetBodySchema.parse(req.body);

  await Budget.findOneAndUpdate({ user: id, month }, { $set: { amount } }, { upsert: true, runValidators: true });

  res.json({ budget: await summarizeBudget(id, month) });
}

export async function deleteBudget(req: Request, res: Response) {
  const { id } = currentUser(req);
  const month = monthSchema.parse(req.params.month);
  const deleted = await Budget.findOneAndDelete({ user: id, month });
  if (!deleted) {
    throw AppError.notFound("No budget set for that month");
  }
  res.status(204).send();
}

export async function budgetHistory(req: Request, res: Response) {
  const { id } = currentUser(req);
  const { months } = historyQuerySchema.parse(req.query);

  const keys: string[] = [];
  let cursor = currentMonthKey();
  for (let index = 0; index < months; index += 1) {
    keys.unshift(cursor);
    cursor = previousMonthKey(cursor);
  }

  const history = await Promise.all(keys.map((month) => summarizeBudget(id, month)));
  res.json({ history });
}