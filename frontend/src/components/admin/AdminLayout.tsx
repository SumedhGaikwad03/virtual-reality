import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import type { ReactNode } from "react";
import { LeadNotificationControl } from "./LeadNotificationControl";

type AdminLayoutProps = {
  children: ReactNode;
};

const adminSections = [
  "Developers",
  "Projects",
  "Configurations",
  "Media",
  "Leads",
  "Import",
];

export function AdminLayout({
  children,
}: AdminLayoutProps) {
  const { logout } = useAuth();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

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

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/admin">Admin</Link>

        <nav aria-label="Admin sections">
          {adminSections.map((section) => {
            if (section === "Developers") {
              return (
                <Link
                  key={section}
                  to="/admin/developers"
                >
                  {section}
                </Link>
              );
            }

            if (section === "Projects") {
              return (
                <Link
                  key={section}
                  to="/admin/projects"
                >
                  {section}
                </Link>
              );
            }

            if (section === "Media") {
              return (
                <Link
                  key={section}
                  to="/admin/media"
                >
                  {section}
                </Link>
              );
            }

            if (section === "Leads") {
              return (
                <Link
                  key={section}
                  to="/admin/leads"
                >
                  {section}
                </Link>
              );
            }

            if (section === "Import") {
              return (
                <Link
                  key={section}
                  to="/admin/import"
                >
                  {section}
                </Link>
              );
            }

            return (
              <span
                key={section}
                className="admin-nav-placeholder"
              >
                {section}
              </span>
            );
          })}
        </nav>

        <LeadNotificationControl />

        <button
          type="button"
          onClick={logout}
        >
          Logout
        </button>
      </aside>

      <main className="admin-content">
        {!isOnline && <p className="admin-offline-banner" role="status">You are offline. Live lead data is unavailable.</p>}
        {children}
      </main>
    </div>
  );
}
