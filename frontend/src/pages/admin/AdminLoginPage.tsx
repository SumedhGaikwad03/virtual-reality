/*
 * PURPOSE:
 * Admin login page component.
 *
 * FLOW:
 * Admin routing -> AdminLoginPage -> loginAdmin API -> AuthContext.
 *
 * RESPONSIBILITY:
 * Provides a clean, restrained internal administration portal login screen,
 * handling submission states, validation errors, and redirecting authenticated sessions.
 */

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminAuthApiError } from "../../api/admin-auth";
import {
  isInvalidCredentialsError,
  useAuth,
} from "../../auth/AuthContext";

type LoginLocationState = {
  from?: {
    pathname: string;
    search: string;
  };
};

export function AdminLoginPage() {
  const { isAuthenticated, isAuthReady, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      const state = location.state as LoginLocationState | null;
      const destination = state?.from
        ? `${state.from.pathname}${state.from.search}`
        : "/admin";
      navigate(destination, { replace: true, state: null });
    }
  }, [isAuthReady, isAuthenticated, location.state, navigate]);

  if (!isAuthReady) {
    return (
      <main className="admin-login-page">
        <p className="admin-login-loading">Checking admin session...</p>
      </main>
    );
  }

  if (isAuthenticated) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch (loginError) {
      if (isInvalidCredentialsError(loginError)) {
        setError("Invalid email or password.");
      } else if (loginError instanceof AdminAuthApiError) {
        setError("Unable to sign in. Please try again.");
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <header className="admin-login-header">
          <p className="admin-login-eyebrow">Virtual Reality</p>
          <h1>Administration Portal</h1>
          <p className="admin-login-subtitle">Sign in to manage projects, developers, and leads.</p>
        </header>

        {error && (
          <div className="admin-alert admin-alert-error" role="alert">
            {error}
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label className="admin-login-label">
            <span>Email</span>
            <input
              required
              type="email"
              placeholder="admin@example.com"
              value={email}
              autoComplete="email"
              disabled={isSubmitting}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="admin-login-label">
            <span>Password</span>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              autoComplete="current-password"
              disabled={isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            className="admin-action admin-action--primary admin-login-btn"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
