/*
 * PURPOSE:
 * Admin shell layout component.
 *
 * FLOW:
 * Admin routes -> AdminLayout -> Sidebar Navigation + Main Content.
 *
 * RESPONSIBILITY:
 * Provides the global admin navigation, offline banner status, responsive mobile navigation
 * with an accessible More popover menu, and content area wrapper.
 */

import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import type { ReactNode } from "react";

type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({
  children,
}: AdminLayoutProps) {
  const { logout } = useAuth();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Close More menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!isMoreOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMoreOpen]);

  const closeMore = () => setIsMoreOpen(false);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <nav className="admin-nav" aria-label="Admin sections">
          <div className="admin-primary-nav">
            <NavLink to="/admin" end>
              Dashboard
            </NavLink>
            <NavLink to="/admin/projects">
              Projects
            </NavLink>
            <NavLink to="/admin/leads">
              Leads
            </NavLink>
          </div>

          <div className="admin-more-container" ref={moreRef}>
            <button
              className={`admin-more-toggle ${isMoreOpen ? "is-active" : ""}`}
              type="button"
              aria-expanded={isMoreOpen}
              aria-controls="admin-more-menu"
              aria-haspopup="true"
              onClick={() => setIsMoreOpen((open) => !open)}
            >
              <span>More</span>
              <span className="admin-more-arrow" aria-hidden="true">{isMoreOpen ? "▴" : "▾"}</span>
            </button>

            <div
              id="admin-more-menu"
              className={`admin-secondary-nav ${isMoreOpen ? "is-open" : ""}`}
              role="menu"
            >
              <NavLink to="/admin/developers" role="menuitem" onClick={closeMore}>
                Developers
              </NavLink>
              <NavLink to="/admin/media" role="menuitem" onClick={closeMore}>
                Home Media
              </NavLink>
              <NavLink to="/admin/import" role="menuitem" onClick={closeMore}>
                Import
              </NavLink>
              <div className="admin-more-divider" role="separator" />
              <button
                type="button"
                className="admin-logout-btn"
                role="menuitem"
                onClick={() => {
                  closeMore();
                  logout();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <main className="admin-content">
        {!isOnline && (
          <p className="admin-offline-banner" role="status">
            You are offline. Live lead data is unavailable.
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
