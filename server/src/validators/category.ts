import { z } from "zod";

export const categoryBodySchema = z.object({
  name: z.string().trim().min(2, "Category name should be at least 2 characters").max(40),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Pick a color like #E8A5A5"),
  icon: z.string().trim().max(30).optional(),
});

export const categoryUpdateSchema = categoryBodySchema.partial();