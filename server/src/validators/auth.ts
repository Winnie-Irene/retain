import { z } from "zod";

export const registerSchema = z.object({
  name: z.string({ error: "Name is required" }).trim().min(2, "Name should be at least 2 characters").max(80),
  email: z.string({ error: "Email is required" }).trim().toLowerCase().email("Enter a valid email address"),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password should be at least 8 characters")
    .regex(/[A-Za-z]/, "Password should include a letter")
    .regex(/[0-9]/, "Password should include a number"),
});

export const loginSchema = z.object({
  email: z.string({ error: "Email is required" }).trim().toLowerCase().email("Enter a valid email address"),
  password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;