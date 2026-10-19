import { Router } from "express";
import { changePassword, deleteAccount, updatePreferences, updateProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/auth.js";

export const profileRouter = Router();

profileRouter.use(requireAuth);
profileRouter.patch("/", updateProfile);
profileRouter.patch("/preferences", updatePreferences);
profileRouter.put("/password", changePassword);
profileRouter.delete("/", deleteAccount);