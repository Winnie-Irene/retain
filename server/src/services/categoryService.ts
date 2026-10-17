import { Category, type CategoryDocument } from "../models/Category.js";
import { DEFAULT_CATEGORY_COLOR, DEFAULT_CATEGORY_NAME } from "../config/constants.js";

export async function ensureDefaultCategory(): Promise<CategoryDocument> {
  const existing = await Category.findOne({ isDefault: true });
  if (existing) return existing;

  return Category.create({
    name: DEFAULT_CATEGORY_NAME,
    slug: "uncategorized",
    color: DEFAULT_CATEGORY_COLOR,
    icon: "inbox",
    isDefault: true,
  });
}