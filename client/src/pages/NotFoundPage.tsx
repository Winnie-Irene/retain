import { Link } from "react-router-dom";
import { Moon, Sprig } from "../components/ornaments/Ornaments";
import { useAuth } from "../hooks/useAuth";

export function NotFoundPage() {
  const { status } = useAuth();

  return (
    <main className="not-found">
      <Moon size={56} />
      <p className="script not-found__title">Page not found</p>
      <p className="not-found__text">This page is not in the planner. It may have moved, or the link has a typo.</p>
      <Link to={status === "authenticated" ? "/dashboard" : "/login"} className="btn btn--primary btn--md">
        {status === "authenticated" ? "Back to my planner" : "Go to sign in"}
      </Link>
      <Sprig size={70} className="not-found__sprig" />
    </main>
  );
}