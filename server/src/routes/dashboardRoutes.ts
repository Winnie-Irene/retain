import { Router } from "express";
import { userDashboard } from "../controllers/dashboardController.js";
import { requireAuth, requireMember } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, requireMember, userDashboard);