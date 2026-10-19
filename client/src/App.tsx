import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminRoute, GuestRoute, ProtectedRoute } from "./routes/guards";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { ExpenseDetailPage } from "./pages/ExpenseDetailPage";
import { BudgetPage } from "./pages/BudgetPage";
import { AdminInsightsPage } from "./pages/admin/AdminInsightsPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useAuth } from "./hooks/useAuth";
import { useAppDispatch } from "./store";
import { resetFilters } from "./store/filtersSlice";
import { clearExpenses } from "./store/expensesSlice";

export function App() {
  const { status, isAdmin } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "guest") {
      dispatch(resetFilters());
      dispatch(clearExpenses());
    }
  }, [status, dispatch]);

  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
          <Route path="/budget" element={<BudgetPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminInsightsPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          </Route>
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