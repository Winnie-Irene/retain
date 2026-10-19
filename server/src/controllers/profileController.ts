import type { Request, Response } from "express";
import { User, passwordMatches, toPublicUser } from "../models/User.js";
import { Expense } from "../models/Expense.js";
import { Budget } from "../models/Budget.js";
import { SavingsGoal } from "../models/SavingsGoal.js";
import { MonthlyNote } from "../models/MonthlyNote.js";
import { currentUser } from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";
import { deleteAccountSchema, passwordChangeSchema, preferencesSchema, profileSchema } from "../validators/profile.js";

async function findSelf(req: Request, withPassword = false) {
  const { id } = currentUser(req);
  const query = User.findById(id);
  const user = withPassword ? await query.select("+password") : await query;
  if (!user) {
    throw AppError.notFound("User not found");
  }
  return user;
}

export async function updateProfile(req: Request, res: Response) {
  const input = profileSchema.parse(req.body);
  const user = await findSelf(req);

  if (input.email && input.email !== user.email) {
    const taken = await User.exists({ email: input.email, _id: { $ne: user._id } });
    if (taken) {
      throw AppError.conflict("Another account already uses this email", [
        { field: "email", message: "Another account already uses this email" },
      ]);
    }
    user.email = input.email;
  }
  if (input.name !== undefined) user.name = input.name;
  if (input.avatar !== undefined) user.avatar = input.avatar;

  await user.save();
  res.json({ user: toPublicUser(user) });
}

export async function updatePreferences(req: Request, res: Response) {
  const input = preferencesSchema.parse(req.body);
  const user = await findSelf(req);

  if (input.alertAt !== undefined) user.set("preferences.alertAt", input.alertAt);
  if (input.landingPage !== undefined) user.set("preferences.landingPage", input.landingPage);

  await user.save();
  res.json({ user: toPublicUser(user) });
}

export async function changePassword(req: Request, res: Response) {
  const input = passwordChangeSchema.parse(req.body);
  const user = await findSelf(req, true);

  if (!(await passwordMatches(input.currentPassword, user.password))) {
    throw AppError.badRequest("Your current password is not right", [
      { field: "currentPassword", message: "This does not match your current password" },
    ]);
  }
  if (input.currentPassword === input.newPassword) {
    throw AppError.badRequest("Pick a password you have not used here", [
      { field: "newPassword", message: "Your new password should be different from the current one" },
    ]);
  }

  user.password = input.newPassword;
  await user.save();
  res.json({ message: "Password updated" });
}

export async function deleteAccount(req: Request, res: Response) {
  const input = deleteAccountSchema.parse(req.body);
  const user = await findSelf(req, true);

  if (user.role === "admin") {
    throw AppError.forbidden("Admin accounts cannot be deleted from the app");
  }
  if (!(await passwordMatches(input.password, user.password))) {
    throw AppError.badRequest("That password is not right", [
      { field: "password", message: "This does not match your password" },
    ]);
  }

  await Promise.all([
    Expense.deleteMany({ user: user._id }),
    Budget.deleteMany({ user: user._id }),
    SavingsGoal.deleteMany({ user: user._id }),
    MonthlyNote.deleteMany({ user: user._id }),
  ]);
  await user.deleteOne();

  res.status(204).send();
}