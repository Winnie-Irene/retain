import { useState } from "react";
import { ChevronDown, Minus, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button, IconButton } from "../ui/Button";
import { ProgressRing } from "./ProgressRing";
import { formatDate, formatMoney } from "../../utils/format";
import type { SavingsGoal } from "../../types/models";

interface GoalCardProps {
  goal: SavingsGoal;
  onAdd: () => void;
  onWithdraw: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRemoveEntry: (contributionId: string) => void;
}

function statusLine(goal: SavingsGoal): string {
  if (goal.isComplete) return "Goal reached. Time to enjoy it, or set the next one.";
  if (goal.isPastDue && goal.targetDate)
    return `The date passed on ${formatDate(goal.targetDate, "long")}. Pick a new one?`;
  if (goal.targetDate && goal.perMonth !== null)
    return `About ${formatMoney(Math.ceil(goal.perMonth))} a month to make it by ${formatDate(goal.targetDate, "long")}.`;
  return "No deadline. Add money whenever you can.";
}

export function GoalCard({ goal, onAdd, onWithdraw, onEdit, onDelete, onRemoveEntry }: GoalCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const entries = goal.contributions.slice(0, 6);

  return (
    <article
      className={`goal ${goal.isComplete ? "goal--done" : ""} ${goal.isPastDue ? "goal--late" : ""}`}
      style={{ ["--goal-color" as string]: goal.color }}
    >
      <header className="goal__head">
        <h3 className="goal__name">{goal.name}</h3>
        <div className="goal__tools">
          <IconButton label={`Edit ${goal.name}`} onClick={onEdit}>
            <Pencil size={15} />
          </IconButton>
          <IconButton label={`Delete ${goal.name}`} tone="danger" onClick={onDelete}>
            <Trash2 size={15} />
          </IconButton>
        </div>
      </header>

      <div className="goal__body">
        <ProgressRing percent={goal.percent} color={goal.color} label={goal.isComplete ? "reached" : "saved"} />
        <dl className="goal__figures">
          <div>
            <dt>Saved</dt>
            <dd className="num">{formatMoney(goal.saved)}</dd>
          </div>
          <div>
            <dt>Target</dt>
            <dd className="num">{formatMoney(goal.targetAmount)}</dd>
          </div>
          <div>
            <dt>To go</dt>
            <dd className="num">{goal.isComplete ? "Nothing" : formatMoney(goal.remaining)}</dd>
          </div>
        </dl>
      </div>

      <p className="goal__status">{statusLine(goal)}</p>

      <div className="goal__actions">
        <Button size="sm" icon={<Plus size={15} />} onClick={onAdd}>
          Add money
        </Button>
        <Button size="sm" variant="ghost" icon={<Minus size={15} />} onClick={onWithdraw} disabled={goal.saved <= 0}>
          Take out
        </Button>
        {entries.length > 0 && (
          <button
            type="button"
            className={`goal__history-toggle ${showHistory ? "is-open" : ""}`}
            aria-expanded={showHistory}
            onClick={() => setShowHistory((open) => !open)}
          >
            History
            <ChevronDown size={15} />
          </button>
        )}
      </div>

      {showHistory && (
        <ul className="goal__history">
          {entries.map((entry) => (
            <li key={entry.id}>
              <span className="goal__history-date num">{formatDate(entry.date)}</span>
              <span className="goal__history-note">{entry.note || (entry.amount > 0 ? "Added" : "Taken out")}</span>
              <span className={`goal__history-amount num ${entry.amount < 0 ? "is-negative" : ""}`}>
                {entry.amount > 0 ? "+" : "-"}
                {formatMoney(Math.abs(entry.amount))}
              </span>
              <IconButton label="Remove this entry" onClick={() => onRemoveEntry(entry.id)}>
                <X size={13} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}