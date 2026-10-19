import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const contributionSchema = new Schema(
  {
    amount: { type: Number, required: true },
    note: { type: String, trim: true, maxlength: 120, default: "" },
    date: { type: Date, default: () => new Date() },
  },
  { _id: true },
);

const savingsGoalSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    targetAmount: { type: Number, required: true, min: 1 },
    targetDate: { type: Date, default: null },
    color: { type: String, default: "#A3B18A", match: /^#[0-9A-Fa-f]{6}$/ },
    contributions: { type: [contributionSchema], default: [] },
  },
  { timestamps: true },
);

export type SavingsGoalFields = InferSchemaType<typeof savingsGoalSchema>;
export type SavingsGoalDocument = HydratedDocument<SavingsGoalFields>;

export const SavingsGoal = model("SavingsGoal", savingsGoalSchema);