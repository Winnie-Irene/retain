import { Router } from "express";
import { budgetHistory, deleteBudget, getBudget, upsertBudget } from "../controllers/budgetController.js";
import { requireAuth } from "../middleware/auth.js";

export const budgetRouter = Router();

budgetRouter.use(requireAuth);

budgetRouter.get("/", getBudget);
budgetRouter.get("/history", budgetHistory);
budgetRouter.route("/:month").put(upsertBudget).delete(deleteBudget);