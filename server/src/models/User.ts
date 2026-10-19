import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";
import { ACCOUNT_STATUSES, DEFAULT_ALERT_PERCENT, LANDING_PAGES, ROLES } from "../config/constants.js";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: "user" },
    status: { type: String, enum: ACCOUNT_STATUSES, default: "active" },
    currency: { type: String, default: "RWF", maxlength: 3 },
    avatar: { type: String, default: "", maxlength: 400_000 },
    preferences: {
      alertAt: { type: Number, default: DEFAULT_ALERT_PERCENT, min: 50, max: 95 },
      landingPage: { type: String, enum: LANDING_PAGES, default: "dashboard" },
    },
    termsAcceptedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export type UserFields = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserFields>;

export const User = model("User", userSchema);

export function toPublicUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status ?? "active",
    currency: user.currency,
    avatar: user.avatar ?? "",
    preferences: {
      alertAt: user.preferences?.alertAt ?? DEFAULT_ALERT_PERCENT,
      landingPage: user.preferences?.landingPage ?? "dashboard",
    },
    createdAt: user.createdAt,
  };
}

export async function passwordMatches(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}