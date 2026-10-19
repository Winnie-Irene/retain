import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { SelectField, TextAreaField, TextField } from "../ui/Field";
import { useCategories } from "../../hooks/useCategories";
import { expenseApi } from "../../api/services";
import { ApiError, errorMessage } from "../../api/client";
import { EXPENSE_KINDS, PAYMENT_METHODS } from "../../utils/constants";
import { fromInputDate, toInputDate, todayInputValue } from "../../utils/format";
import type { Expense, ExpenseInput, ExpenseKind, PaymentMethod } from "../../types/models";

interface ExpenseFormModalProps {
  open: boolean;
  expense?: Expense | null;
  onClose: () => void;
  onSaved: (expense: Expense) => void;
}

interface FormState {
  title: string;
  amount: string;
  category: string;
  date: string;
  paymentMethod: PaymentMethod | "";
  notes: string;
  kind: ExpenseKind;
}

function initialState(expense?: Expense | null): FormState {
  if (!expense) {
    return {
      title: "",
      amount: "",
      category: "",
      date: todayInputValue(),
      paymentMethod: "",
      notes: "",
      kind: "variable",
    };
  }
  return {
    title: expense.title,
    amount: String(expense.amount),
    category: expense.category?.id ?? "",
    date: toInputDate(expense.date),
    paymentMethod: expense.paymentMethod,
    notes: expense.notes,
    kind: expense.kind ?? "variable",
  };
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (form.title.trim().length < 2) errors.title = "Give the expense a short title";
  const amount = Number(form.amount);
  if (!form.amount || !Number.isFinite(amount) || amount <= 0) errors.amount = "Enter an amount above zero";
  if (!form.category) errors.category = "Pick a category";
  if (!form.date) errors.date = "Pick the date you paid";
  if (!form.paymentMethod) errors.paymentMethod = "How did you pay?";
  return errors;
}

export function ExpenseFormModal({ open, expense, onClose, onSaved }: ExpenseFormModalProps) {
  return open ? <ExpenseForm key={expense?.id ?? "new"} expense={expense} onClose={onClose} onSaved={onSaved} /> : null;
}

function ExpenseForm({ expense, onClose, onSaved }: Omit<ExpenseFormModalProps, "open">) {
  const { categories } = useCategories();
  const [form, setForm] = useState<FormState>(() => initialState(expense));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(expense);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !form.paymentMethod) return;

    const payload: ExpenseInput = {
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: fromInputDate(form.date),
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim(),
      kind: form.kind,
    };

    setSaving(true);
    try {
      const { expense: saved } = expense
        ? await expenseApi.update(expense.id, payload)
        : await expenseApi.create(payload);
      toast.success(isEdit ? "Expense updated" : "Expense added");
      onSaved(saved);
      onClose();
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) setErrors(error.fieldErrors);
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={isEdit ? "Edit expense" : "New expense"}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="expense-form" loading={saving}>
            {isEdit ? "Save changes" : "Add expense"}
          </Button>
        </>
      }
    >
      <form id="expense-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Title"
          placeholder="What did you pay for?"
          value={form.title}
          maxLength={120}
          onChange={(event) => update("title", event.target.value)}
          error={errors.title}
        />
        <div className="form-row">
          <TextField
            label="Amount"
            prefix="RWF"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            value={form.amount}
            onChange={(event) => update("amount", event.target.value)}
            error={errors.amount}
          />
          <TextField
            label="Date"
            type="date"
            value={form.date}
            max={todayInputValue()}
            onChange={(event) => update("date", event.target.value)}
            error={errors.date}
          />
        </div>
        <div className="form-row">
          <SelectField
            label="Category"
            placeholder="Choose a category"
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
            error={errors.category}
          />
          <SelectField
            label="Payment method"
            placeholder="Choose how you paid"
            value={form.paymentMethod}
            onChange={(event) => update("paymentMethod", event.target.value as PaymentMethod)}
            options={PAYMENT_METHODS}
            error={errors.paymentMethod}
          />
        </div>
                <fieldset className="kind-field">
          <legend className="field__label">Type</legend>
          <div className="segmented" role="radiogroup" aria-label="Expense type">
            {EXPENSE_KINDS.map((option) => (
              <button
                type="button"
                key={option.value}
                role="radio"
                aria-checked={form.kind === option.value}
                className={`segmented__option ${form.kind === option.value ? "is-active" : ""}`}
                onClick={() => update("kind", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="field__message">{EXPENSE_KINDS.find((option) => option.value === form.kind)?.hint}</p>
        </fieldset>
        <TextAreaField
          label="Notes"
          optional
          placeholder="Anything you want to remember about this one"
          value={form.notes}
          maxLength={500}
          onChange={(event) => update("notes", event.target.value)}
          error={errors.notes}
        />
      </form>
    </Modal>
  );
}