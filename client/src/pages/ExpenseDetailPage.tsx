import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Sheet } from "../components/ui/Sheet";
import { Button } from "../components/ui/Button";
import { CategoryTag, EmptyState, ErrorNote, LoadingLines } from "../components/ui/Bits";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ExpenseFormModal } from "../components/expenses/ExpenseFormModal";
import { useRemote } from "../hooks/useRemote";
import { useDeleteExpense } from "../hooks/useDeleteExpense";
import { expenseApi } from "../api/services";
import { formatDate, formatMoney, timeAgo } from "../utils/format";
import { PAYMENT_LABELS } from "../utils/constants";
import type { Expense } from "../types/models";

export function ExpenseDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useRemote(() => expenseApi.get(id), id);
  const [override, setOverride] = useState<Expense | null>(null);
  const [editing, setEditing] = useState(false);
  const deletion = useDeleteExpense(() => navigate("/expenses", { replace: true }));

  const expense = override?.id === id ? override : (data?.expense ?? null);

  if (loading && !expense) {
    return (
      <Sheet>
        <LoadingLines rows={5} />
      </Sheet>
    );
  }

  if (error || !expense) {
    return (
      <Sheet>
        {error?.toLowerCase().includes("not found") ? (
          <EmptyState
            title="Not on this page"
            message="This expense does not exist or belongs to someone else."
            action={
              <Link to="/expenses" className="btn btn--soft btn--md">
                Back to expenses
              </Link>
            }
          />
        ) : (
          <ErrorNote message={error ?? "Could not load this expense"} onRetry={reload} />
        )}
      </Sheet>
    );
  }

  const rows: { label: string; value: ReactNode }[] = [
    { label: "Amount", value: <strong className="num">{formatMoney(expense.amount)}</strong> },
    { label: "Category", value: <CategoryTag category={expense.category} /> },
    { label: "Date", value: formatDate(expense.date, "long") },
    { label: "Payment method", value: PAYMENT_LABELS[expense.paymentMethod] },
    { label: "Recorded", value: `${formatDate(expense.createdAt, "long")} (${timeAgo(expense.createdAt)})` },
    { label: "Last edited", value: timeAgo(expense.updatedAt) },
  ];

  return (
    <>
      <Link to="/expenses" className="back-link">
        <ArrowLeft size={16} />
        All expenses
      </Link>

      <PageHeader
        title={expense.title}
        subtitle={`Paid ${formatDate(expense.date, "long")} with ${PAYMENT_LABELS[expense.paymentMethod].toLowerCase()}`}
        aside={
          <div className="detail-actions">
            <Button variant="soft" icon={<Pencil size={16} />} onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button variant="ghost" icon={<Trash2 size={16} />} onClick={() => deletion.request(expense)}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="detail-grid">
        <Sheet title="Details" flush>
          <table className="ledger ledger--details">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Sheet>

        <Sheet title="Notes">
          {expense.notes ? (
            <p className="detail-notes">{expense.notes}</p>
          ) : (
            <p className="muted">No notes on this one. Edit the expense if you want to jot something down.</p>
          )}
        </Sheet>
      </div>

      <ExpenseFormModal open={editing} expense={expense} onClose={() => setEditing(false)} onSaved={setOverride} />

      <ConfirmDialog
        open={Boolean(deletion.target)}
        title="Delete expense?"
        message={
          <p>
            <strong>{expense.title}</strong> for {formatMoney(expense.amount)} will be removed from your planner for
            good.
          </p>
        }
        confirmLabel="Delete expense"
        loading={deletion.deleting}
        onCancel={deletion.cancel}
        onConfirm={deletion.confirm}
      />
    </>
  );
}