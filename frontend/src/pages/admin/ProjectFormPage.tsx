/*
 * PURPOSE:
 * Admin project create, edit, and amenities management form page.
 *
 * FLOW:
 * Admin Project Management Flow
 *
 * RESPONSIBILITY:
 * Manages the form lifecycle for creating a new project or editing an existing project,
 * including developer selection, location fields, status enum, publication status controls,
 * slug conflict error handling, and structured project amenities CRUD management (View, Add, Edit, Delete).
 */

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { getDevelopers } from "../../api/admin-developers";
import {
  createProject,
  createProjectAmenity,
  deleteProjectAmenity,
  getProject,
  updateProject,
  updateProjectAmenity,
} from "../../api/admin-projects";
import { AdminLayout } from "../../components/admin/AdminLayout";
import type { AdminDeveloper, PublishStatus } from "../../types/admin-developer";
import type {
  AdminProject,
  AdminProjectInput,
  ProjectAmenity,
  ProjectStatus,
} from "../../types/admin-project";

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
  publishStatus: PublishStatus;
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
  publishStatus: "DRAFT",
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
    publishStatus: project.publishStatus,
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
    publishStatus: form.publishStatus,
  };
  if (form.description.trim()) payload.description = form.description.trim();
  if (form.mapsUrl.trim()) payload.mapsUrl = form.mapsUrl.trim();
  return payload;
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

  // Amenity Management State
  const [amenities, setAmenities] = useState<ProjectAmenity[]>([]);
  const [isAddingAmenity, setIsAddingAmenity] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState("");
  const [editingAmenityId, setEditingAmenityId] = useState<string | null>(null);
  const [editingAmenityName, setEditingAmenityName] = useState("");
  const [isAmenitySubmitting, setIsAmenitySubmitting] = useState(false);
  const [amenityError, setAmenityError] = useState<string | null>(null);

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
        if (active) {
          setForm(toForm(response.data));
          setAmenities(response.data.amenities ?? []);
        }
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
      if (id) {
        await updateProject(id, payload);
      } else {
        await createProject(payload);
      }
      navigate("/admin/projects", { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError, "save"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddAmenity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    const name = newAmenityName.trim();
    if (!name) {
      setAmenityError("Amenity name is required.");
      return;
    }
    setAmenityError(null);
    setIsAmenitySubmitting(true);
    try {
      const response = await createProjectAmenity(id, { name });
      setAmenities((prev) => [...prev, response.data].sort((a, b) => a.sortOrder - b.sortOrder));
      setNewAmenityName("");
      setIsAddingAmenity(false);
    } catch (requestError) {
      if (requestError instanceof AdminApiError && requestError.status === 400) {
        setAmenityError(requestError.message || "An amenity with this name already exists.");
      } else {
        setAmenityError("Unable to add amenity. Please try again.");
      }
    } finally {
      setIsAmenitySubmitting(false);
    }
  }

  async function handleSaveEditAmenity(amenityId: string) {
    if (!id) return;
    const name = editingAmenityName.trim();
    if (!name) {
      setAmenityError("Amenity name cannot be empty.");
      return;
    }
    setAmenityError(null);
    setIsAmenitySubmitting(true);
    try {
      const response = await updateProjectAmenity(id, amenityId, { name });
      setAmenities((prev) =>
        prev
          .map((item) => (item.id === amenityId ? response.data : item))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setEditingAmenityId(null);
      setEditingAmenityName("");
    } catch (requestError) {
      if (requestError instanceof AdminApiError && requestError.status === 400) {
        setAmenityError(requestError.message || "Unable to update amenity.");
      } else {
        setAmenityError("Unable to update amenity. Please try again.");
      }
    } finally {
      setIsAmenitySubmitting(false);
    }
  }

  async function handleDeleteAmenity(amenityId: string) {
    if (!id) return;
    setAmenityError(null);
    try {
      await deleteProjectAmenity(id, amenityId);
      setAmenities((prev) => prev.filter((item) => item.id !== amenityId));
    } catch {
      setAmenityError("Unable to delete amenity. Please try again.");
    }
  }

  if (isLoading || isLoadingDevelopers) {
    return <AdminLayout><p>Loading project...</p></AdminLayout>;
  }

  return (
    <AdminLayout>
      <p><Link to="/admin/projects">← Projects</Link></p>
      <h1>{id ? "Edit Project" : "Add Project"}</h1>
      {id && (
        <p>
          <Link to={`/admin/projects/${id}/configurations`}>Manage configurations</Link>
          {" · "}
          <Link to={`/admin/projects/${id}/media`}>Manage media</Link>
        </p>
      )}
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
        <label>
          Publish status
          <select
            value={form.publishStatus}
            onChange={(event) =>
              setField(
                "publishStatus",
                event.target.value as PublishStatus,
              )
            }
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <small>
            {form.publishStatus === "PUBLISHED"
              ? "Available on the public website when its developer is also published."
              : "Not visible on the public website."}
          </small>
        </label>
        <label className="admin-checkbox"><input type="checkbox" checked={form.featured} onChange={(event) => setField("featured", event.target.checked)} /> Featured</label>
        <button type="submit" disabled={isSubmitting || developers.length === 0}>{isSubmitting ? "Saving..." : "Save Project"}</button>
      </form>

      {id && (
        <section className="admin-amenities-section">
          <h2>Project Amenities</h2>
          <p className="admin-amenities-subtitle">
            Manage lifestyle features and community amenities for this project.
          </p>
          {amenityError && <p role="alert" style={{ color: "#ef4444" }}>{amenityError}</p>}

          {amenities.length === 0 ? (
            <p className="empty-amenities-text">No amenities added yet.</p>
          ) : (
            <ul className="admin-amenities-list">
              {amenities.map((amenity) => (
                <li key={amenity.id} className="admin-amenity-row">
                  {editingAmenityId === amenity.id ? (
                    <form
                      className="admin-amenity-edit-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveEditAmenity(amenity.id);
                      }}
                    >
                      <input
                        type="text"
                        required
                        value={editingAmenityName}
                        onChange={(e) => setEditingAmenityName(e.target.value)}
                      />
                      <button type="submit" disabled={isAmenitySubmitting}>Save</button>
                      <button type="button" onClick={() => setEditingAmenityId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <span className="admin-amenity-name">{amenity.name}</span>
                      <div className="admin-amenity-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAmenityId(amenity.id);
                            setEditingAmenityName(amenity.name);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAmenity(amenity.id)}
                          style={{ color: "#ef4444" }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isAddingAmenity ? (
            <form className="admin-amenity-add-form" onSubmit={handleAddAmenity}>
              <label>
                Amenity name
                <input
                  type="text"
                  required
                  placeholder="e.g. Swimming Pool, Gymnasium"
                  value={newAmenityName}
                  onChange={(e) => setNewAmenityName(e.target.value)}
                />
              </label>
              <div className="admin-amenity-form-actions">
                <button type="submit" disabled={isAmenitySubmitting}>
                  {isAmenitySubmitting ? "Saving..." : "Save Amenity"}
                </button>
                <button type="button" onClick={() => setIsAddingAmenity(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingAmenity(true)}
            >
              + Add Amenity
            </button>
          )}
        </section>
      )}
    </AdminLayout>
  );
}
