import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "../components/ui/PageHeader";
import { MonthTag } from "../components/ui/MonthTag";
import { Sheet } from "../components/ui/Sheet";
import { ErrorNote, LoadingLines, StatusPill } from "../components/ui/Bits";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { BudgetMeter } from "../components/budget/BudgetMeter";
import { BudgetEditor } from "../components/budget/BudgetEditor";
import { BudgetHistoryChart } from "../components/charts/BudgetHistoryChart";
import { MonthNotes } from "../components/notes/MonthNotes";
import { useMonthParam } from "../hooks/useMonthParam";
import { useRemote } from "../hooks/useRemote";
import { budgetApi } from "../api/services";
import { errorMessage } from "../api/client";
import { formatMoney, monthLabel, monthName, shiftMonth } from "../utils/format";

export function BudgetPage() {
  const location = useLocation();
  const [month, setMonth] = useMonthParam();
  const current = useRemote(() => budgetApi.get(month), month);
  const previous = useRemote(() => budgetApi.get(shiftMonth(month, -1)), month);
  const history = useRemote(() => budgetApi.history(6), "history");
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const firstVisit = (location.state as { firstVisit?: boolean } | null)?.firstVisit;

  const budget = current.data?.budget ?? null;

  const refreshAll = () => {
    current.reload();
    history.reload();
  };

  const clearBudget = async () => {
    setClearing(true);
    try {
      await budgetApi.remove(month);
      toast.success(`Budget for ${monthLabel(month)} removed`);
      setConfirmClear(false);
      refreshAll();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Budget"
        subtitle="Decide what this month can carry, then let Retain tell you when you are getting close."
        aside={<MonthTag month={month} onChange={setMonth} />}
      />

      {firstVisit && (
        <p className="welcome-note">
          Welcome to Retain. Start by setting a budget for {monthName(month)}, then add your expenses as they happen.
        </p>
      )}

      <div className="budget-grid">
        <Sheet title={`${monthName(month)} Budget`} caption={monthLabel(month)}>
          {current.error && <ErrorNote message={current.error} onRetry={current.reload} />}
          {!budget && current.loading && <LoadingLines rows={4} />}
          {budget && (
            <div className="budget-panel">
              <dl className="budget-figures">
                <div>
                  <dt>Budget</dt>
                  <dd className="num">{budget.amount === null ? "Not set" : formatMoney(budget.amount)}</dd>
                </div>
                <div>
                  <dt>Spent</dt>
                  <dd className="num">{formatMoney(budget.spent)}</dd>
                </div>
                <div>
                  <dt>Remaining</dt>
                  <dd className={`num ${budget.remaining !== null && budget.remaining < 0 ? "is-negative" : ""}`}>
                    {budget.remaining === null ? "Not set" : formatMoney(budget.remaining)}
                  </dd>
                </div>
              </dl>
              <BudgetMeter budget={budget} size="lg" />
              <BudgetEditor
                key={`${month}-${budget.amount ?? "none"}`}
                month={month}
                current={budget}
                suggestion={budget.amount === null ? previous.data?.budget.amount : null}
                onSaved={refreshAll}
              />
              {budget.amount !== null && (
                <button type="button" className="link-btn budget-panel__clear" onClick={() => setConfirmClear(true)}>
                  Remove this month's budget
                </button>
              )}
            </div>
          )}
        </Sheet>

        <Sheet title="How You Did" caption="Budgeted against actual spending. Tap a month to open it.">
          {history.error && <ErrorNote message={history.error} onRetry={history.reload} />}
          {!history.data && history.loading && <LoadingLines rows={6} />}
          {history.data && (
            <BudgetHistoryChart history={history.data.history} activeMonth={month} onSelect={setMonth} />
          )}
        </Sheet>
      </div>

      <MonthNotes month={month} />
      
      {history.data && (
        <Sheet title="Month by Month" flush className="budget-history">
          <div className="ledger-wrap">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="is-number">Budgeted</th>
                  <th className="is-number">Actual</th>
                  <th className="is-number">Difference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...history.data.history].reverse().map((entry) => (
                  <tr
                    key={entry.month}
                    className={`is-clickable ${entry.month === month ? "is-selected" : ""}`}
                    onClick={() => setMonth(entry.month)}
                  >
                    <td data-label="Month">{monthLabel(entry.month)}</td>
                    <td data-label="Budgeted" className="is-number">
                      {entry.amount === null ? "Not set" : formatMoney(entry.amount)}
                    </td>
                    <td data-label="Actual" className="is-number">
                      {formatMoney(entry.spent)}
                    </td>
                    <td
                      data-label="Difference"
                      className={`is-number ${entry.remaining !== null && entry.remaining < 0 ? "is-negative" : ""}`}
                    >
                      {entry.remaining === null ? "Not set" : formatMoney(entry.remaining)}
                    </td>
                    <td data-label="Status">
                      <StatusPill status={entry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Sheet>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Remove budget?"
        message={<p>Your expenses stay. Only the budget amount for {monthLabel(month)} is removed.</p>}
        confirmLabel="Remove budget"
        loading={clearing}
        onCancel={() => setConfirmClear(false)}
        onConfirm={clearBudget}
      />
    </>
  );
}