import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const monthlyNoteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    goal: { type: String, trim: true, maxlength: 500, default: "" },
    reduce: { type: String, trim: true, maxlength: 500, default: "" },
    win: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true },
);

monthlyNoteSchema.index({ user: 1, month: 1 }, { unique: true });

export type MonthlyNoteFields = InferSchemaType<typeof monthlyNoteSchema>;
export type MonthlyNoteDocument = HydratedDocument<MonthlyNoteFields>;

export const MonthlyNote = model("MonthlyNote", monthlyNoteSchema);