import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { MonthTag } from "../components/ui/MonthTag";
import { Sheet } from "../components/ui/Sheet";
import { Button } from "../components/ui/Button";
import { CategoryTag, EmptyState, ErrorNote, LoadingLines } from "../components/ui/Bits";
import { BudgetMeter } from "../components/budget/BudgetMeter";
import { CategoryDonut } from "../components/charts/CategoryDonut";
import { PaceChart } from "../components/charts/PaceChart";
import { MeterBars } from "../components/charts/MeterBars";
import { ExpenseTable } from "../components/expenses/ExpenseTable";
import { ExpenseFormModal } from "../components/expenses/ExpenseFormModal";
import { useAuth } from "../hooks/useAuth";
import { useMonthParam } from "../hooks/useMonthParam";
import { useRemote } from "../hooks/useRemote";
import { dashboardApi } from "../api/services";
import { useAppDispatch } from "../store";
import { applyQuickFilter } from "../store/filtersSlice";
import { currentMonthKey, formatDate, formatMoney, monthBounds, monthName } from "../utils/format";

function daysLeft(month: string): number {
  const [year, monthIndex] = month.split("-").map(Number);
  const last = new Date(year, monthIndex, 0).getDate();
  return Math.max(1, last - new Date().getDate() + 1);
}

const methodColors = ["var(--sage)", "var(--olive)", "var(--blush-deep)", "var(--slate)"];

