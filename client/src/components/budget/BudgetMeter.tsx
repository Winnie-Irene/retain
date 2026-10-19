import type { BudgetSummary } from "../../types/models";
import { BUDGET_STATUS_COPY } from "../../utils/constants";
import { formatMoney } from "../../utils/format";
import { StatusPill } from "../ui/Bits";

interface BudgetMeterProps {
  budget: BudgetSummary;
  size?: "md" | "lg";
}

export function BudgetMeter({ budget, size = "md" }: BudgetMeterProps) {
  const percent = budget.percentUsed ?? 0;
  const fill = Math.min(percent, 100);
  const overflow = percent > 100 ? Math.min(percent - 100, 100) : 0;

  return (
    <div className={`meter meter--${size} meter--${budget.status}`}>
      <div className="meter__top">
        <StatusPill status={budget.status} />
        {budget.percentUsed !== null && <span className="meter__percent num">{Math.round(percent)}% used</span>}
      </div>

      <div
        className="meter__track"
        role="meter"
        aria-label="Budget used"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fill)}
      >
        <span className="meter__fill" style={{ width: `${fill}%` }} />
        {overflow > 0 && <span className="meter__overflow" style={{ width: `${overflow}%` }} />}
        <span className="meter__mark" style={{ left: "80%" }} aria-hidden="true" />
      </div>

      <div className="meter__scale num" aria-hidden="true">
        <span>0</span>
        <span style={{ left: "80%" }}>80%</span>
        <span>{budget.amount ? formatMoney(budget.amount, "", true).trim() : "100%"}</span>
      </div>

      <p className="meter__hint">{BUDGET_STATUS_COPY[budget.status].hint}</p>
    </div>
  );
}