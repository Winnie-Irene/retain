import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Sheet } from "../components/ui/Sheet";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorNote, LoadingLines } from "../components/ui/Bits";
import { Pagination } from "../components/ui/Pagination";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ExpenseFilters } from "../components/expenses/ExpenseFilters";
import { ExpenseTable } from "../components/expenses/ExpenseTable";
import { ExpenseFormModal } from "../components/expenses/ExpenseFormModal";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchExpenses } from "../store/expensesSlice";
import { resetFilters, setLimit, setPage, toggleSortField } from "../store/filtersSlice";
import { selectActiveFilterCount, selectExpenses, selectFilters } from "../store/selectors";
import { useDeleteExpense } from "../hooks/useDeleteExpense";
import { formatMoney, formatNumber } from "../utils/format";
import type { Expense } from "../types/models";

export function ExpensesPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const { items, pagination, totalAmount, status, error } = useAppSelector(selectExpenses);
  const activeCount = useAppSelector(selectActiveFilterCount);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  useEffect(() => {
    const request = dispatch(fetchExpenses());
    return () => request.abort();
  }, [dispatch, filters]);

  const refresh = () => {
    dispatch(fetchExpenses());
  };

  const deletion = useDeleteExpense(() => {
    if (items.length === 1 && filters.page > 1) dispatch(setPage(filters.page - 1));
    else refresh();
  });

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setFormOpen(true);
  };

  const firstLoad = status === "loading" && items.length === 0;

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle={
          status === "succeeded" || items.length > 0 ? (
            <>
              <span className="num">{formatNumber(pagination.total)}</span>{" "}
              {pagination.total === 1 ? "expense" : "expenses"}
              {activeCount > 0
                ? `${pagination.total === 1 ? " matches" : " match"} your filters, adding up to `
                : " recorded, adding up to "}
              <strong className="num">{formatMoney(totalAmount)}</strong>.
            </>
          ) : (
            "Every franc you record lands here."
          )
        }
        aside={
          <Button icon={<Plus size={18} />} onClick={openNew}>
            Add expense
          </Button>
        }
      />

      <ExpenseFilters />

      <Sheet flush className={status === "loading" && items.length > 0 ? "is-refreshing" : undefined}>
        {error && (
          <div className="sheet__notice">
            <ErrorNote message={error} onRetry={refresh} />
          </div>
        )}

        {firstLoad && (
          <div className="sheet__notice">
            <LoadingLines rows={6} />
          </div>
        )}

        {status === "succeeded" && items.length === 0 && (
          <EmptyState
            title={activeCount > 0 ? "Nothing matches" : "A blank page"}
            message={
              activeCount > 0
                ? "No expenses fit these filters. Loosen one or clear them to see everything again."
                : "You have not recorded any expenses yet. Add the first one and your planner starts filling in."
            }
            action={
              activeCount > 0 ? (
                <Button variant="soft" onClick={() => dispatch(resetFilters())}>
                  Clear filters
                </Button>
              ) : (
                <Button icon={<Plus size={18} />} onClick={openNew}>
                  Add your first expense
                </Button>
              )
            }
          />
        )}

        {items.length > 0 && (
          <>
            <ExpenseTable
              expenses={items}
              sortBy={filters.sortBy}
              order={filters.order}
              onSort={(field) => dispatch(toggleSortField(field))}
              onEdit={openEdit}
              onDelete={deletion.request}
            />
            <Pagination
              pagination={pagination}
              onPageChange={(page) => dispatch(setPage(page))}
              limit={filters.limit}
              onLimitChange={(limit) => dispatch(setLimit(limit))}
            />
          </>
        )}
      </Sheet>

      <ExpenseFormModal open={formOpen} expense={editing} onClose={() => setFormOpen(false)} onSaved={refresh} />

      <ConfirmDialog
        open={Boolean(deletion.target)}
        title="Delete expense?"
        message={
          deletion.target && (
            <p>
              <strong>{deletion.target.title}</strong> for {formatMoney(deletion.target.amount)} will be removed from
              your planner for good.
            </p>
          )
        }
        confirmLabel="Delete expense"
        loading={deletion.deleting}
        onCancel={deletion.cancel}
        onConfirm={deletion.confirm}
      />
    </>
  );
}