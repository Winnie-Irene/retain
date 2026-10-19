import { formatMoney } from "../../utils/format";

export interface MeterBarItem {
  key: string;
  label: string;
  value: number;
  color: string;
  meta?: string;
}

export function MeterBars({
  items,
  valueFormatter = (value) => formatMoney(value),
}: {
  items: MeterBarItem[];
  valueFormatter?: (value: number) => string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <ul className="meter-bars">
      {items.map((item) => (
        <li key={item.key}>
          <div className="meter-bars__row">
            <span className="meter-bars__label">{item.label}</span>
            <span className="meter-bars__value num">
              {valueFormatter(item.value)}
              {item.meta && <small>{item.meta}</small>}
            </span>
          </div>
          <span className="meter-bars__track" aria-hidden="true">
            <span style={{ width: `${(item.value / max) * 100}%`, background: item.color }} />
          </span>
        </li>
      ))}
    </ul>
  );
}