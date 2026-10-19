import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { EXPENSE_KINDS, PAYMENT_METHODS } from "../config/constants.js";

const objectId = z.string().refine((value) => isValidObjectId(value), "Invalid id");

const csvList = <T extends z.ZodType<unknown, string>>(item: T) =>
  z
    .string()
    .optional()
    .transform((value) => (value ? value.split(",").map((part) => part.trim()).filter(Boolean) : []))
    .pipe(z.array(item));

const optionalNumber = z
  .string()
  .optional()
  .transform((value) => (value === undefined || value === "" ? undefined : Number(value)))
  .refine((value) => value === undefined || Number.isFinite(value), "Must be a number");

const optionalDate = z
  .string()
  .optional()
  .transform((value) => (value ? new Date(value) : undefined))
  .refine((value) => value === undefined || !Number.isNaN(value.getTime()), "Invalid date");

const expenseFields = {
  title: z.string({ error: "Title is required" }).trim().min(2, "Give the expense a short title").max(120),
  amount: z.coerce.number().positive("Amount should be more than zero").max(1_000_000_000),
  category: objectId,
  date: z.coerce.date({ error: "Pick a valid date" }),
  paymentMethod: z.enum(PAYMENT_METHODS, { error: "Pick a payment method" }),
  notes: z.string().trim().max(500),
  kind: z.enum(EXPENSE_KINDS, { error: "Pick fixed or variable" }),
};

export const expenseBodySchema = z.object({
  ...expenseFields,
  notes: expenseFields.notes.optional().default(""),
  kind: expenseFields.kind.optional().default("variable"),
});

export const expenseUpdateSchema = z.object(expenseFields).partial();

export const expenseQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  categories: csvList(objectId),
  paymentMethods: csvList(z.enum(PAYMENT_METHODS)),
  kinds: csvList(z.enum(EXPENSE_KINDS)),
  startDate: optionalDate,
  endDate: optionalDate,
  minAmount: optionalNumber,
  maxAmount: optionalNumber,
  sortBy: z.enum(["date", "amount", "title", "createdAt"]).optional().default("date"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type ExpenseBody = z.infer<typeof expenseBodySchema>;
export type ExpenseQuery = z.infer<typeof expenseQuerySchema>;