import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BudgetSummary } from "../../types/models";
import { ChartTooltip } from "./ChartTooltip";
import { formatMoney, monthLabel } from "../../utils/format";

interface BudgetHistoryChartProps {
  history: BudgetSummary[];
  activeMonth?: string;
  onSelect?: (month: string) => void;
}

export function BudgetHistoryChart({ history, activeMonth, onSelect }: BudgetHistoryChartProps) {
  const data = history.map((entry) => ({
    month: entry.month,
    label: monthLabel(entry.month, "short"),
    budgeted: entry.amount ?? 0,
    actual: entry.spent,
  }));

  return (
    <div className="history-chart history-chart--legend">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          barGap={4}
          barCategoryGap="26%"
          onClick={(state) => {
            const index = typeof state?.activeIndex === "number" ? state.activeIndex : Number(state?.activeIndex);
            const entry = Number.isInteger(index) ? data[index] : undefined;
            if (entry && onSelect) onSelect(entry.month);
          }}
        >
          <CartesianGrid stroke="var(--rule)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--rule-strong)" }}
            tick={({ x, y, payload, index }) => (
              <text
                x={x}
                y={Number(y) + 14}
                textAnchor="middle"
                fontSize={12}
                fontWeight={data[index]?.month === activeMonth ? 600 : 400}
                fill={data[index]?.month === activeMonth ? "var(--ink)" : "var(--ink-soft)"}
              >
                {payload.value}
              </text>
            )}
          />
          <YAxis
            width={58}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--ink-soft)", fontSize: 12 }}
            tickFormatter={(value: number) => formatMoney(value, "", true).trim()}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--blush-wash)" }} />
          <Bar
            dataKey="budgeted"
            name="Budgeted"
            fill="var(--sage)"
            radius={[2, 2, 0, 0]}
            cursor={onSelect ? "pointer" : "default"}
          />
          <Bar
            dataKey="actual"
            name="Actual"
            fill="var(--olive)"
            radius={[2, 2, 0, 0]}
            cursor={onSelect ? "pointer" : "default"}
          />
        </BarChart>
      </ResponsiveContainer>
      <ul className="chart-legend" aria-hidden="true">
        <li>
          <span style={{ background: "var(--sage)" }} />
          Budgeted
        </li>
        <li>
          <span style={{ background: "var(--olive)" }} />
          Actual
        </li>
      </ul>
    </div>
  );
}