import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { FounderRoute, ProtectedRoute } from "../auth/ProtectedRoute";

import { DeveloperPage } from "../pages/DeveloperPage";
import { HomePage } from "../pages/HomePage";
import { ProjectPage } from "../pages/ProjectPage";
import { SearchPage } from "../pages/SearchPage";
import { PublicShell } from "../components/shell/PublicShell";

// Lazy-loaded administrative pages (downloaded on demand only when accessing /admin)
const AdminLoginPage = lazy(() =>
  import("../pages/admin/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })),
);
const AdminDashboardPage = lazy(() =>
  import("../pages/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })),
);
const DevelopersPage = lazy(() =>
  import("../pages/admin/DevelopersPage").then((m) => ({ default: m.DevelopersPage })),
);
const DeveloperFormPage = lazy(() =>
  import("../pages/admin/DevelopersPage").then((m) => ({ default: m.DeveloperFormPage })),
);
const ProjectsPage = lazy(() =>
  import("../pages/admin/ProjectsPage").then((m) => ({ default: m.ProjectsPage })),
);
const ProjectFormPage = lazy(() =>
  import("../pages/admin/ProjectsPage").then((m) => ({ default: m.ProjectFormPage })),
);
const ProjectConfigurationsPage = lazy(() =>
  import("../pages/admin/ProjectConfigurationsPage").then((m) => ({ default: m.ProjectConfigurationsPage })),
);
const ConfigurationFormPage = lazy(() =>
  import("../pages/admin/ConfigurationFormPage").then((m) => ({ default: m.ConfigurationFormPage })),
);
const LeadsPage = lazy(() =>
  import("../pages/admin/LeadsPage").then((m) => ({ default: m.LeadsPage })),
);
const LeadDetailPage = lazy(() =>
  import("../pages/admin/LeadDetailPage").then((m) => ({ default: m.LeadDetailPage })),
);
const ImportPage = lazy(() =>
  import("../pages/admin/ImportPage").then((m) => ({ default: m.ImportPage })),
);
const HomeMediaPage = lazy(() =>
  import("../pages/admin/HomeMediaPage").then((m) => ({ default: m.HomeMediaPage })),
);
const ProjectMediaPage = lazy(() =>
  import("../pages/admin/ProjectMediaPage").then((m) => ({ default: m.ProjectMediaPage })),
);
const ConfigurationMediaPage = lazy(() =>
  import("../pages/admin/ConfigurationMediaPage").then((m) => ({ default: m.ConfigurationMediaPage })),
);
const ContactPage = lazy(() =>
  import("../pages/admin/ContactPage").then((m) => ({ default: m.ContactPage })),
);
const FirmProfilePage = lazy(() =>
  import("../pages/admin/FirmProfilePage").then((m) => ({ default: m.FirmProfilePage })),
);
const AdminAccountsPage = lazy(() =>
  import("../pages/admin/AdminAccountsPage").then((m) => ({ default: m.AdminAccountsPage })),
);
const CreateAdminPage = lazy(() =>
  import("../pages/admin/CreateAdminPage").then((m) => ({ default: m.CreateAdminPage })),
);

function AdminSuspenseFallback() {
  return (
    <div className="admin-page-loading" role="status" aria-live="polite">
      <p>Loading...</p>
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      {/* Admin authentication */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<AdminSuspenseFallback />}>
            <AdminLoginPage />
          </Suspense>
        }
      />

      {/* Admin dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <AdminDashboardPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin developers */}
      <Route
        path="/admin/developers"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <DevelopersPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/developers/new"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <DeveloperFormPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/developers/:id"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <DeveloperFormPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin projects */}
      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ProjectsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/projects/new"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ProjectFormPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/projects/:id"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ProjectFormPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Project configurations */}
      <Route
        path="/admin/projects/:projectId/configurations"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ProjectConfigurationsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/projects/:projectId/configurations/new"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ConfigurationFormPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/configurations/:id"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ConfigurationFormPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin leads */}
      <Route
        path="/admin/leads"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <LeadsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/leads/:id"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <LeadDetailPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin import */}
      <Route
        path="/admin/import"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ImportPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin media */}
      <Route
        path="/admin/media"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <HomeMediaPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/projects/:projectId/media"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ProjectMediaPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/configurations/:configurationId/media"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ConfigurationMediaPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin firm contact configuration */}
      <Route
        path="/admin/contact"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ContactPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin firm profile and founder configuration */}
      <Route
        path="/admin/firm-profile"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <FirmProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin account management & provisioning */}
      <Route
        path="/admin/accounts"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <AdminAccountsPage />
            </Suspense>
          </FounderRoute>
        }
      />

      <Route
        path="/admin/accounts/new"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <CreateAdminPage />
            </Suspense>
          </FounderRoute>
        }
      />

      {/* Public routes wrapped in shared PublicShell layout */}
      <Route element={<PublicShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/firm" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/:developerSlug/:locationSlug/:projectSlug"
          element={<ProjectPage />}
        />
        <Route path="/:developerSlug" element={<DeveloperPage />} />
      </Route>
    </Routes>
  );
}