import type { Request, Response } from "express";
import { Types, type QueryFilter } from "mongoose";
import { Expense, type ExpenseFields } from "../models/Expense.js";
import { Category } from "../models/Category.js";
import { currentUser } from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";
import { escapeRegex, serializeExpense } from "../utils/serializers.js";
import { expenseBodySchema, expenseQuerySchema, expenseUpdateSchema, type ExpenseQuery } from "../validators/expense.js";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "../config/constants.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function buildFilter(userId: string, query: ExpenseQuery): QueryFilter<ExpenseFields> {
  const filter: QueryFilter<ExpenseFields> = { user: new Types.ObjectId(userId) };

  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ title: pattern }, { notes: pattern }];
  }

  if (query.categories.length > 0) {
    filter.category = { $in: query.categories.map((id) => new Types.ObjectId(id)) };
  }

  if (query.paymentMethods.length > 0) {
    filter.paymentMethod = { $in: query.paymentMethods };
  }
  
  if (query.kinds.length > 0) {
    filter.kind = { $in: query.kinds.includes("variable") ? [...query.kinds, null] : query.kinds };
  }
  
  if (query.startDate || query.endDate) {
    const range: { $gte?: Date; $lt?: Date } = {};
    if (query.startDate) range.$gte = query.startDate;
    if (query.endDate) range.$lt = new Date(query.endDate.getTime() + ONE_DAY_MS);
    filter.date = range;
  }

  if (query.minAmount !== undefined || query.maxAmount !== undefined) {
    const range: { $gte?: number; $lte?: number } = {};
    if (query.minAmount !== undefined) range.$gte = query.minAmount;
    if (query.maxAmount !== undefined) range.$lte = query.maxAmount;
    filter.amount = range;
  }

  return filter;
}

async function assertCategoryExists(categoryId: string) {
  const exists = await Category.exists({ _id: categoryId });
  if (!exists) {
    throw AppError.badRequest("That category does not exist anymore");
  }
}

async function findOwnedExpense(req: Request) {
  const { id } = currentUser(req);
  const expense = await Expense.findOne({ _id: req.params.id, user: id }).populate("category");
  if (!expense) {
    throw AppError.notFound("Expense not found");
  }
  return expense;
}

export async function listExpenses(req: Request, res: Response) {
  const { id } = currentUser(req);
  const query = expenseQuerySchema.parse(req.query);
  const filter = buildFilter(id, query);
  const direction = query.order === "asc" ? 1 : -1;

  const [items, total, totals] = await Promise.all([
    Expense.find(filter)
      .sort({ [query.sortBy]: direction, _id: direction })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate("category"),
    Expense.countDocuments(filter),
    Expense.aggregate<{ sum: number }>([{ $match: filter }, { $group: { _id: null, sum: { $sum: "$amount" } } }]),
  ]);

  res.json({
    items: items.map(serializeExpense),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
    totalAmount: totals[0]?.sum ?? 0,
  });
}

export async function getExpense(req: Request, res: Response) {
  const expense = await findOwnedExpense(req);
  res.json({ expense: serializeExpense(expense) });
}

export async function createExpense(req: Request, res: Response) {
  const { id } = currentUser(req);
  const input = expenseBodySchema.parse(req.body);
  await assertCategoryExists(input.category);

  const created = await Expense.create({ ...input, user: id });
  await created.populate("category");

  res.status(201).json({ expense: serializeExpense(created) });
}

export async function updateExpense(req: Request, res: Response) {
  const expense = await findOwnedExpense(req);
  const input = expenseUpdateSchema.parse(req.body);

  if (input.category) {
    await assertCategoryExists(input.category);
  }

  expense.set(input);
  await expense.save();
  await expense.populate("category");

  res.json({ expense: serializeExpense(expense) });
}

export async function deleteExpense(req: Request, res: Response) {
  const expense = await findOwnedExpense(req);
  await expense.deleteOne();
  res.status(204).send();
}

export function listPaymentMethods(_req: Request, res: Response) {
  res.json({
    paymentMethods: PAYMENT_METHODS.map((value) => ({ value, label: PAYMENT_METHOD_LABELS[value] })),
  });
}