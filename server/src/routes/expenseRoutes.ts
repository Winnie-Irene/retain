import { Router } from "express";
import {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  listPaymentMethods,
  updateExpense,
} from "../controllers/expenseController.js";
import { requireAuth } from "../middleware/auth.js";

export const expenseRouter = Router();

expenseRouter.use(requireAuth);

expenseRouter.get("/payment-methods", listPaymentMethods);
expenseRouter.route("/").get(listExpenses).post(createExpense);
expenseRouter.route("/:id").get(getExpense).patch(updateExpense).delete(deleteExpense);