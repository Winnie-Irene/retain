import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminRoute, GuestRoute, ProtectedRoute } from "./routes/guards";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { FullPageLoader } from "./components/ui/FullPageLoader";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useAuth } from "./hooks/useAuth";
import { useAppDispatch } from "./store";
import { resetFilters } from "./store/filtersSlice";
import { clearExpenses } from "./store/expensesSlice";

const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const ExpensesPage = lazy(() => import("./pages/ExpensesPage").then((module) => ({ default: module.ExpensesPage })));
const ExpenseDetailPage = lazy(() =>
  import("./pages/ExpenseDetailPage").then((module) => ({ default: module.ExpenseDetailPage })),
);
const BudgetPage = lazy(() => import("./pages/BudgetPage").then((module) => ({ default: module.BudgetPage })));
const SavingsPage = lazy(() => import("./pages/SavingsPage").then((module) => ({ default: module.SavingsPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const TermsPage = lazy(() => import("./pages/legal/TermsPage").then((module) => ({ default: module.TermsPage })));
const PrivacyPage = lazy(() => import("./pages/legal/PrivacyPage").then((module) => ({ default: module.PrivacyPage })));
const AdminInsightsPage = lazy(() =>
  import("./pages/admin/AdminInsightsPage").then((module) => ({ default: module.AdminInsightsPage })),
);
const AdminCategoriesPage = lazy(() =>
  import("./pages/admin/AdminCategoriesPage").then((module) => ({ default: module.AdminCategoriesPage })),
);

export function App() {
  const { status, homePath } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "guest") {
      dispatch(resetFilters());
      dispatch(clearExpenses());
    }
  }, [status, dispatch]);

  return (
    <Suspense fallback={<FullPageLoader />}>
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
            <Route path="/savings" element={<SavingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminInsightsPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        <Route path="/" element={<Navigate to={status === "authenticated" ? homePath : "/login"} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}