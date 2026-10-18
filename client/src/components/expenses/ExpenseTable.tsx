import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CategoryTag } from "../ui/Bits";
import { IconButton } from "../ui/Button";
import { formatDate, formatMoney } from "../../utils/format";
import { PAYMENT_LABELS } from "../../utils/constants";
import type { Expense, SortField, SortOrder } from "../../types/models";

interface ExpenseTableProps {
  expenses: Expense[];
  sortBy?: SortField;
  order?: SortOrder;
  onSort?: (field: SortField) => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  totalAmount?: number;
  compact?: boolean;
}

function SortHeader({
  field,
  label,
  sortBy,
  order,
  onSort,
  align = "left",
}: {
  field: SortField;
  label: string;
  sortBy?: SortField;
  order?: SortOrder;
  onSort?: (field: SortField) => void;
  align?: "left" | "right";
}) {
  if (!onSort) return <th className={align === "right" ? "is-number" : undefined}>{label}</th>;
  const active = sortBy === field;
  const Icon = !active ? ArrowUpDown : order === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      className={align === "right" ? "is-number" : undefined}
      aria-sort={active ? (order === "asc" ? "ascending" : "descending") : "none"}
    >
      <button type="button" className={`ledger__sort ${active ? "is-active" : ""}`} onClick={() => onSort(field)}>
        {label}
        <Icon size={14} />
      </button>
    </th>
  );
}

export function ExpenseTable({
  expenses,
  sortBy,
  order,
  onSort,
  onEdit,
  onDelete,
  totalAmount,
  compact = false,
}: ExpenseTableProps) {
  const navigate = useNavigate();
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <div className="ledger-wrap">
      <table className={`ledger ledger--expenses ${compact ? "ledger--compact" : ""}`}>
        <thead>
          <tr>
            <SortHeader field="date" label="Date" sortBy={sortBy} order={order} onSort={onSort} />
            <SortHeader field="title" label="Expense" sortBy={sortBy} order={order} onSort={onSort} />
            <th>Category</th>
            {!compact && <th>Paid with</th>}
            <SortHeader field="amount" label="Amount" sortBy={sortBy} order={order} onSort={onSort} align="right" />
            {hasActions && (
              <th className="ledger__actions-head">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="is-clickable"
              onClick={() => navigate(`/expenses/${expense.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.target === event.currentTarget) navigate(`/expenses/${expense.id}`);
              }}
              tabIndex={0}
            >
              <td data-label="Date" className="num ledger__date">
                {formatDate(expense.date)}
              </td>
              <td data-label="Expense" className="ledger__title">
                <span>{expense.title}</span>
                {!compact && expense.notes && <small>{expense.notes}</small>}
              </td>
              <td data-label="Category">
                <CategoryTag category={expense.category} />
              </td>
              {!compact && (
                <td data-label="Paid with">
                  <span className="method-chip">{PAYMENT_LABELS[expense.paymentMethod]}</span>
                </td>
              )}
              <td data-label="Amount" className="is-number ledger__amount">
                {formatMoney(expense.amount)}
              </td>
              {hasActions && (
                <td className="ledger__actions" onClick={(event) => event.stopPropagation()}>
                  {onEdit && (
                    <IconButton label={`Edit ${expense.title}`} onClick={() => onEdit(expense)}>
                      <Pencil size={16} />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton label={`Delete ${expense.title}`} tone="danger" onClick={() => onDelete(expense)}>
                      <Trash2 size={16} />
                    </IconButton>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {totalAmount !== undefined && (
          <tfoot>
            <tr>
              <td colSpan={compact ? 3 : 4}>Total for these filters</td>
              <td className="is-number">{formatMoney(totalAmount)}</td>
              {hasActions && <td />}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}