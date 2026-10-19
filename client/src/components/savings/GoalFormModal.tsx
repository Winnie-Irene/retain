import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { TextField } from "../ui/Field";
import { savingsApi } from "../../api/services";
import { ApiError, errorMessage } from "../../api/client";
import { CATEGORY_SWATCHES } from "../../utils/constants";
import { fromInputDate, toInputDate, todayInputValue } from "../../utils/format";
import type { SavingsGoal } from "../../types/models";

interface GoalFormModalProps {
  goal: SavingsGoal | null;
  onClose: () => void;
  onSaved: () => void;
}

export function GoalFormModal({ goal, onClose, onSaved }: GoalFormModalProps) {
  const [name, setName] = useState(goal?.name ?? "");
  const [target, setTarget] = useState(goal ? String(goal.targetAmount) : "");
  const [date, setDate] = useState(goal?.targetDate ? toInputDate(goal.targetDate) : "");
  const [color, setColor] = useState(goal?.color ?? CATEGORY_SWATCHES[3]);
  const [starting, setStarting] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) nextErrors.name = "Give the goal a name";
    const targetAmount = Number(target);
    if (!target || !Number.isFinite(targetAmount) || targetAmount <= 0)
      nextErrors.targetAmount = "Enter a target above zero";
    const startingAmount = starting ? Number(starting) : 0;
    if (!Number.isFinite(startingAmount) || startingAmount < 0) nextErrors.startingAmount = "Enter zero or more";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      name: name.trim(),
      targetAmount,
      targetDate: date ? fromInputDate(date) : null,
      color,
    };

    setSaving(true);
    try {
      if (goal) {
        await savingsApi.update(goal.id, payload);
        toast.success(`Updated ${payload.name}`);
      } else {
        await savingsApi.create({ ...payload, startingAmount });
        toast.success(`${payload.name} is on the board`);
      }
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={goal ? "Edit goal" : "New savings goal"}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="goal-form" loading={saving}>
            {goal ? "Save changes" : "Create goal"}
          </Button>
        </>
      }
    >
      <form id="goal-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <TextField
          label="What are you saving for?"
          placeholder="e.g. Emergency fund"
          value={name}
          maxLength={60}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />
        <div className="form-row">
          <TextField
            label="Target amount"
            prefix="RWF"
            type="number"
            inputMode="numeric"
            min="0"
            step="1000"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            error={errors.targetAmount}
          />
          <TextField
            label="Reach it by"
            optional
            type="date"
            min={goal ? undefined : todayInputValue()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            error={errors.targetDate}
          />
        </div>
        {!goal && (
          <TextField
            label="Already saved"
            optional
            prefix="RWF"
            type="number"
            inputMode="numeric"
            min="0"
            step="1000"
            placeholder="0"
            value={starting}
            onChange={(event) => setStarting(event.target.value)}
            error={errors.startingAmount}
          />
        )}
        <fieldset className="swatches">
          <legend className="field__label">Colour</legend>
          <div className="swatches__grid">
            {CATEGORY_SWATCHES.map((swatch) => (
              <button
                type="button"
                key={swatch}
                className={`swatch ${swatch.toLowerCase() === color.toLowerCase() ? "is-active" : ""}`}
                style={{ background: swatch }}
                aria-label={`Use colour ${swatch}`}
                aria-pressed={swatch.toLowerCase() === color.toLowerCase()}
                onClick={() => setColor(swatch)}
              />
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}