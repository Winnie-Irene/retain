import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { TextField } from "../ui/Field";
import { savingsApi } from "../../api/services";
import { ApiError, errorMessage } from "../../api/client";
import { formatMoney } from "../../utils/format";
import type { SavingsGoal } from "../../types/models";

export type ContributionMode = "add" | "withdraw";

interface ContributionModalProps {
  goal: SavingsGoal;
  mode: ContributionMode;
  onClose: () => void;
  onSaved: () => void;
}

export function ContributionModal({ goal, mode, onClose, onSaved }: ContributionModalProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const isWithdraw = mode === "withdraw";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(amount);
    if (!amount || !Number.isFinite(value) || value <= 0) {
      setError("Enter an amount above zero");
      return;
    }
    if (isWithdraw && value > goal.saved) {
      setError(`You only have ${formatMoney(goal.saved)} in this goal`);
      return;
    }
    setError(undefined);
    setSaving(true);
    try {
      const { goal: updated } = await savingsApi.contribute(goal.id, isWithdraw ? -value : value, note.trim());
      if (!isWithdraw && updated.isComplete && !goal.isComplete) {
        toast.success(`You reached ${goal.name}. Well done!`);
      } else {
        toast.success(isWithdraw ? `Took ${formatMoney(value)} out` : `Added ${formatMoney(value)} to ${goal.name}`);
      }
      onSaved();
      onClose();
    } catch (caught) {
      setError(caught instanceof ApiError ? (caught.fieldErrors.amount ?? caught.message) : errorMessage(caught));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={isWithdraw ? "Take money out" : "Add to savings"}
      onClose={onClose}
      width="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="contribution-form" loading={saving}>
            {isWithdraw ? "Take it out" : "Add money"}
          </Button>
        </>
      }
    >
      <form id="contribution-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <p className="confirm__message">
          <strong>{goal.name}</strong> has {formatMoney(goal.saved)} of {formatMoney(goal.targetAmount)}.
        </p>
        <TextField
          label="Amount"
          prefix="RWF"
          type="number"
          inputMode="numeric"
          min="0"
          step="500"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          error={error}
        />
        <TextField
          label="Note"
          optional
          placeholder={isWithdraw ? "What was it for?" : "Where did it come from?"}
          maxLength={120}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </form>
    </Modal>
  );
}