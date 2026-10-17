import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    color: { type: String, required: true, match: /^#[0-9A-Fa-f]{6}$/ },
    icon: { type: String, default: "tag", maxlength: 30 },
    isDefault: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export type CategoryFields = InferSchemaType<typeof categorySchema>;
export type CategoryDocument = HydratedDocument<CategoryFields>;

export const Category = model("Category", categorySchema);

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}