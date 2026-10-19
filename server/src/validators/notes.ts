import { z } from "zod";

const entry = z.string().trim().max(500, "Keep it under 500 characters").optional();

export const noteBodySchema = z.object({
  goal: entry,
  reduce: entry,
  win: entry,
});