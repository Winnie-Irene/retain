import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/models";
import { FullPageLoader } from "../components/ui/FullPageLoader";

interface ProtectedRouteProps {
  roles?: Role[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { status, hasRole } = useAuth();
  const location = useLocation();

  if (status === "checking") return <FullPageLoader />;

  if (status === "guest") {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to="/dashboard" replace state={{ denied: true }} />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  return <ProtectedRoute roles={["admin"]} />;
}

export function GuestRoute() {
  const { status, homePath } = useAuth();

  if (status === "checking") return <FullPageLoader />;
  if (status === "authenticated") return <Navigate to={homePath} replace />;

  return <Outlet />;
}