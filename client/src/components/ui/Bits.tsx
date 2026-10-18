import type { ReactNode } from "react";
import type { BudgetStatus, Category } from "../../types/models";
import { BUDGET_STATUS_COPY } from "../../utils/constants";

export function CategoryTag({ category }: { category: Category | null }) {
  if (!category) return <span className="cat-tag cat-tag--empty">No category</span>;
  return (
    <span className="cat-tag">
      <span className="cat-tag__dot" style={{ background: category.color }} aria-hidden="true" />
      {category.name}
    </span>
  );
}

export function StatusPill({ status }: { status: BudgetStatus }) {
  return <span className={`status-pill status-pill--${status}`}>{BUDGET_STATUS_COPY[status].label}</span>;
}

interface EmptyStateProps {
  title: string;
  message: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <p className="script empty__title">{title}</p>
      <p className="empty__message">{message}</p>
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-note" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="link-btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function LoadingLines({ rows = 4 }: { rows?: number }) {
  return (
    <div className="loading-lines" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <span key={index} style={{ width: `${92 - index * 9}%` }} />
      ))}
    </div>
  );
}