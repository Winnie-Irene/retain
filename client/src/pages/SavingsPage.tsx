import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../components/ui/PageHeader";
import { Sheet } from "../components/ui/Sheet";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorNote, LoadingLines } from "../components/ui/Bits";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { GoalCard } from "../components/savings/GoalCard";
import { GoalFormModal } from "../components/savings/GoalFormModal";
import { ContributionModal, type ContributionMode } from "../components/savings/ContributionModal";
import { useRemote } from "../hooks/useRemote";
import { savingsApi } from "../api/services";
import { errorMessage } from "../api/client";
import { formatMoney } from "../utils/format";
import type { SavingsGoal } from "../types/models";

function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso),
  );
}

export function SavingsPage() {
  const { data, loading, error, reload } = useRemote(() => savingsApi.list(), "savings");
  const [editing, setEditing] = useState<SavingsGoal | null | undefined>(undefined);
  const [moving, setMoving] = useState<{ goal: SavingsGoal; mode: ContributionMode } | null>(null);
  const [deleting, setDeleting] = useState<SavingsGoal | null>(null);
  const [removing, setRemoving] = useState(false);

  const goals = data?.goals ?? [];
  const summary = data?.summary;
  const overall = summary && summary.totalTarget > 0 ? Math.round((summary.totalSaved / summary.totalTarget) * 100) : 0;

  const confirmDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await savingsApi.remove(deleting.id);
      toast.success(`Deleted ${deleting.name}`);
      setDeleting(null);
      reload();
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      setRemoving(false);
    }
  };

  const removeEntry = async (goal: SavingsGoal, contributionId: string) => {
    try {
      await savingsApi.removeContribution(goal.id, contributionId);
      toast.success("Entry removed");
      reload();
    } catch (caught) {
      toast.error(errorMessage(caught));
    }
  };

  return (
    <>
      <PageHeader
        title="Savings"
        subtitle="Put a little aside for the things that matter and watch each jar fill up. Retain keeps the record, your money stays wherever you keep it."
        aside={
          <Button icon={<Plus size={18} />} onClick={() => setEditing(null)}>
            New goal
          </Button>
        }
      />

      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && loading && (
        <Sheet>
          <LoadingLines rows={6} />
        </Sheet>
      )}

      {data && summary && (
        <div className={loading ? "is-refreshing" : undefined}>
          <section className="figures" aria-label="Savings at a glance">
            <div className="figure">
              <span className="figure__label">Total saved</span>
              <strong className="figure__value num">{formatMoney(summary.totalSaved)}</strong>
              <span className="figure__meta num">{overall}% of all your targets</span>
            </div>
            <div className="figure">
              <span className="figure__label">All targets</span>
              <strong className="figure__value num">{formatMoney(summary.totalTarget)}</strong>
              <span className="figure__meta num">
                across {summary.count} goal{summary.count === 1 ? "" : "s"}
              </span>
            </div>
            <div className="figure">
              <span className="figure__label">Goals reached</span>
              <strong className="figure__value num">
                {summary.completed} of {summary.count}
              </strong>
              <span className="figure__meta">
                {summary.completed > 0 ? "Proud of you" : "The first one is closest"}
              </span>
            </div>
            <div className="figure">
              <span className="figure__label">Next deadline</span>
              <strong className="figure__value">
                {summary.nextDeadline?.date ? shortDate(summary.nextDeadline.date) : "None set"}
              </strong>
              <span className="figure__meta">{summary.nextDeadline?.name ?? "Add a date to any goal"}</span>
            </div>
          </section>

          {goals.length === 0 ? (
            <Sheet>
              <EmptyState
                title="No goals yet"
                message="A laptop, a trip, a cushion for rainy days. Name it, give it a number, and start filling it up."
                action={
                  <Button icon={<Plus size={18} />} onClick={() => setEditing(null)}>
                    Create your first goal
                  </Button>
                }
              />
            </Sheet>
          ) : (
            <div className="goals-grid">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onAdd={() => setMoving({ goal, mode: "add" })}
                  onWithdraw={() => setMoving({ goal, mode: "withdraw" })}
                  onEdit={() => setEditing(goal)}
                  onDelete={() => setDeleting(goal)}
                  onRemoveEntry={(contributionId) => void removeEntry(goal, contributionId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {editing !== undefined && <GoalFormModal goal={editing} onClose={() => setEditing(undefined)} onSaved={reload} />}

      {moving && (
        <ContributionModal goal={moving.goal} mode={moving.mode} onClose={() => setMoving(null)} onSaved={reload} />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete goal?"
        message={
          deleting && (
            <p>
              <strong>{deleting.name}</strong> and its history of {formatMoney(deleting.saved)} saved will be removed.
              This only clears the record in Retain, not any real money.
            </p>
          )
        }
        confirmLabel="Delete goal"
        loading={removing}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}