import type { ReactNode } from "react";

interface SheetProps {
  title?: string;
  caption?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}

export function Sheet({ title, caption, actions, children, className, flush = false }: SheetProps) {
  return (
    <section className={`sheet ${flush ? "sheet--flush" : ""} ${className ?? ""}`}>
      {(title || actions) && (
        <header className="sheet__header">
          <div>
            {title && <h2 className="script sheet__title">{title}</h2>}
            {caption && <p className="sheet__caption">{caption}</p>}
          </div>
          {actions && <div className="sheet__actions">{actions}</div>}
        </header>
      )}
      <div className="sheet__body">{children}</div>
    </section>
  );
}