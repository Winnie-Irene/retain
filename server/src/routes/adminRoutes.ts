import { Router } from "express";
import { adminInsights } from "../controllers/adminController.js";
import { adminBudgetSummary, adminExpenseSummary, adminSavingsSummary } from "../controllers/adminSummaryController.js";
import { deleteUser, listUsers, resetUserPassword, updateUser } from "../controllers/adminUsersController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/insights", adminInsights);
adminRouter.get("/expenses", adminExpenseSummary);
adminRouter.get("/budgets", adminBudgetSummary);
adminRouter.get("/savings", adminSavingsSummary);
adminRouter.get("/users", listUsers);
adminRouter.patch("/users/:id", updateUser);
adminRouter.put("/users/:id/password", resetUserPassword);
adminRouter.delete("/users/:id", deleteUser);