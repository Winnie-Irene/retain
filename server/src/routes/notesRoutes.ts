import { Router } from "express";
import { getNote, saveNote } from "../controllers/notesController.js";
import { requireAuth, requireMember } from "../middleware/auth.js";

export const notesRouter = Router();

notesRouter.use(requireAuth, requireMember);
notesRouter.get("/:month", getNote);
notesRouter.put("/:month", saveNote);