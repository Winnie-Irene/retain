import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "soft" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  block?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  block = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = ["btn", `btn--${variant}`, `btn--${size}`, block ? "btn--block" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : icon}
      {children && <span>{children}</span>}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: "default" | "danger";
}

export function IconButton({
  label,
  tone = "default",
  className,
  children,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={`icon-btn icon-btn--${tone} ${className ?? ""}`}
      aria-label={label}
      title={label}
      {...rest}
    >
      {children}
    </button>
  );
}