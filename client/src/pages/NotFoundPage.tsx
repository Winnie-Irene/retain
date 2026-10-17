import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function NotFoundPage() {
  const { status } = useAuth();

  return (
    <main>
      <h1>Page not found</h1>
      <p>This page is not in the planner. It may have moved, or the link has a typo.</p>
      <Link to={status === "authenticated" ? "/dashboard" : "/login"}>
        {status === "authenticated" ? "Back to my planner" : "Go to sign in"}
      </Link>
    </main>
  );
}