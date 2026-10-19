import { useState } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { DailyPoint } from "../../types/api";
import { ChartTooltip } from "./ChartTooltip";
import { currentMonthKey, formatMoney, monthName } from "../../utils/format";

interface PaceChartProps {
  daily: DailyPoint[];
  budget: number | null;
  month: string;
}

export function PaceChart({ daily, budget, month }: PaceChartProps) {
  const isCurrent = month === currentMonthKey();
  const [today] = useState(() => new Date().getDate());
  const days = daily.length;

  const data = daily.map((point) => ({
    day: point.day,
    spent: isCurrent && point.day > today ? null : point.cumulative,
    pace: budget ? Math.round((budget / days) * point.day) : null,
  }));

  const peak = Math.max(budget ?? 0, ...daily.map((point) => point.cumulative));
  const name = monthName(month).slice(0, 3);

  return (
    <div className="pace-chart">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="spentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e39e98" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#e39e98" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--rule)" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={{ stroke: "var(--rule-strong)" }}
            tick={{ fill: "var(--ink-soft)", fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={18}
            tickFormatter={(day: number) => `${day} ${name}`}
          />
          <YAxis
            width={58}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--ink-soft)", fontSize: 12 }}
            domain={[0, Math.ceil((peak * 1.08) / 10000) * 10000 || 10000]}
            tickFormatter={(value: number) => formatMoney(value, "", true).trim()}
          />
          <Tooltip
            content={<ChartTooltip labelFormatter={(label) => `${label} ${monthName(month)}`} />}
            cursor={{ stroke: "var(--blush-deep)", strokeDasharray: "3 3" }}
          />
          {budget !== null && budget > 0 && (
            <ReferenceLine
              y={budget}
              stroke="var(--terracotta)"
              strokeDasharray="5 4"
              label={{ value: "Budget", position: "insideTopRight", fill: "var(--terracotta)", fontSize: 12 }}
            />
          )}
          {budget !== null && budget > 0 && (
            <Line
              type="linear"
              dataKey="pace"
              name="Steady pace"
              stroke="var(--slate)"
              strokeWidth={1.2}
              strokeDasharray="2 4"
              dot={false}
              activeDot={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="spent"
            name="Spent so far"
            stroke="var(--blush-ink)"
            strokeWidth={2.2}
            fill="url(#spentFill)"
            connectNulls={false}
            activeDot={{ r: 5, fill: "var(--blush-ink)", stroke: "var(--paper)", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}