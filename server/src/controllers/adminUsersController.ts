import type { Request, Response } from "express";
import { Types, type QueryFilter } from "mongoose";
import { User, toPublicUser, type UserFields } from "../models/User.js";
import { Expense } from "../models/Expense.js";
import { Budget } from "../models/Budget.js";
import { SavingsGoal } from "../models/SavingsGoal.js";
import { MonthlyNote } from "../models/MonthlyNote.js";
import { currentUser } from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";
import { escapeRegex } from "../utils/serializers.js";
import { round } from "../services/budgetService.js";
import { passwordResetSchema, userQuerySchema, userUpdateSchema } from "../validators/adminUsers.js";

async function findMember(req: Request) {
  const { id } = currentUser(req);
  if (req.params.id === id) {
    throw AppError.badRequest("Use Settings to change your own account");
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    throw AppError.notFound("User not found");
  }
  if (user.role === "admin") {
    throw AppError.forbidden("Admin accounts can only be changed by their owners");
  }
  return user;
}

export async function listUsers(req: Request, res: Response) {
  const query = userQuerySchema.parse(req.query);
  const filter: QueryFilter<UserFields> = {};

  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ name: pattern }, { email: pattern }];
  }
  if (query.role) filter.role = query.role;
  if (query.status === "suspended") filter.status = "suspended";
  if (query.status === "active") filter.status = { $ne: "suspended" };

  const [users, total, counts] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
    User.countDocuments(filter),
    User.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const ids = users.map((user) => user._id);
  const [expenseRows, goalRows] = await Promise.all([
    Expense.aggregate<{ _id: Types.ObjectId; count: number; total: number; last: Date }>([
      { $match: { user: { $in: ids } } },
      { $group: { _id: "$user", count: { $sum: 1 }, total: { $sum: "$amount" }, last: { $max: "$createdAt" } } },
    ]),
    SavingsGoal.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { user: { $in: ids } } },
      { $group: { _id: "$user", count: { $sum: 1 } } },
    ]),
  ]);

  const expenses = new Map(expenseRows.map((row) => [row._id.toString(), row]));
  const goals = new Map(goalRows.map((row) => [row._id.toString(), row.count]));
  const suspended = counts.find((row) => row._id === "suspended")?.count ?? 0;
  const everyone = counts.reduce((sum, row) => sum + row.count, 0);

  res.json({
    items: users.map((user) => {
      const key = user._id.toString();
      const activity = expenses.get(key);
      return {
        ...toPublicUser(user),
        expenseCount: activity?.count ?? 0,
        expenseTotal: round(activity?.total ?? 0),
        goalCount: goals.get(key) ?? 0,
        lastActive: activity?.last ? activity.last.toISOString() : null,
      };
    }),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
    counts: { all: everyone, active: everyone - suspended, suspended },
  });
}

export async function updateUser(req: Request, res: Response) {
  const input = userUpdateSchema.parse(req.body);
  const user = await findMember(req);

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
  if (input.status !== undefined) user.status = input.status;

  await user.save();
  res.json({ user: toPublicUser(user) });
}

export async function resetUserPassword(req: Request, res: Response) {
  const { newPassword } = passwordResetSchema.parse(req.body);
  const user = await findMember(req);
  user.password = newPassword;
  await user.save();
  res.json({ message: `Password reset for ${user.name}` });
}

export async function deleteUser(req: Request, res: Response) {
  const user = await findMember(req);
  await Promise.all([
    Expense.deleteMany({ user: user._id }),
    Budget.deleteMany({ user: user._id }),
    SavingsGoal.deleteMany({ user: user._id }),
    MonthlyNote.deleteMany({ user: user._id }),
  ]);
  await user.deleteOne();
  res.json({ message: `${user.name} and all of their records were deleted` });
}