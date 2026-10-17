import type { Request, Response } from "express";
import { Category, slugify } from "../models/Category.js";
import { Expense } from "../models/Expense.js";
import { currentUser } from "../middleware/auth.js";
import { AppError } from "../utils/AppError.js";
import { serializeCategory } from "../utils/serializers.js";
import { ensureDefaultCategory } from "../services/categoryService.js";
import { categoryBodySchema, categoryUpdateSchema } from "../validators/category.js";

async function assertUniqueSlug(slug: string, ignoreId?: string) {
  const clash = await Category.findOne({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) });
  if (clash) {
    throw AppError.conflict(`A category called "${clash.name}" already exists`);
  }
}

export async function listCategories(_req: Request, res: Response) {
  const categories = await Category.find().sort({ isDefault: 1, name: 1 });
  res.json({ categories: categories.map(serializeCategory) });
}

export async function createCategory(req: Request, res: Response) {
  const { id } = currentUser(req);
  const input = categoryBodySchema.parse(req.body);
  const slug = slugify(input.name);
  if (!slug) {
    throw AppError.badRequest("Category name needs at least one letter or number");
  }
  await assertUniqueSlug(slug);

  const category = await Category.create({ ...input, slug, createdBy: id });
  res.status(201).json({ category: serializeCategory(category) });
}

export async function updateCategory(req: Request, res: Response) {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw AppError.notFound("Category not found");
  }

  const input = categoryUpdateSchema.parse(req.body);

  if (input.name !== undefined) {
    if (category.isDefault) {
      throw AppError.badRequest("The default category cannot be renamed");
    }
    const slug = slugify(input.name);
    await assertUniqueSlug(slug, category._id.toString());
    category.set({ name: input.name, slug });
  }
  if (input.color !== undefined) category.set({ color: input.color });
  if (input.icon !== undefined) category.set({ icon: input.icon });

  await category.save();
  res.json({ category: serializeCategory(category) });
}

export async function deleteCategory(req: Request, res: Response) {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw AppError.notFound("Category not found");
  }
  if (category.isDefault) {
    throw AppError.badRequest("The default category cannot be deleted");
  }

  const fallback = await ensureDefaultCategory();
  const moved = await Expense.updateMany({ category: category._id }, { $set: { category: fallback._id } });
  await category.deleteOne();

  res.json({
    message: `Deleted "${category.name}". ${moved.modifiedCount} expense(s) moved to ${fallback.name}.`,
    reassignedCount: moved.modifiedCount,
    fallbackCategory: serializeCategory(fallback),
  });
}