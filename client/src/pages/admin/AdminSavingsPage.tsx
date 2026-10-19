import { PageHeader } from "../../components/ui/PageHeader";
import { Sheet } from "../../components/ui/Sheet";
import { EmptyState, ErrorNote, LoadingLines } from "../../components/ui/Bits";
import { MeterBars } from "../../components/charts/MeterBars";
import { ProgressRing } from "../../components/savings/ProgressRing";
import { useRemote } from "../../hooks/useRemote";
import { adminApi } from "../../api/services";
import { formatMoney, formatNumber } from "../../utils/format";

const progressColors = ["var(--blush)", "var(--blush-deep)", "var(--olive)", "var(--sage)", "var(--terracotta)"];

export function AdminSavingsPage() {
  const { data, loading, error, reload } = useRemote(() => adminApi.savings(), "admin-savings");

  return (
    <>
      <PageHeader
        title="Platform Savings"
        subtitle="What members are saving towards and how close they are. Retain only records it, no real money moves."
      />

      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && loading && (
        <Sheet>
          <LoadingLines rows={6} />
        </Sheet>
      )}

      {data && data.goals === 0 && (
        <Sheet>
          <EmptyState title="No goals yet" message="Nobody has created a savings goal so far." />
        </Sheet>
      )}

      {data && data.goals > 0 && (
        <div className={`dash ${loading ? "is-refreshing" : ""}`}>
          <section className="figures" aria-label="Savings at a glance">
            <div className="figure">
              <span className="figure__label">Savings goals</span>
              <strong className="figure__value num">{formatNumber(data.goals)}</strong>
              <span className="figure__meta num">
                from {formatNumber(data.savers)} {data.savers === 1 ? "member" : "members"}
              </span>
            </div>
            <div className="figure">
              <span className="figure__label">Total saved</span>
              <strong className="figure__value num">{formatMoney(data.totalSaved)}</strong>
              <span className="figure__meta num">of {formatMoney(data.totalTarget)} targeted</span>
            </div>
            <div className="figure">
              <span className="figure__label">Goals reached</span>
              <strong className="figure__value num">{formatNumber(data.completed)}</strong>
              <span className="figure__meta num">{formatNumber(data.overdue)} past their date</span>
            </div>
            <div className="figure">
              <span className="figure__label">Added this month</span>
              <strong className="figure__value num">{formatMoney(data.addedThisMonth)}</strong>
              <span className="figure__meta">across every goal</span>
            </div>
          </section>

          <div className="summary-grid">
            <Sheet title="Overall Progress" caption="Average progress across all goals" className="span-4">
              <div className="savings-overall">
                <ProgressRing
                  percent={data.averageProgress}
                  color="var(--sage)"
                  size={150}
                  stroke={13}
                  label="average"
                />
                <p className="muted">
                  {formatNumber(data.withDeadline)} of {formatNumber(data.goals)} goals have a target date.
                </p>
              </div>
            </Sheet>

            <Sheet title="How Far Along" caption="Goals grouped by progress" className="span-4">
              <MeterBars
                items={data.progress.map((bucket, index) => ({
                  key: bucket.label,
                  label: bucket.label,
                  value: bucket.count,
                  color: progressColors[index],
                }))}
                valueFormatter={(value) => `${formatNumber(value)} ${value === 1 ? "goal" : "goals"}`}
              />
            </Sheet>

            <Sheet title="Saving For" caption="The most common goals" className="span-4">
              <MeterBars
                items={data.popular.map((goal) => ({
                  key: goal.name,
                  label: goal.name,
                  value: goal.count,
                  color: "var(--olive)",
                  meta: formatMoney(goal.saved, "RWF", true),
                }))}
                valueFormatter={(value) => `${formatNumber(value)} ${value === 1 ? "goal" : "goals"}`}
              />
            </Sheet>
          </div>
        </div>
      )}
    </>
  );
}