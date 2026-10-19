import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { EXPENSE_KINDS, PAYMENT_METHODS } from "../config/constants.js";

const expenseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    date: { type: Date, required: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
    kind: { type: String, enum: EXPENSE_KINDS, default: "variable" },
  },
  { timestamps: true },
);

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, amount: -1 });

export type ExpenseFields = InferSchemaType<typeof expenseSchema>;
export type ExpenseDocument = HydratedDocument<ExpenseFields>;

export const Expense = model("Expense", expenseSchema);