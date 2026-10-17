import { z } from "zod";
import { MONTH_PATTERN } from "../utils/dates.js";

export const monthSchema = z.string().regex(MONTH_PATTERN, "Month should look like 2026-10");

export const monthQuerySchema = z.object({
  month: monthSchema.optional(),
});

export const budgetBodySchema = z.object({
  amount: z.coerce.number().min(0, "Budget cannot be negative").max(1_000_000_000_000),
});

export const historyQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).optional().default(6),
});