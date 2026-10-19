import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { formatMoney, monthName } from "../../utils/format";

export function DailyBars({ data, month }: { data: { day: number; total: number }[]; month: string }) {
  const name = monthName(month).slice(0, 3);

  return (
    <div className="history-chart history-chart--short">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="18%">
          <CartesianGrid stroke="var(--rule)" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={{ stroke: "var(--rule-strong)" }}
            tick={{ fill: "var(--ink-soft)", fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={16}
            tickFormatter={(day: number) => `${day} ${name}`}
          />
          <YAxis
            width={58}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--ink-soft)", fontSize: 12 }}
            tickFormatter={(value: number) => formatMoney(value, "", true).trim()}
          />
          <Tooltip
            content={<ChartTooltip labelFormatter={(label) => `${label} ${monthName(month)}`} />}
            cursor={{ fill: "var(--blush-wash)" }}
          />
          <Bar dataKey="total" name="Recorded" fill="var(--blush-deep)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}