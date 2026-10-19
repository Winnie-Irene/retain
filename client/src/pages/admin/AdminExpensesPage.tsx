import { TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { MonthTag } from "../../components/ui/MonthTag";
import { Sheet } from "../../components/ui/Sheet";
import { EmptyState, ErrorNote, LoadingLines } from "../../components/ui/Bits";
import { CategoryDonut } from "../../components/charts/CategoryDonut";
import { MeterBars } from "../../components/charts/MeterBars";
import { DailyBars } from "../../components/charts/DailyBars";
import { useMonthParam } from "../../hooks/useMonthParam";
import { useRemote } from "../../hooks/useRemote";
import { adminApi } from "../../api/services";
import { formatMoney, formatNumber, monthName } from "../../utils/format";

const methodColors = ["var(--sage)", "var(--olive)", "var(--blush-deep)", "var(--slate)"];

export function AdminExpensesPage() {
  const [month, setMonth] = useMonthParam();
  const { data, loading, error, reload } = useRemote(() => adminApi.expenses(month), `admin-expenses-${month}`);

  return (
    <>
      <PageHeader
        title="Platform Spending"
        subtitle={`How everyone on Retain spent their money in ${monthName(month)}. Totals only, never one person's list.`}
        aside={<MonthTag month={month} onChange={setMonth} allowFuture={false} />}
      />

      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && loading && (
        <Sheet>
          <LoadingLines rows={6} />
        </Sheet>
      )}

      {data && (
        <div className={`dash ${loading ? "is-refreshing" : ""}`}>
          <section className="figures" aria-label="Spending at a glance">
            <div className="figure">
              <span className="figure__label">Total recorded</span>
              <strong className="figure__value num">{formatMoney(data.totalSpent)}</strong>
              <span className="figure__meta">
                {data.changeFromPrevious === null ? (
                  "No data for last month"
                ) : (
                  <span className={`trend ${data.changeFromPrevious > 0 ? "trend--up" : "trend--down"}`}>
                    {data.changeFromPrevious > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(Math.round(data.changeFromPrevious))}% vs last month
                  </span>
                )}
              </span>
            </div>
            <div className="figure">
              <span className="figure__label">Expenses recorded</span>
              <strong className="figure__value num">{formatNumber(data.expenseCount)}</strong>
              <span className="figure__meta num">about {formatMoney(data.averageExpense)} each</span>
            </div>
            <div className="figure">
              <span className="figure__label">Active spenders</span>
              <strong className="figure__value num">{formatNumber(data.activeSpenders)}</strong>
              <span className="figure__meta">recorded at least one expense</span>
            </div>
            <div className="figure">
              <span className="figure__label">Per active user</span>
              <strong className="figure__value num">{formatMoney(data.averagePerSpender)}</strong>
              <span className="figure__meta">average for the month</span>
            </div>
          </section>

          {data.expenseCount === 0 ? (
            <Sheet>
              <EmptyState title="A quiet month" message={`Nobody recorded an expense in ${monthName(month)}.`} />
            </Sheet>
          ) : (
            <div className="summary-grid">
              <Sheet title="By Category" caption="Where the money went across the platform" className="span-7">
                <CategoryDonut data={data.byCategory} total={data.totalSpent} caption="recorded" />
              </Sheet>

              <Sheet title="Paid With" caption="How people paid" className="span-5">
                <MeterBars
                  items={data.byPaymentMethod.map((method, index) => ({
                    key: method.method,
                    label: method.label,
                    value: method.total,
                    color: methodColors[index % methodColors.length],
                    meta: `${method.count}x`,
                  }))}
                />
                <div className="kind-split">
                  <p className="kind-split__title">Fixed and variable</p>
                  <div className="kind-split__bar" aria-hidden="true">
                    <span
                      className="kind-split__fixed"
                      style={{ width: `${(data.byKind.fixed.total / data.totalSpent) * 100}%` }}
                    />
                    <span
                      className="kind-split__variable"
                      style={{ width: `${(data.byKind.variable.total / data.totalSpent) * 100}%` }}
                    />
                  </div>
                  <div className="kind-split__legend">
                    {(["fixed", "variable"] as const).map((kind) => (
                      <div key={kind} className="kind-split__item">
                        <span className={`kind-split__dot kind-split__dot--${kind}`} aria-hidden="true" />
                        <span>{kind === "fixed" ? "Fixed" : "Variable"}</span>
                        <strong className="num">{formatMoney(data.byKind[kind].total)}</strong>
                        <small className="num">{data.byKind[kind].count}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </Sheet>

              <Sheet title="Through the Month" caption="Value recorded on each day" className="span-7">
                <DailyBars data={data.daily} month={month} />
              </Sheet>

              <Sheet title="Busiest Days" caption="Which days of the week people spend the most" className="span-5">
                <MeterBars
                  items={data.byWeekday.map((day) => ({
                    key: day.day,
                    label: day.day,
                    value: day.total,
                    color: "var(--blush-deep)",
                    meta: `${day.count}x`,
                  }))}
                />
              </Sheet>
            </div>
          )}
        </div>
      )}
    </>
  );
}