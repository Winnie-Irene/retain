import { z } from "zod";
import { LANDING_PAGES } from "../config/constants.js";
import { passwordSchema } from "./auth.js";

const AVATAR_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

export const profileSchema = z
  .object({
    name: z.string().trim().min(2, "Name should be at least 2 characters").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    avatar: z
      .string()
      .max(400_000, "That picture is too large. Try a smaller one.")
      .refine((value) => value === "" || AVATAR_PATTERN.test(value), "Upload a PNG, JPG or WEBP picture"),
  })
  .partial();

export const preferencesSchema = z
  .object({
    alertAt: z.coerce
      .number()
      .int()
      .min(50, "Pick a number between 50 and 95")
      .max(95, "Pick a number between 50 and 95"),
    landingPage: z.enum(LANDING_PAGES),
  })
  .partial();

export const passwordChangeSchema = z.object({
  currentPassword: z.string({ error: "Enter your current password" }).min(1, "Enter your current password"),
  newPassword: passwordSchema,
});

export const deleteAccountSchema = z.object({
  password: z.string({ error: "Enter your password to confirm" }).min(1, "Enter your password to confirm"),
});