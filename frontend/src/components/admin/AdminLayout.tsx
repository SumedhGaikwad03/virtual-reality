import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import type { ReactNode } from "react";

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

        <button
          type="button"
          onClick={logout}
        >
          Logout
        </button>
      </aside>

      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}