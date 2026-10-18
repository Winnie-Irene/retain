const DEFAULT_CURRENCY = "RWF";

export function formatMoney(amount: number, currency = DEFAULT_CURRENCY, compact = false): string {
  const formatted = new Intl.NumberFormat("en-RW", {
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(amount);
  return `${currency} ${formatted}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-RW").format(value);
}

export function formatDate(iso: string, style: "short" | "long" = "short"): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: style === "long" ? "numeric" : undefined,
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function toInputDate(iso: string): string {
  return iso.slice(0, 10);
}

export function fromInputDate(value: string): string {
  return `${value}T12:00:00.000Z`;
}

export function todayInputValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, monthIndex - 1 + delta, 1);
  return currentMonthKey(date);
}

export function monthLabel(month: string, style: "long" | "short" = "long"): string {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: style, year: style === "long" ? "numeric" : undefined }).format(
    new Date(year, monthIndex - 1, 1),
  );
}

export function monthName(month: string): string {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: "long" }).format(new Date(year, monthIndex - 1, 1));
}

export function monthBounds(month: string): { start: string; end: string } {
  const [year, monthIndex] = month.split("-").map(Number);
  const last = new Date(year, monthIndex, 0).getDate();
  return { start: `${month}-01`, end: `${month}-${String(last).padStart(2, "0")}` };
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function timeAgo(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return formatter.format(-Math.round(seconds / size), unit);
  }
  return "just now";
}