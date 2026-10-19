import { z } from "zod";

const goalFields = {
  name: z.string({ error: "Give the goal a name" }).trim().min(2, "Give the goal a name").max(60),
  targetAmount: z.coerce
    .number({ error: "Enter a target amount" })
    .positive("Enter a target above zero")
    .max(1_000_000_000_000),
  targetDate: z
    .union([z.literal(""), z.null(), z.coerce.date({ error: "Pick a valid date" })])
    .optional()
    .transform((value) => (value instanceof Date ? value : null)),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Pick a colour")
    .optional(),
};

export const goalCreateSchema = z.object({
  ...goalFields,
  startingAmount: z.coerce.number().min(0, "Starting amount cannot be negative").optional().default(0),
});

export const goalUpdateSchema = z.object(goalFields).partial();

export const contributionSchema = z.object({
  amount: z.coerce
    .number({ error: "Enter an amount" })
    .refine((value) => value !== 0, "Enter an amount other than zero")
    .refine((value) => Math.abs(value) <= 1_000_000_000_000, "That amount is too large"),
  note: z.string().trim().max(120).optional().default(""),
});