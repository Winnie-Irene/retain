import { useEffect } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { Sheet } from "../components/ui/Sheet";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorNote, LoadingLines } from "../components/ui/Bits";
import { Pagination } from "../components/ui/Pagination";
import { ExpenseTable } from "../components/expenses/ExpenseTable";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchExpenses } from "../store/expensesSlice";
import { resetFilters, setLimit, setPage, toggleSortField } from "../store/filtersSlice";
import { selectActiveFilterCount, selectExpenses, selectFilters } from "../store/selectors";
import { formatMoney, formatNumber } from "../utils/format";

export function ExpensesPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const { items, pagination, totalAmount, status, error } = useAppSelector(selectExpenses);
  const activeCount = useAppSelector(selectActiveFilterCount);

  useEffect(() => {
    const request = dispatch(fetchExpenses());
    return () => request.abort();
  }, [dispatch, filters]);

  const refresh = () => {
    dispatch(fetchExpenses());
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
              {activeCount > 0 ? " match your filters, adding up to " : " recorded, adding up to "}
              <strong className="num">{formatMoney(totalAmount)}</strong>.
            </>
          ) : (
            "Every franc you record lands here."
          )
        }
      />

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
                : "You have not recorded any expenses yet."
            }
            action={
              activeCount > 0 && (
                <Button variant="soft" onClick={() => dispatch(resetFilters())}>
                  Clear filters
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
    </>
  );
}