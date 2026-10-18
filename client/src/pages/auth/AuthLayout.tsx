import type { ReactNode } from "react";
import { BrushStroke, Moon, Sprig, Sun } from "../../components/ornaments/Ornaments";

interface AuthLayoutProps {
  title: string;
  intro: string;
  children: ReactNode;
  footer: ReactNode;
}

const previewRows = [
  { label: "Budget", value: "450,000" },
  { label: "Spent", value: "362,500" },
  { label: "Remaining", value: "87,500" },
];

export function AuthLayout({ title, intro, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth">
      <aside className="auth__art" aria-hidden="true">
        <div className="auth__sky">
          <Moon size={48} />
          <Sun size={92} />
        </div>
        <div className="auth__headline">
          <Sprig size={110} />
          <div>
            <p className="script auth__wordmark">Retain</p>
            <p className="auth__lede">Monthly budget planner</p>
          </div>
          <Sprig size={110} flip />
        </div>

        <div className="auth__preview">
          <p className="script auth__preview-title">Budget Totals</p>
          <table>
            <thead>
              <tr>
                <th>Total</th>
                <th>RWF</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td className="num">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="auth__bars">
            <span style={{ height: "82%" }} />
            <span style={{ height: "66%" }} />
            <span style={{ height: "48%" }} />
            <span style={{ height: "58%" }} />
          </div>
        </div>

        <div className="auth__brush">
          <BrushStroke className="auth__brush-shape" />
          <p className="script auth__brush-script">Enter</p>
          <p className="auth__brush-text">your expenses, watch your month take shape</p>
        </div>
      </aside>

      <main className="auth__panel">
        <div className="auth__card">
          <h1 className="script auth__title">{title}</h1>
          <p className="auth__intro">{intro}</p>
          {children}
          <div className="auth__footer">{footer}</div>
        </div>
      </main>
    </div>
  );
}