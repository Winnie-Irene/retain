import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function AdminInsightsPage() {
  const { user, signOut } = useAuth();

  return (
    <main>
      <h1>Admin</h1>
      <p>Only admins can see this page. Welcome, {user?.name}.</p>
      <Link to="/dashboard">My dashboard</Link>
      <button type="button" onClick={signOut}>
        Sign out
      </button>
    </main>
  );
}