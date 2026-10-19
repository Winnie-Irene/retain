import { useState, type FormEvent, type ReactNode } from "react";
import { Heart, Lightbulb, Star, Target } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "../ui/Sheet";
import { Button } from "../ui/Button";
import { ErrorNote, LoadingLines } from "../ui/Bits";
import { useRemote } from "../../hooks/useRemote";
import { notesApi } from "../../api/services";
import { errorMessage } from "../../api/client";
import { monthName, timeAgo } from "../../utils/format";
import type { MonthlyNote } from "../../types/models";

type NoteField = "goal" | "reduce" | "win";

const PROMPTS: { field: NoteField; label: string; placeholder: string; icon: ReactNode }[] = [
  {
    field: "goal",
    label: "This month's financial goal",
    placeholder: "Keep transport under 40,000",
    icon: <Target size={22} />,
  },
  {
    field: "reduce",
    label: "One thing I can reduce next month",
    placeholder: "Takeaway lunches",
    icon: <Lightbulb size={22} />,
  },
  {
    field: "win",
    label: "One thing I did well",
    placeholder: "Saved before spending",
    icon: <Star size={22} />,
  },
];

function NotesForm({ month, note, onSaved }: { month: string; note: MonthlyNote; onSaved: () => void }) {
  const [draft, setDraft] = useState({ goal: note.goal, reduce: note.reduce, win: note.win });
  const [saving, setSaving] = useState(false);
  const changed = draft.goal !== note.goal || draft.reduce !== note.reduce || draft.win !== note.win;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await notesApi.save(month, draft);
      toast.success(`Notes for ${monthName(month)} saved`);
      onSaved();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="notes" onSubmit={handleSubmit}>
      <div className="notes__grid">
        {PROMPTS.map((prompt) => (
          <label key={prompt.field} className="note-card">
            <span className="note-card__head">
              <span className="note-card__icon" aria-hidden="true">
                {prompt.icon}
              </span>
              <span className="note-card__label">{prompt.label}:</span>
            </span>
            <textarea
              className="note-card__lines"
              rows={3}
              maxLength={500}
              placeholder={prompt.placeholder}
              value={draft[prompt.field]}
              onChange={(event) => setDraft((current) => ({ ...current, [prompt.field]: event.target.value }))}
            />
          </label>
        ))}
      </div>
      <div className="notes__footer">
        <p className="notes__saved">{note.updatedAt ? `Last saved ${timeAgo(note.updatedAt)}` : "Not written yet"}</p>
        <Button type="submit" size="sm" loading={saving} disabled={!changed}>
          Save notes
        </Button>
        <p className="script notes__sign" aria-hidden="true">
          You got this <Heart size={16} />
        </p>
      </div>
    </form>
  );
}

export function MonthNotes({ month }: { month: string }) {
  const { data, loading, error, reload } = useRemote(() => notesApi.get(month), `notes-${month}`);

  return (
    <Sheet
      title="Goals & Notes"
      caption={`A few honest lines for ${monthName(month)}. Only you can see them.`}
      className="notes-sheet"
    >
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && loading && <LoadingLines rows={3} />}
      {data && (
        <NotesForm key={`${month}-${data.note.updatedAt ?? "new"}`} month={month} note={data.note} onSaved={reload} />
      )}
    </Sheet>
  );
}