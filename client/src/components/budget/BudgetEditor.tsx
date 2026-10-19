import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { budgetApi } from "../../api/services";
import { errorMessage } from "../../api/client";
import { Button } from "../ui/Button";
import { TextField } from "../ui/Field";
import type { BudgetSummary } from "../../types/models";
import { formatMoney, monthLabel } from "../../utils/format";

interface BudgetEditorProps {
  month: string;
  current: BudgetSummary;
  suggestion?: number | null;
  onSaved: (budget: BudgetSummary) => void;
}

export function BudgetEditor({ month, current, suggestion, onSaved }: BudgetEditorProps) {
  const [amount, setAmount] = useState(current.amount !== null ? String(current.amount) : "");
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(amount);
    if (!amount || !Number.isFinite(value) || value <= 0) {
      setError("Enter a budget above zero");
      return;
    }
    setError(undefined);
    setSaving(true);
    try {
      const { budget } = await budgetApi.save(month, value);
      toast.success(`Budget for ${monthLabel(month)} saved`);
      onSaved(budget);
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="budget-editor" onSubmit={handleSubmit} noValidate>
      <TextField
        label={current.amount === null ? `How much do you plan to spend in ${monthLabel(month)}?` : "Monthly budget"}
        prefix="RWF"
        type="number"
        inputMode="numeric"
        min="0"
        step="1000"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        error={error}
      />
      <div className="budget-editor__actions">
        <Button type="submit" loading={saving}>
          {current.amount === null ? "Set budget" : "Update budget"}
        </Button>
        {suggestion && String(suggestion) !== amount && (
          <button type="button" className="link-btn" onClick={() => setAmount(String(suggestion))}>
            Use last month's {formatMoney(suggestion)}
          </button>
        )}
      </div>
    </form>
  );
}