import { Router } from "express";
import { adminInsights } from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/insights", adminInsights);