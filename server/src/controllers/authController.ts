import type { Request, Response } from "express";
import { User, passwordMatches, toPublicUser } from "../models/User.js";
import { loginSchema, registerSchema } from "../validators/auth.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/tokens.js";
import { currentUser } from "../middleware/auth.js";

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);

  const exists = await User.exists({ email: input.email });
  if (exists) {
    throw AppError.conflict("An account with this email already exists");
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: "user",
    termsAcceptedAt: new Date(),
  });
  const token = signToken({ sub: user._id.toString(), role: user.role });

  res.status(201).json({ token, user: toPublicUser(user) });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);

  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user || !(await passwordMatches(input.password, user.password))) {
    throw AppError.unauthorized("Email or password is incorrect");
  }
  if (user.status === "suspended") {
    throw AppError.forbidden("This account has been suspended. Please contact the Retain team.");
  }

  const token = signToken({ sub: user._id.toString(), role: user.role });
  res.json({ token, user: toPublicUser(user) });
}

export async function me(req: Request, res: Response) {
  const { id } = currentUser(req);
  const user = await User.findById(id);
  if (!user) {
    throw AppError.notFound("User not found");
  }
  res.json({ user: toPublicUser(user) });
}