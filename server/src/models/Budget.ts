import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const budgetSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

budgetSchema.index({ user: 1, month: 1 }, { unique: true });

export type BudgetFields = InferSchemaType<typeof budgetSchema>;
export type BudgetDocument = HydratedDocument<BudgetFields>;

export const Budget = model("Budget", budgetSchema);