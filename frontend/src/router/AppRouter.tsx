import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { FounderRoute, ProtectedRoute } from "../auth/ProtectedRoute";

import { DeveloperPage } from "../pages/DeveloperPage";
import { EnquiryPage } from "../pages/EnquiryPage";
import { HomePage } from "../pages/HomePage";
import { ListPropertyPage } from "../pages/ListPropertyPage";
import { PrivacyPolicyPage } from "../pages/PrivacyPolicyPage";
import { ProjectPage } from "../pages/ProjectPage";
import { RentalsPage } from "../pages/RentalsPage";
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
const VisitsPage = lazy(() =>
  import("../pages/admin/VisitsPage").then((m) => ({ default: m.VisitsPage })),
);
const LeadDetailPage = lazy(() =>
  import("../pages/admin/LeadDetailPage").then((m) => ({ default: m.LeadDetailPage })),
);
const LeadFormPage = lazy(() =>
  import("../pages/admin/LeadFormPage").then((m) => ({ default: m.LeadFormPage })),
);
const RentalEnquiriesPage = lazy(() =>
  import("../pages/admin/RentalEnquiriesPage").then((m) => ({ default: m.RentalEnquiriesPage })),
);
const RentalEnquiryDetailPage = lazy(() =>
  import("../pages/admin/RentalEnquiryDetailPage").then((m) => ({ default: m.RentalEnquiryDetailPage })),
);
const RentalAvailablePage = lazy(() =>
  import("../pages/admin/RentalAvailablePage").then((m) => ({ default: m.RentalAvailablePage })),
);
const RentalAvailableDetailPage = lazy(() =>
  import("../pages/admin/RentalAvailableDetailPage").then((m) => ({ default: m.RentalAvailableDetailPage })),
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
const AdminLocationsPage = lazy(() =>
  import("../pages/admin/AdminLocationsPage").then((m) => ({ default: m.AdminLocationsPage })),
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
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <DevelopersPage />
            </Suspense>
          </FounderRoute>
        }
      />

      <Route
        path="/admin/developers/new"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <DeveloperFormPage />
            </Suspense>
          </FounderRoute>
        }
      />

      <Route
        path="/admin/developers/:id"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <DeveloperFormPage />
            </Suspense>
          </FounderRoute>
        }
      />

      {/* Admin projects */}
      <Route
        path="/admin/projects"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ProjectsPage />
            </Suspense>
          </FounderRoute>
        }
      />

      <Route
        path="/admin/projects/new"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ProjectFormPage />
            </Suspense>
          </FounderRoute>
        }
      />

      <Route
        path="/admin/projects/:id"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ProjectFormPage />
            </Suspense>
          </FounderRoute>
        }
      />

      {/* Project configurations */}
      <Route
        path="/admin/projects/:projectId/configurations"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ProjectConfigurationsPage />
            </Suspense>
          </FounderRoute>
        }
      />

      <Route
        path="/admin/projects/:projectId/configurations/new"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ConfigurationFormPage />
            </Suspense>
          </FounderRoute>
        }
      />

      <Route
        path="/admin/configurations/:id"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ConfigurationFormPage />
            </Suspense>
          </FounderRoute>
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

      {/* Admin scheduled property visits */}
      <Route
        path="/admin/visits"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <VisitsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/leads/new"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <LeadFormPage />
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

      <Route
        path="/admin/leads/:id/edit"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <LeadFormPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin rental enquiries */}
      <Route
        path="/admin/rentals/enquiries"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <RentalEnquiriesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/rentals/enquiries/:id"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <RentalEnquiryDetailPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin available rental properties */}
      <Route
        path="/admin/rentals/available"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <RentalAvailablePage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/rentals/available/:id"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <RentalAvailableDetailPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin import */}
      <Route
        path="/admin/import"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ImportPage />
            </Suspense>
          </FounderRoute>
        }
      />

      {/* Admin media */}
      <Route
        path="/admin/media"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <HomeMediaPage />
            </Suspense>
          </FounderRoute>
        }
      />

      <Route
        path="/admin/projects/:projectId/media"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ProjectMediaPage />
            </Suspense>
          </FounderRoute>
        }
      />

      <Route
        path="/admin/configurations/:configurationId/media"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ConfigurationMediaPage />
            </Suspense>
          </FounderRoute>
        }
      />

      {/* Admin firm contact configuration */}
      <Route
        path="/admin/contact"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <ContactPage />
            </Suspense>
          </FounderRoute>
        }
      />

      {/* Admin firm profile and founder configuration */}
      <Route
        path="/admin/firm-profile"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <FirmProfilePage />
            </Suspense>
          </FounderRoute>
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

      {/* Admin employee locations (Founder-only) */}
      <Route
        path="/admin/locations"
        element={
          <FounderRoute>
            <Suspense fallback={<AdminSuspenseFallback />}>
              <AdminLocationsPage />
            </Suspense>
          </FounderRoute>
        }
      />

      {/* Public routes wrapped in shared PublicShell layout */}
      <Route element={<PublicShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/firm" element={<HomePage />} />
        <Route path="/rentals" element={<RentalsPage />} />
        <Route path="/rentals/list-property" element={<ListPropertyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/:developerSlug/:locationSlug/:projectSlug"
          element={<ProjectPage />}
        />
        <Route path="/:developerSlug" element={<DeveloperPage />} />
      </Route>

      {/* Standalone customer property brief route (no header/footer/Tara/advisory popups) */}
      <Route path="/enquiry" element={<EnquiryPage />} />
    </Routes>
  );
}