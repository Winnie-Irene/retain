import { Router } from "express";
import {
  addContribution,
  createGoal,
  deleteGoal,
  listGoals,
  removeContribution,
  updateGoal,
} from "../controllers/savingsController.js";
import { requireAuth, requireMember } from "../middleware/auth.js";

export const savingsRouter = Router();

savingsRouter.use(requireAuth, requireMember);
savingsRouter.get("/", listGoals);
savingsRouter.post("/", createGoal);
savingsRouter.patch("/:id", updateGoal);
savingsRouter.delete("/:id", deleteGoal);
savingsRouter.post("/:id/contributions", addContribution);
savingsRouter.delete("/:id/contributions/:contributionId", removeContribution);