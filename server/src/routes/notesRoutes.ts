import { Router } from "express";
import { getNote, saveNote } from "../controllers/notesController.js";
import { requireAuth } from "../middleware/auth.js";

export const notesRouter = Router();

notesRouter.use(requireAuth);
notesRouter.get("/:month", getNote);
notesRouter.put("/:month", saveNote);