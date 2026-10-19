import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Moon, Sprig, Sun } from "../../components/ornaments/Ornaments";

interface LegalLayoutProps {
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}

export function LegalLayout({ title, updated, intro, children }: LegalLayoutProps) {
  const { status, homePath } = useAuth();
  const signedIn = status === "authenticated";

  return (
    <div className="legal">
      <header className="legal__top">
        <Link to={signedIn ? homePath : "/login"} className="legal__brand">
          <Moon size={22} />
          <span className="script">Retain</span>
          <Sun size={30} />
        </Link>
        <Link to={signedIn ? homePath : "/register"} className="back-link">
          <ArrowLeft size={16} />
          {signedIn ? "Back to my planner" : "Back to sign up"}
        </Link>
      </header>

      <article className="legal__sheet">
        <Sprig size={46} className="legal__sprig" />
        <h1 className="script legal__title">{title}</h1>
        <p className="legal__updated">Last updated {updated}</p>
        <div className="legal__intro">{intro}</div>
        <div className="legal__body">{children}</div>
        <footer className="legal__footer">
          <Link to="/terms">Terms of Use</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <a href="mailto:i.winnie@alustudent.com">i.winnie@alustudent.com</a>
        </footer>
      </article>
    </div>
  );
}