import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyTrendPoint } from "../../types/api";
import { ChartTooltip } from "./ChartTooltip";
import { formatMoney, monthLabel } from "../../utils/format";

export function TrendBars({ data }: { data: MonthlyTrendPoint[] }) {
  const rows = data.map((point) => ({ ...point, label: monthLabel(point.month, "short") }));
  const lastIndex = rows.length - 1;

  return (
    <div className="history-chart history-chart--short">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
          <CartesianGrid stroke="var(--rule)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--rule-strong)" }}
            tick={{ fill: "var(--ink-soft)", fontSize: 12 }}
          />
          <YAxis
            width={58}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--ink-soft)", fontSize: 12 }}
            tickFormatter={(value: number) => formatMoney(value, "", true).trim()}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--blush-wash)" }} />
          <Bar dataKey="total" name="Recorded" radius={[2, 2, 0, 0]}>
            {rows.map((row, index) => (
              <Cell key={row.month} fill={index === lastIndex ? "var(--terracotta)" : "var(--sage)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}