/*
 * PURPOSE:
 * Admin shell layout component.
 *
 * FLOW:
 * Admin routes -> AdminLayout -> Desktop Sidebar / Mobile Header & Drawer -> Main Content.
 *
 * RESPONSIBILITY:
 * Provides the global admin navigation, offline banner status, responsive mobile navigation
 * with an accessible slide-out drawer menu, and content area wrapper.
 */

import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useAdminLocationInitializer } from "../../hooks/useAdminLocationInitializer";
import { LocationPermissionModal } from "./LocationPermissionModal";
import type { ReactNode } from "react";

type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({
  children,
}: AdminLayoutProps) {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  const {
    isModalOpen: isLocationModalOpen,
    isSubmitting: isLocationSubmitting,
    handleAllow: handleAllowLocation,
    handleDismiss: handleDismissLocation,
  } = useAdminLocationInitializer();

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

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
    setIsMoreOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Close Mobile Drawer on Escape key
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen]);

  // Close More menu when clicking outside or pressing Escape (Desktop fallback)
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

  const closeDrawer = () => setIsDrawerOpen(false);
  const closeMore = () => setIsMoreOpen(false);

  return (
    <div className="admin-layout">
      {/* Mobile Top Header */}
      <header className="admin-mobile-header" aria-label="Mobile Admin Header">
        <button
          type="button"
          className="admin-mobile-menu-toggle"
          aria-expanded={isDrawerOpen}
          aria-controls="admin-mobile-drawer"
          aria-label={isDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsDrawerOpen((open) => !open)}
        >
          <span className="admin-hamburger-icon" aria-hidden="true">
            <span className="admin-hamburger-line" />
            <span className="admin-hamburger-line" />
            <span className="admin-hamburger-line" />
          </span>
          <span className="admin-mobile-menu-text">Menu</span>
        </button>

        <div className="admin-mobile-brand">
          <span className="admin-mobile-brand-title">Virtual Reality</span>
          <span className="admin-mobile-brand-badge">Admin</span>
        </div>

        <div className="admin-mobile-user-quick">
          <button
            type="button"
            className="admin-mobile-logout-btn"
            onClick={() => logout()}
            title="Logout"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Mobile Offcanvas Navigation Drawer Backdrop & Panel */}
      {isDrawerOpen && (
        <div
          className="admin-mobile-drawer-backdrop"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      <aside
        id="admin-mobile-drawer"
        className={`admin-mobile-drawer ${isDrawerOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Admin Navigation Menu"
        aria-hidden={!isDrawerOpen}
      >
        <div className="admin-mobile-drawer-header">
          <div className="admin-mobile-drawer-brand">
            <span className="admin-drawer-brand-name">Virtual Reality</span>
            {admin && (
              <span className="admin-drawer-user-role">
                {admin.email} ({admin.role})
              </span>
            )}
          </div>
          <button
            type="button"
            className="admin-mobile-drawer-close"
            onClick={closeDrawer}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="admin-mobile-drawer-nav" aria-label="Mobile Admin Sections">
          <div className="admin-drawer-nav-section">
            <span className="admin-drawer-section-title">Core</span>
            <div className="admin-drawer-links">
              <NavLink to="/admin" end onClick={closeDrawer}>
                Dashboard
              </NavLink>
              {admin?.role === "FOUNDER" && (
                <NavLink to="/admin/projects" onClick={closeDrawer}>
                  Projects
                </NavLink>
              )}
            </div>
          </div>

          <div className="admin-drawer-nav-section">
            <span className="admin-drawer-section-title">Leads</span>
            <div className="admin-drawer-links">
              <NavLink to="/admin/leads" end onClick={closeDrawer}>
                All Leads
              </NavLink>
              <NavLink to="/admin/visits" onClick={closeDrawer}>
                Visits
              </NavLink>
            </div>
          </div>

          <div className="admin-drawer-nav-section">
            <span className="admin-drawer-section-title">Rentals</span>
            <div className="admin-drawer-links">
              <NavLink to="/admin/rentals/enquiries" onClick={closeDrawer}>
                Enquiries
              </NavLink>
              <NavLink to="/admin/rentals/available" onClick={closeDrawer}>
                Available Properties
              </NavLink>
            </div>
          </div>

          {admin?.role === "FOUNDER" && (
            <div className="admin-drawer-nav-section">
              <span className="admin-drawer-section-title">Management</span>
              <div className="admin-drawer-links">
                <NavLink to="/admin/developers" onClick={closeDrawer}>
                  Developers
                </NavLink>
                <NavLink to="/admin/media" onClick={closeDrawer}>
                  Home Media
                </NavLink>
                <NavLink to="/admin/contact" onClick={closeDrawer}>
                  Contact Info
                </NavLink>
                <NavLink to="/admin/firm-profile" onClick={closeDrawer}>
                  Firm Profile
                </NavLink>
                <NavLink to="/admin/accounts" onClick={closeDrawer}>
                  Admin Accounts
                </NavLink>
                <NavLink to="/admin/locations" onClick={closeDrawer}>
                  Locations
                </NavLink>
                <NavLink to="/admin/import" onClick={closeDrawer}>
                  Import
                </NavLink>
              </div>
            </div>
          )}
        </nav>

        <div className="admin-mobile-drawer-footer">
          <button
            type="button"
            className="admin-mobile-drawer-logout"
            onClick={() => {
              closeDrawer();
              logout();
            }}
          >
            Logout ({admin?.email || "Admin"})
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar (visible on >= 1024px) */}
      <aside className="admin-sidebar" aria-label="Desktop Sidebar">
        <nav className="admin-nav" aria-label="Admin sections">
          <div className="admin-primary-nav">
            <NavLink to="/admin" end>
              Dashboard
            </NavLink>
            {admin?.role === "FOUNDER" && (
              <NavLink to="/admin/projects">
                Projects
              </NavLink>
            )}
            <div className="admin-nav-group">
              <span className="admin-nav-group-title">Leads</span>
              <div className="admin-nav-group-items">
                <NavLink to="/admin/leads" end>
                  All Leads
                </NavLink>
                <NavLink to="/admin/visits">
                  Visits
                </NavLink>
              </div>
            </div>
            <div className="admin-nav-group">
              <span className="admin-nav-group-title">Rentals</span>
              <div className="admin-nav-group-items">
                <NavLink to="/admin/rentals/enquiries">
                  Enquiries
                </NavLink>
                <NavLink to="/admin/rentals/available">
                  Available
                </NavLink>
              </div>
            </div>
          </div>

          {admin?.role === "FOUNDER" ? (
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
                <NavLink to="/admin/contact" role="menuitem" onClick={closeMore}>
                  Contact Info
                </NavLink>
                <NavLink to="/admin/firm-profile" role="menuitem" onClick={closeMore}>
                  Firm Profile
                </NavLink>
                <NavLink to="/admin/accounts" role="menuitem" onClick={closeMore}>
                  Admin Accounts
                </NavLink>
                <NavLink to="/admin/locations" role="menuitem" onClick={closeMore}>
                  Locations
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
          ) : (
            <div className="admin-sidebar-footer" style={{ marginTop: "auto", paddingTop: "1rem" }}>
              <button
                type="button"
                className="admin-logout-btn"
                style={{ width: "100%", textAlign: "left", padding: "0.6rem 0.85rem" }}
                onClick={() => logout()}
              >
                Logout
              </button>
            </div>
          )}
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

      <LocationPermissionModal
        isOpen={isLocationModalOpen}
        isSubmitting={isLocationSubmitting}
        onAllow={handleAllowLocation}
        onDismiss={handleDismissLocation}
      />
    </div>
  );
}
