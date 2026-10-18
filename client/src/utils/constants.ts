import type { BudgetStatus, PaymentMethod, SortField, SortOrder } from "../types/models";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "mobile_money", label: "Mobile Money" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  mobile_money: "Mobile Money",
  card: "Card",
  cash: "Cash",
  bank_transfer: "Bank Transfer",
};

export const SORT_OPTIONS: { value: `${SortField}:${SortOrder}`; label: string }[] = [
  { value: "date:desc", label: "Newest first" },
  { value: "date:asc", label: "Oldest first" },
  { value: "amount:desc", label: "Highest amount" },
  { value: "amount:asc", label: "Lowest amount" },
  { value: "title:asc", label: "Title A to Z" },
];

export const BUDGET_STATUS_COPY: Record<BudgetStatus, { label: string; hint: string }> = {
  unset: { label: "No budget yet", hint: "Set a budget for this month to see how you are doing." },
  within: { label: "Within budget", hint: "You are pacing nicely. Keep it up." },
  approaching: { label: "Approaching budget", hint: "You have used most of this month's budget. Slow down a little." },
  over: { label: "Over budget", hint: "You have spent more than you planned this month." },
};

export const CATEGORY_SWATCHES = [
  "#E89A9A",
  "#D4869C",
  "#B48EAE",
  "#8E9C78",
  "#A3B18A",
  "#7A8B6F",
  "#B5654A",
  "#C77D6B",
  "#9C6B5E",
  "#C9A27E",
  "#E3B7A0",
  "#6F7D8C",
];