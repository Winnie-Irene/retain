import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute, GuestRoute, ProtectedRoute } from "./routes/guards";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminInsightsPage } from "./pages/admin/AdminInsightsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useAuth } from "./hooks/useAuth";

export function App() {
  const { status, isAdmin } = useAuth();

  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminInsightsPage />} />
        </Route>
      </Route>

      <Route
        path="/"
        element={<Navigate to={status === "authenticated" ? (isAdmin ? "/admin" : "/dashboard") : "/login"} replace />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}