export function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [month, setMonth] = useMonthParam();
  const [formOpen, setFormOpen] = useState(false);
  const { data, loading, error, reload } = useRemote(() => dashboardApi.get(month), month);
  const denied = (location.state as { denied?: boolean } | null)?.denied;

  const firstName = user?.name.split(" ")[0] ?? "there";
  const isCurrent = month === currentMonthKey();

  const openCategory = (categoryId: string) => {
    const { start, end } = monthBounds(month);
    dispatch(applyQuickFilter({ categories: [categoryId], startDate: start, endDate: end }));
    navigate("/expenses");
  };

  const openMonth = () => {
    const { start, end } = monthBounds(month);
    dispatch(applyQuickFilter({ startDate: start, endDate: end }));
    navigate("/expenses");
  };

  return (
    <>
      <PageHeader
        title="Monthly Budget"
        subtitle={
          isCurrent
            ? `Hi ${firstName}, here is how ${monthName(month)} is going so far.`
            : `Hi ${firstName}, this is how ${monthName(month)} turned out.`
        }
        actions={
          <Button icon={<Plus size={18} />} onClick={() => setFormOpen(true)}>
            Add expense
          </Button>
        }
        aside={<MonthTag month={month} onChange={setMonth} allowFuture={false} />}
      />

      {denied && (
        <p className="form-alert page-alert">That area is only for admins, so we brought you back to your planner.</p>
      )}

      {error && <ErrorNote message={error} onRetry={reload} />}

      {!data && loading && (
        <div className="dash-grid">
          <Sheet title="Budget Totals">
            <LoadingLines rows={4} />
          </Sheet>
          <Sheet title="Where You Spent">
            <LoadingLines rows={6} />
          </Sheet>
        </div>
      )}

      {data && (
        <div className={`dash ${loading ? "is-refreshing" : ""}`}>
          <section className="figures" aria-label="Month at a glance">
            <div className="figure">
              <span className="figure__label">Total spent</span>
              <strong className="figure__value num">{formatMoney(data.totalSpent)}</strong>
              <span className="figure__meta">
                {data.changeFromPrevious === null ? (
                  `${data.expenseCount} expenses`
                ) : (
                  <span className={`trend ${data.changeFromPrevious > 0 ? "trend--up" : "trend--down"}`}>
                    {data.changeFromPrevious > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(Math.round(data.changeFromPrevious))}% vs last month
                  </span>
                )}
              </span>
            </div>
            <div className="figure">
              <span className="figure__label">Remaining budget</span>
              <strong
                className={`figure__value num ${data.budget.remaining !== null && data.budget.remaining < 0 ? "is-negative" : ""}`}
              >
                {data.budget.remaining === null ? "Not set" : formatMoney(data.budget.remaining)}
              </strong>
              <span className="figure__meta">
                {data.budget.amount === null ? (
                  <Link to={`/budget${month === currentMonthKey() ? "" : `?month=${month}`}`}>Set a budget</Link>
                ) : (
                  `of ${formatMoney(data.budget.amount)}`
                )}
              </span>
            </div>
            <div className="figure">
              <span className="figure__label">Highest expense</span>
              {data.highestExpense ? (
                <>
                  <strong className="figure__value num">{formatMoney(data.highestExpense.amount)}</strong>
                  <Link to={`/expenses/${data.highestExpense.id}`} className="figure__meta figure__link">
                    {data.highestExpense.title}, {formatDate(data.highestExpense.date)}
                  </Link>
                </>
              ) : (
                <>
                  <strong className="figure__value">None yet</strong>
                  <span className="figure__meta">Nothing recorded</span>
                </>
              )}
            </div>
            <div className="figure">
              <span className="figure__label">Expenses recorded</span>
              <strong className="figure__value num">{data.expenseCount}</strong>
              <span className="figure__meta num">about {formatMoney(data.averageExpense)} each</span>
            </div>
          </section>

          <div className="dash-grid">
            <Sheet title="Budget Totals" caption={`For ${monthName(month)}`} className="dash-grid__budget">
              <BudgetMeter budget={data.budget} />
              <table className="ledger ledger--totals">
                <thead>
                  <tr>
                    <th>Total</th>
                    <th className="is-number">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Budgeted</td>
                    <td className="is-number">
                      {data.budget.amount === null ? "Not set" : formatMoney(data.budget.amount)}
                    </td>
                  </tr>
                  <tr>
                    <td>Spent</td>
                    <td className="is-number">{formatMoney(data.totalSpent)}</td>
                  </tr>
                  <tr>
                    <td>Remaining</td>
                    <td className="is-number">
                      {data.budget.remaining === null ? "Not set" : formatMoney(data.budget.remaining)}
                    </td>
                  </tr>
                  {isCurrent && data.budget.remaining !== null && data.budget.remaining > 0 && (
                    <tr>
                      <td>Safe to spend per day</td>
                      <td className="is-number">{formatMoney(Math.floor(data.budget.remaining / daysLeft(month)))}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Sheet>

            <Sheet
              title="How You're Pacing"
              caption="What you have spent so far against a steady daily pace"
              className="dash-grid__pace"
            >
              {data.expenseCount === 0 ? (
                <EmptyState title="Quiet month" message="No expenses recorded for this month yet." />
              ) : (
                <PaceChart daily={data.daily} budget={data.budget.amount} month={month} />
              )}
            </Sheet>

            <Sheet
              title="Where You Spent"
              caption={data.byCategory.length > 0 ? "Tap a category to see its expenses" : undefined}
              className="dash-grid__donut"
            >
              {data.byCategory.length === 0 ? (
                <EmptyState title="Nothing here yet" message="Your category split shows up once you add expenses." />
              ) : (
                <CategoryDonut data={data.byCategory} total={data.totalSpent} onSelect={openCategory} />
              )}
            </Sheet>

            <Sheet title="Paid With" className="dash-grid__methods">
              {data.byPaymentMethod.length === 0 ? (
                <p className="muted">No payments recorded yet.</p>
              ) : (
                <MeterBars
                  items={data.byPaymentMethod.map((method, index) => ({
                    key: method.method,
                    label: method.label,
                    value: method.total,
                    color: methodColors[index % methodColors.length],
                    meta: `${method.count}x`,
                  }))}
                />
              )}
              {data.byCategory[0] && (
                <p className="dash-note">
                  Most of your money went to <CategoryTag category={data.byCategory[0].category} /> this month, about{" "}
                  <strong className="num">{Math.round(data.byCategory[0].share)}%</strong> of everything.
                </p>
              )}
            </Sheet>
            <Sheet
              title="Recent Expenses"
              flush
              className="dash-grid__recent"
              actions={
                data.recentExpenses.length > 0 && (
                  <button type="button" className="link-btn" onClick={openMonth}>
                    See all for {monthName(month)}
                  </button>
                )
              }
            >
              {data.recentExpenses.length === 0 ? (
                <EmptyState title="A blank page" message="Expenses you add this month will show up here." />
              ) : (
                <ExpenseTable expenses={data.recentExpenses} compact />
              )}
            </Sheet>
          </div>
        </div>
      )}

      <ExpenseFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={reload} />
    </>
  );
}