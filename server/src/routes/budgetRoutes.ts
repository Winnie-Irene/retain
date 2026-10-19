import { Router } from "express";
import { budgetHistory, deleteBudget, getBudget, upsertBudget } from "../controllers/budgetController.js";
import { requireAuth, requireMember } from "../middleware/auth.js";

export const budgetRouter = Router();

budgetRouter.use(requireAuth, requireMember);

budgetRouter.get("/", getBudget);
budgetRouter.get("/history", budgetHistory);
budgetRouter.route("/:month").put(upsertBudget).delete(deleteBudget);