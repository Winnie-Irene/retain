import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AdminBudgetHistoryPoint } from "../../types/api";
import { monthLabel } from "../../utils/format";

interface CountTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: readonly { name?: string | number; value?: number | string | (number | string)[]; color?: string }[];
}

function CountTooltip({ active, label, payload }: CountTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      <ul>
        {payload.map((entry) => (
          <li key={String(entry.name)}>
            <span className="chart-tooltip__swatch" style={{ background: entry.color }} aria-hidden="true" />
            <span>{entry.name}</span>
            <strong className="num">{String(entry.value ?? 0)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SERIES = [
  { key: "within", name: "Within", color: "var(--sage)" },
  { key: "approaching", name: "Approaching", color: "var(--amber)" },
  { key: "over", name: "Over", color: "var(--danger)" },
] as const;

export function BudgetStatusChart({ history }: { history: AdminBudgetHistoryPoint[] }) {
  const data = history.map((point) => ({ ...point, label: monthLabel(point.month, "short") }));

  return (
    <div className="history-chart history-chart--legend">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
          <CartesianGrid stroke="var(--rule)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--rule-strong)" }}
            tick={{ fill: "var(--ink-soft)", fontSize: 12 }}
          />
          <YAxis
            width={36}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--ink-soft)", fontSize: 12 }}
          />
          <Tooltip content={<CountTooltip />} cursor={{ fill: "var(--blush-wash)" }} />
          {SERIES.map((series, index) => (
            <Bar
              key={series.key}
              dataKey={series.key}
              name={series.name}
              stackId="status"
              fill={series.color}
              radius={index === SERIES.length - 1 ? [2, 2, 0, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <ul className="chart-legend" aria-hidden="true">
        {SERIES.map((series) => (
          <li key={series.key}>
            <span style={{ background: series.color }} />
            {series.name}
          </li>
        ))}
      </ul>
    </div>
  );
}