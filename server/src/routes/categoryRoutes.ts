import { Router } from "express";
import { createCategory, deleteCategory, listCategories, updateCategory } from "../controllers/categoryController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const categoryRouter = Router();

categoryRouter.use(requireAuth);

categoryRouter.get("/", listCategories);
categoryRouter.post("/", requireAdmin, createCategory);
categoryRouter.patch("/:id", requireAdmin, updateCategory);
categoryRouter.delete("/:id", requireAdmin, deleteCategory);