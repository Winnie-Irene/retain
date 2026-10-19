import { z } from "zod";
import { ACCOUNT_STATUSES, ROLES } from "../config/constants.js";
import { passwordSchema } from "./auth.js";

export const userQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  role: z.enum(ROLES).optional(),
  status: z.enum(ACCOUNT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "Name should be at least 2 characters").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    status: z.enum(ACCOUNT_STATUSES),
  })
  .partial();

export const passwordResetSchema = z.object({
  newPassword: passwordSchema,
});