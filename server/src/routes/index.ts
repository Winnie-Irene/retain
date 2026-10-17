import { Router } from "express";
import { authRouter } from "./authRoutes.js";
import { expenseRouter } from "./expenseRoutes.js";
import { budgetRouter } from "./budgetRoutes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/expenses", expenseRouter);
apiRouter.use("/budgets", budgetRouter);