import { Link, Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { AdminLayout } from "../components/admin/AdminLayout";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return <p>Checking admin session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}

export function FounderRoute({ children }: ProtectedRouteProps) {
  const { admin, isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return <p>Checking admin session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (admin?.role !== "FOUNDER") {
    return (
      <AdminLayout>
        <div className="admin-card admin-access-denied-card" role="alert">
          <div className="admin-warning-icon" aria-hidden="true" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            🚫
          </div>
          <h2>Access Denied</h2>
          <p style={{ marginTop: "0.5rem", color: "var(--color-admin-text-muted)" }}>
            Administrator account management is restricted to founder accounts only.
          </p>
          <div className="admin-form-actions" style={{ marginTop: "1.5rem" }}>
            <Link to="/admin" className="admin-action admin-action--primary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return children;
}
