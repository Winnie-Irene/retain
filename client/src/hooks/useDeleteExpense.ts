import { useState } from "react";
import { toast } from "sonner";
import { expenseApi } from "../api/services";
import { errorMessage } from "../api/client";
import type { Expense } from "../types/models";

export function useDeleteExpense(onDeleted: (expense: Expense) => void) {
  const [target, setTarget] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await expenseApi.remove(target.id);
      toast.success(`Deleted "${target.title}"`);
      onDeleted(target);
      setTarget(null);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return {
    target,
    deleting,
    request: setTarget,
    cancel: () => setTarget(null),
    confirm,
  };
}