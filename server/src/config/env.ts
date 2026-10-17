import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET should be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  SEED_ADMIN_EMAIL: z.string().email().default("admin@retain.app"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("Admin@2026"),
  SEED_DEMO_EMAIL: z.string().email().default("winnie@retain.app"),
  SEED_DEMO_PASSWORD: z.string().min(8).default("Retain@2026"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  console.error("Invalid environment configuration:\n" + issues.join("\n"));
  process.exit(1);
}

export const env = parsed.data;

export const allowedOrigins = env.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean);