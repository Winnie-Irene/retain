import { PageHeader } from "../../components/ui/PageHeader";
import { MonthTag } from "../../components/ui/MonthTag";
import { Sheet } from "../../components/ui/Sheet";
import { ErrorNote, LoadingLines } from "../../components/ui/Bits";
import { MeterBars } from "../../components/charts/MeterBars";
import { BudgetStatusChart } from "../../components/charts/BudgetStatusChart";
import { useMonthParam } from "../../hooks/useMonthParam";
import { useRemote } from "../../hooks/useRemote";
import { adminApi } from "../../api/services";
import { formatMoney, formatNumber, monthName } from "../../utils/format";

export function AdminBudgetsPage() {
  const [month, setMonth] = useMonthParam();
  const { data, loading, error, reload } = useRemote(() => adminApi.budgets(month), `admin-budgets-${month}`);

  const share = (value: number) => (data && data.members > 0 ? Math.round((value / data.members) * 100) : 0);

  return (
    <>
      <PageHeader
        title="Platform Budgets"
        subtitle={`How members are doing against their own budgets in ${monthName(month)}.`}
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
          <section className="figures" aria-label="Budgets at a glance">
            <div className="figure">
              <span className="figure__label">Members with a budget</span>
              <strong className="figure__value num">
                {formatNumber(data.withBudget)} of {formatNumber(data.members)}
              </strong>
              <span className="figure__meta num">{share(data.withBudget)}% of members</span>
            </div>
            <div className="figure">
              <span className="figure__label">Average budget</span>
              <strong className="figure__value num">{formatMoney(data.averageBudget)}</strong>
              <span className="figure__meta num">{formatMoney(data.totalBudgeted)} in total</span>
            </div>
            <div className="figure">
              <span className="figure__label">Average used</span>
              <strong className="figure__value num">{Math.round(data.averagePercentUsed)}%</strong>
              <span className="figure__meta">of each member's own budget</span>
            </div>
            <div className="figure">
              <span className="figure__label">Over budget</span>
              <strong className={`figure__value num ${data.statusCounts.over > 0 ? "is-negative" : ""}`}>
                {formatNumber(data.statusCounts.over)}
              </strong>
              <span className="figure__meta">past their own plan</span>
            </div>
          </section>

          <div className="summary-grid">
            <Sheet title="Where Everyone Stands" caption={`Budget status for ${monthName(month)}`} className="span-5">
              <MeterBars
                items={[
                  { key: "within", label: "Within budget", value: data.statusCounts.within, color: "var(--sage)" },
                  {
                    key: "approaching",
                    label: "Approaching budget",
                    value: data.statusCounts.approaching,
                    color: "var(--amber)",
                  },
                  { key: "over", label: "Over budget", value: data.statusCounts.over, color: "var(--danger)" },
                  { key: "unset", label: "No budget set", value: data.withoutBudget, color: "var(--rule-strong)" },
                ]}
                valueFormatter={(value) => `${formatNumber(value)} ${value === 1 ? "member" : "members"}`}
              />
              <p className="dash-note">
                Members spent <strong className="num">{formatMoney(data.totalSpentAgainstBudgets)}</strong> against{" "}
                <strong className="num">{formatMoney(data.totalBudgeted)}</strong> of planned budgets. Each status
                follows the member's own warning level.
              </p>
            </Sheet>

            <Sheet title="Six Months of Budgets" caption="Members with a budget, by status" className="span-7">
              <BudgetStatusChart history={data.history} />
            </Sheet>
          </div>
        </div>
      )}
    </>
  );
}