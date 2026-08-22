import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { getDevelopers } from "../../api/admin-developers";
import { createProject, getProject, getProjects, updateProject } from "../../api/admin-projects";
import { AdminLayout } from "../../components/admin/AdminLayout";
import type { AdminDeveloper } from "../../types/admin-developer";
import type { AdminProject, AdminProjectInput, ProjectStatus } from "../../types/admin-project";

type FormState = {
  developerId: string;
  name: string;
  slug: string;
  description: string;
  locationName: string;
  locationSlug: string;
  address: string;
  mapsUrl: string;
  status: ProjectStatus;
  featured: boolean;
};

const statuses: ProjectStatus[] = [
  "UPCOMING",
  "ONGOING",
  "READY_TO_MOVE",
  "COMPLETED",
  "SOLD_OUT",
];

const emptyForm: FormState = {
  developerId: "",
  name: "",
  slug: "",
  description: "",
  locationName: "",
  locationSlug: "",
  address: "",
  mapsUrl: "",
  status: "UPCOMING",
  featured: false,
};

function errorMessage(error: unknown, context: "list" | "load" | "save" | "developers") {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (error.status === 400) return "Please check the project details and try again.";
  if (error.status === 404) {
    if (context === "developers") return "Developer not found.";
    if (context === "load") return "Project not found.";
    if (context === "save") return "Project or developer not found.";
  }
  if (error.status === 409) return "That project slug is already in use.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  return context === "save"
    ? "Unable to save project. Please try again."
    : "Unable to load projects. Please try again.";
}

function toForm(project: AdminProject): FormState {
  return {
    developerId: project.developerId,
    name: project.name,
    slug: project.slug,
    description: project.description ?? "",
    locationName: project.locationName,
    locationSlug: project.locationSlug,
    address: project.address,
    mapsUrl: project.mapsUrl ?? "",
    status: project.status,
    featured: project.featured,
  };
}

function cleanPayload(form: FormState): AdminProjectInput {
  const payload: AdminProjectInput = {
    developerId: form.developerId,
    name: form.name.trim(),
    slug: form.slug.trim(),
    locationName: form.locationName.trim(),
    locationSlug: form.locationSlug.trim(),
    address: form.address.trim(),
    status: form.status,
    featured: form.featured,
  };
  if (form.description.trim()) payload.description = form.description.trim();
  if (form.mapsUrl.trim()) payload.mapsUrl = form.mapsUrl.trim();
  return payload;
}

export function ProjectsPage() {
  const navigate = useNavigate();

  return (
    <ProjectListPage
      onAdd={() => navigate("/admin/projects/new")}
    />
  );
}

function ProjectListPage({ onAdd }: { onAdd: () => void }) {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProjects()
      .then((response) => {
        if (active) setProjects(response.data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(errorMessage(requestError, "list"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <h1>Projects</h1>
          <p>Manage the projects shown on the public site.</p>
        </div>
        <button type="button" onClick={onAdd}>Add Project</button>
      </div>
      {isLoading && <p>Loading projects...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && projects.length === 0 && (
        <section className="admin-card"><p>No projects found.</p></section>
      )}
      {!isLoading && !error && projects.length > 0 && (
        <div className="admin-card admin-project-list">
          {projects.map((project) => (
            <article className="admin-project-row" key={project.id}>
              <div>
                <h2>{project.name}</h2>
                <p>{project.slug}</p>
              </div>
              <p>{project.developer.name}</p>
              <p>{project.locationName}</p>
              <p>{project.status}{project.featured ? " · Featured" : ""}</p>
              <Link to={`/admin/projects/${project.id}`}>View / Edit</Link>
              <Link to={`/admin/projects/${project.id}/configurations`}>Configurations</Link>
              <Link to={`/admin/projects/${project.id}/media`}>Media</Link>
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [developers, setDevelopers] = useState<AdminDeveloper[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isLoadingDevelopers, setIsLoadingDevelopers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [developerError, setDeveloperError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getDevelopers()
      .then((response) => {
        if (active) setDevelopers(response.data);
      })
      .catch((requestError: unknown) => {
        if (active) setDeveloperError(errorMessage(requestError, "developers"));
      })
      .finally(() => {
        if (active) setIsLoadingDevelopers(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getProject(id)
      .then((response) => {
        if (active) setForm(toForm(response.data));
      })
      .catch((requestError: unknown) => {
        if (active) setError(errorMessage(requestError, "load"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const payload = cleanPayload(form);
    if (!payload.developerId) {
      setError("Select a developer before saving the project.");
      return;
    }
    if (!payload.name || !payload.slug || !payload.locationName || !payload.locationSlug || !payload.address) {
      setError("Name, slug, location, location slug, and address are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = id
        ? await updateProject(id, payload)
        : await createProject(payload);
      navigate("/admin/projects", { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError, "save"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isLoadingDevelopers) {
    return <AdminLayout><p>Loading project...</p></AdminLayout>;
  }

  return (
    <AdminLayout>
      <p><Link to="/admin/projects">← Projects</Link></p>
      <h1>{id ? "Edit Project" : "Add Project"}</h1>
      {id && <p><Link to={`/admin/projects/${id}/configurations`}>Manage configurations</Link></p>}
      {id && <p><Link to={`/admin/projects/${id}/media`}>Manage media</Link></p>}
      {error && <p role="alert">{error}</p>}
      {developerError && <p role="alert">{developerError}</p>}
      {!developerError && developers.length === 0 && (
        <p role="alert">No developers available. Create a developer first.</p>
      )}
      <form className="admin-project-form" onSubmit={handleSubmit}>
        <label>Developer<select required value={form.developerId} onChange={(event) => setField("developerId", event.target.value)} disabled={developers.length === 0}>
          <option value="">Select a developer</option>
          {developers.map((developer) => <option key={developer.id} value={developer.id}>{developer.name}</option>)}
        </select></label>
        <label>Name<input required value={form.name} onChange={(event) => setField("name", event.target.value)} /></label>
        <label>Slug<input required value={form.slug} onChange={(event) => setField("slug", event.target.value)} /></label>
        <label>Description<textarea value={form.description} onChange={(event) => setField("description", event.target.value)} /></label>
        <label>Location name<input required value={form.locationName} onChange={(event) => setField("locationName", event.target.value)} /></label>
        <label>Location slug<input required value={form.locationSlug} onChange={(event) => setField("locationSlug", event.target.value)} /></label>
        <label>Address<textarea required value={form.address} onChange={(event) => setField("address", event.target.value)} /></label>
        <label>Maps URL<input type="url" value={form.mapsUrl} onChange={(event) => setField("mapsUrl", event.target.value)} /></label>
        <label>Status<select required value={form.status} onChange={(event) => setField("status", event.target.value as ProjectStatus)}>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select></label>
        <label className="admin-checkbox"><input type="checkbox" checked={form.featured} onChange={(event) => setField("featured", event.target.checked)} /> Featured</label>
        <button type="submit" disabled={isSubmitting || developers.length === 0}>{isSubmitting ? "Saving..." : "Save Project"}</button>
      </form>
    </AdminLayout>
  );
}
