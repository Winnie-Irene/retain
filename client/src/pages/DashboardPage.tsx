import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function DashboardPage() {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <main>
      <h1>Dashboard</h1>
      <p>
        Signed in as {user?.name} ({user?.role})
      </p>
      {isAdmin && <Link to="/admin">Go to admin</Link>}
      <button type="button" onClick={signOut}>
        Sign out
      </button>
    </main>
  );
}