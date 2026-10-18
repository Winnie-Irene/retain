import { ChevronLeft, ChevronRight } from "lucide-react";
import { currentMonthKey, monthName, shiftMonth } from "../../utils/format";

interface MonthTagProps {
  month: string;
  onChange: (month: string) => void;
  allowFuture?: boolean;
}

export function MonthTag({ month, onChange, allowFuture = true }: MonthTagProps) {
  const year = month.slice(0, 4);
  const isCurrent = month === currentMonthKey();
  const canGoForward = allowFuture || month < currentMonthKey();

  return (
    <div className="month-tag" role="group" aria-label="Choose month">
      <div className="month-tag__head">
        <span>Month</span>
        {!isCurrent && (
          <button type="button" className="month-tag__today" onClick={() => onChange(currentMonthKey())}>
            Today
          </button>
        )}
      </div>
      <div className="month-tag__body">
        <button
          type="button"
          className="month-tag__arrow"
          aria-label="Previous month"
          onClick={() => onChange(shiftMonth(month, -1))}
        >
          <ChevronLeft size={16} />
        </button>
        <div className="month-tag__value" aria-live="polite">
          <span className="month-tag__name">{monthName(month)}</span>
          <span className="month-tag__year num">{year}</span>
        </div>
        <button
          type="button"
          className="month-tag__arrow"
          aria-label="Next month"
          disabled={!canGoForward}
          onClick={() => onChange(shiftMonth(month, 1))}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}