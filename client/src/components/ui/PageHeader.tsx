import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  aside?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, aside, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__main">
        <h1 className="script page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
      {aside && <div className="page-header__aside">{aside}</div>}
      <div className="page-header__rule" aria-hidden="true" />
    </header>
  );
}