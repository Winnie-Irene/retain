export const ROLES = ["user", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const PAYMENT_METHODS = ["cash", "card", "mobile_money", "bank_transfer"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  mobile_money: "Mobile Money",
  bank_transfer: "Bank Transfer",
};

export const EXPENSE_KINDS = ["fixed", "variable"] as const;
export type ExpenseKind = (typeof EXPENSE_KINDS)[number];

export const DEFAULT_CATEGORY_NAME = "Uncategorized";
export const DEFAULT_CATEGORY_COLOR = "#B8A9A1";

export const ACCOUNT_STATUSES = ["active", "suspended"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const DEFAULT_ALERT_PERCENT = 80;

export const LANDING_PAGES = ["dashboard", "expenses", "budget", "savings"] as const;
export type LandingPage = (typeof LANDING_PAGES)[number];