import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination as PaginationInfo } from "../../types/api";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("gap");
    result.push(page);
  });
  return result;
}

export function Pagination({ pagination, onPageChange, limit, onLimitChange }: PaginationProps) {
  const { page, totalPages, total } = pagination;
  const from = total === 0 ? 0 : (page - 1) * pagination.limit + 1;
  const to = Math.min(total, page * pagination.limit);

  return (
    <nav className="pager" aria-label="Expense pages">
      <p className="pager__summary num">
        {from} to {to} of {total}
      </p>
      <div className="pager__pages">
        <button
          type="button"
          className="pager__btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {pageWindow(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="pager__gap">
              ...
            </span>
          ) : (
            <button
              type="button"
              key={item}
              className={`pager__btn num ${item === page ? "is-current" : ""}`}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className="pager__btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <label className="pager__limit">
        <span>Rows</span>
        <select value={limit} onChange={(event) => onLimitChange(Number(event.target.value))}>
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </nav>
  );
}