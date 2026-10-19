import type { Request, Response } from "express";
import { MonthlyNote } from "../models/MonthlyNote.js";
import { currentUser } from "../middleware/auth.js";
import { monthSchema } from "../validators/budget.js";
import { noteBodySchema } from "../validators/notes.js";

interface NoteLike {
  goal?: string | null;
  reduce?: string | null;
  win?: string | null;
  updatedAt?: Date | null;
}

function serializeNote(month: string, note: NoteLike | null) {
  return {
    month,
    goal: note?.goal ?? "",
    reduce: note?.reduce ?? "",
    win: note?.win ?? "",
    updatedAt: note?.updatedAt ? note.updatedAt.toISOString() : null,
  };
}

export async function getNote(req: Request, res: Response) {
  const { id } = currentUser(req);
  const month = monthSchema.parse(req.params.month);
  const note = await MonthlyNote.findOne({ user: id, month });
  res.json({ note: serializeNote(month, note) });
}

export async function saveNote(req: Request, res: Response) {
  const { id } = currentUser(req);
  const month = monthSchema.parse(req.params.month);
  const input = noteBodySchema.parse(req.body);

  const note = await MonthlyNote.findOneAndUpdate(
    { user: id, month },
    { $set: input },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  res.json({ note: serializeNote(month, note) });
}