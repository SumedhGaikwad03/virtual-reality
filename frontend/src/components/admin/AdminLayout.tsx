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

export function AdminLayout({ children }: AdminLayoutProps) {
  const { logout } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/admin">Admin</Link>
        <nav aria-label="Admin sections">
          {adminSections.map((section) => (
            section === "Developers" ? (
              <Link key={section} to="/admin/developers">{section}</Link>
            ) : section === "Projects" ? (
              <Link key={section} to="/admin/projects">{section}</Link>
            ) : section === "Leads" ? (
              <Link key={section} to="/admin/leads">{section}</Link>
            ) : section === "Import" ? (
              <Link key={section} to="/admin/import">{section}</Link>
            ) : section === "Media" ? (
              <Link key={section} to="/admin/projects">{section}</Link>
            ) : (
              <span key={section} className="admin-nav-placeholder">{section}</span>
            )
          ))}
        </nav>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
