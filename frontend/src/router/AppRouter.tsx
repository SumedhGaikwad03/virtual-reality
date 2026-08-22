import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../auth/ProtectedRoute";

import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import {
  DeveloperFormPage,
  DevelopersPage,
} from "../pages/admin/DevelopersPage";
import {
  ProjectFormPage,
  ProjectsPage,
} from "../pages/admin/ProjectsPage";
import { ProjectConfigurationsPage } from "../pages/admin/ProjectConfigurationsPage";
import { ConfigurationFormPage } from "../pages/admin/ConfigurationFormPage";
import { LeadsPage } from "../pages/admin/LeadsPage";
import { LeadDetailPage } from "../pages/admin/LeadDetailPage";
import { ImportPage } from "../pages/admin/ImportPage";
import {
  ProjectMediaPage,
  ConfigurationMediaPage,
} from "../pages/admin/ProjectMediaPage";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";

import { DeveloperPage } from "../pages/DeveloperPage";
import { HomePage } from "../pages/HomePage";
import { ProjectPage } from "../pages/ProjectPage";
import { SearchPage } from "../pages/SearchPage";

export function AppRouter() {
  return (
    <Routes>
      {/* Admin authentication */}
      <Route
        path="/admin/login"
        element={<AdminLoginPage />}
      />

      {/* Admin dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Admin developers */}
      <Route
        path="/admin/developers"
        element={
          <ProtectedRoute>
            <DevelopersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/developers/new"
        element={
          <ProtectedRoute>
            <DeveloperFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/developers/:id"
        element={
          <ProtectedRoute>
            <DeveloperFormPage />
          </ProtectedRoute>
        }
      />

      {/* Admin projects */}
      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/projects/new"
        element={
          <ProtectedRoute>
            <ProjectFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectFormPage />
          </ProtectedRoute>
        }
      />

      {/* Project configurations */}
      <Route
        path="/admin/projects/:projectId/configurations"
        element={
          <ProtectedRoute>
            <ProjectConfigurationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/projects/:projectId/configurations/new"
        element={
          <ProtectedRoute>
            <ConfigurationFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/configurations/:id"
        element={
          <ProtectedRoute>
            <ConfigurationFormPage />
          </ProtectedRoute>
        }
      />

      {/* Admin leads */}
      <Route
        path="/admin/leads"
        element={
          <ProtectedRoute>
            <LeadsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/leads/:id"
        element={
          <ProtectedRoute>
            <LeadDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Admin import */}
      <Route
        path="/admin/import"
        element={
          <ProtectedRoute>
            <ImportPage />
          </ProtectedRoute>
        }
      />

      {/* Admin media */}
      <Route
        path="/admin/projects/:projectId/media"
        element={
          <ProtectedRoute>
            <ProjectMediaPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/configurations/:configurationId/media"
        element={
          <ProtectedRoute>
            <ConfigurationMediaPage />
          </ProtectedRoute>
        }
      />

      {/* Public routes */}
      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/search"
        element={<SearchPage />}
      />

      <Route
        path="/:developerSlug/:locationSlug/:projectSlug"
        element={<ProjectPage />}
      />

      <Route
        path="/:developerSlug"
        element={<DeveloperPage />}
      />
    </Routes>
  );
}