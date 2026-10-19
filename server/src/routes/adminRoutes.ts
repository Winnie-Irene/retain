import { Router } from "express";
import { adminInsights } from "../controllers/adminController.js";
import { adminBudgetSummary, adminExpenseSummary, adminSavingsSummary } from "../controllers/adminSummaryController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/insights", adminInsights);
adminRouter.get("/expenses", adminExpenseSummary);
adminRouter.get("/budgets", adminBudgetSummary);
adminRouter.get("/savings", adminSavingsSummary);