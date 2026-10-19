import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { CategoryBreakdown } from "../../types/models";
import { formatMoney } from "../../utils/format";

interface CategoryDonutProps {
  data: CategoryBreakdown[];
  total: number;
  onSelect?: (categoryId: string) => void;
  caption?: string;
}

export function CategoryDonut({ data, total, onSelect, caption = "spent" }: CategoryDonutProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = data.find((item) => item.category.id === activeId) ?? null;

  return (
    <div className="donut">
      <div className="donut__chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category.name"
              innerRadius="64%"
              outerRadius="96%"
              paddingAngle={1.5}
              stroke="var(--paper)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive
              animationDuration={700}
              onMouseLeave={() => setActiveId(null)}
            >
              {data.map((item) => (
                <Cell
                  key={item.category.id}
                  fill={item.category.color}
                  opacity={activeId && activeId !== item.category.id ? 0.35 : 1}
                  cursor={onSelect ? "pointer" : "default"}
                  onMouseEnter={() => setActiveId(item.category.id)}
                  onClick={() => onSelect?.(item.category.id)}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="donut__center" aria-live="polite">
          <span className="donut__center-label">{active ? active.category.name : `Total ${caption}`}</span>
          <strong className="num">
            {formatMoney(active ? active.total : total, "RWF", (active ? active.total : total) >= 1_000_000)}
          </strong>
          {active && <span className="donut__center-share num">{active.share}% of the month</span>}
        </div>
      </div>

      <ul className="donut__legend">
        {data.map((item) => (
          <li key={item.category.id}>
            <button
              type="button"
              className={`donut__row ${activeId === item.category.id ? "is-active" : ""}`}
              onMouseEnter={() => setActiveId(item.category.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(item.category.id)}
              onBlur={() => setActiveId(null)}
              onClick={() => onSelect?.(item.category.id)}
              disabled={!onSelect}
            >
              <span className="donut__swatch" style={{ background: item.category.color }} aria-hidden="true" />
              <span className="donut__name">{item.category.name}</span>
              <span className="donut__count num">{item.count}</span>
              <span className="donut__value num">{formatMoney(item.total)}</span>
              <span className="donut__bar" aria-hidden="true">
                <span style={{ width: `${Math.max(item.share, 2)}%`, background: item.category.color }} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}