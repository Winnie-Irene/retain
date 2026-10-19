import { formatMoney } from "../../utils/format";

interface TooltipEntry {
  name?: string | number;
  value?: number | string | (number | string)[];
  color?: string;
  dataKey?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: readonly TooltipEntry[];
  labelFormatter?: (label: string | number) => string;
}

export function ChartTooltip({ active, payload, label, labelFormatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="chart-tooltip">
      {label !== undefined && <p className="chart-tooltip__label">{labelFormatter ? labelFormatter(label) : label}</p>}
      <ul>
        {payload.map((entry) => (
          <li key={String(entry.dataKey ?? entry.name)}>
            <span className="chart-tooltip__swatch" style={{ background: entry.color }} aria-hidden="true" />
            <span>{entry.name}</span>
            <strong className="num">
              {typeof entry.value === "number" ? formatMoney(entry.value) : String(entry.value ?? "")}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}