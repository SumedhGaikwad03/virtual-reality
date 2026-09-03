/*
 * PURPOSE:
 * Admin project create, edit, highlights, and amenities management form page.
 *
 * FLOW:
 * Admin Project Management Flow
 *
 * RESPONSIBILITY:
 * Manages the form lifecycle for creating a new project or editing an existing project,
 * including developer selection, location fields, status enum, publication status controls,
 * project highlight authoring, slug conflict error handling, and structured project amenities CRUD management.
 */

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { getDevelopers } from "../../api/admin-developers";
import {
  createProject,
  createProjectAmenity,
  createProjectHighlight,
  deleteProjectAmenity,
  deleteProjectHighlight,
  getProject,
  updateProject,
  updateProjectAmenity,
  updateProjectHighlight,
} from "../../api/admin-projects";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ProjectWorkspaceNav } from "../../components/admin/ProjectWorkspaceNav";
import type { AdminDeveloper, PublishStatus } from "../../types/admin-developer";
import type {
  AdminProject,
  AdminProjectInput,
  ProjectAmenity,
  ProjectHighlight,
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
  const [success, setSuccess] = useState<string | null>(null);
  const [initialForm, setInitialForm] = useState<FormState>(emptyForm);
  const [developerError, setDeveloperError] = useState<string | null>(null);

  // Amenity Management State
  const [amenities, setAmenities] = useState<ProjectAmenity[]>([]);
  const [isAddingAmenity, setIsAddingAmenity] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState("");
  const [editingAmenityId, setEditingAmenityId] = useState<string | null>(null);
  const [editingAmenityName, setEditingAmenityName] = useState("");
  const [isAmenitySubmitting, setIsAmenitySubmitting] = useState(false);
  const [amenityError, setAmenityError] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<ProjectHighlight[]>([]);
  const [originalHighlights, setOriginalHighlights] = useState<ProjectHighlight[]>([]);
  const [highlightError, setHighlightError] = useState<string | null>(null);
  const [highlightSuccess, setHighlightSuccess] = useState<string | null>(null);
  const [isHighlightsSubmitting, setIsHighlightsSubmitting] = useState(false);

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
          const loadedForm = toForm(response.data);
          setForm(loadedForm);
          setInitialForm(loadedForm);
          setInitialForm(toForm(response.data));
          setAmenities(response.data.amenities ?? []);
          const loadedHighlights = response.data.highlights ?? [];
          setHighlights(loadedHighlights);
          setOriginalHighlights(loadedHighlights);
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

  async function persistHighlights(
    projectId: string,
    currentHighlights: ProjectHighlight[] = highlights,
  ) {
    const retainedIds = new Set(
      currentHighlights
        .filter((highlight) => !highlight.id.startsWith("new-"))
        .filter((highlight) => highlight.text.trim())
        .map((highlight) => highlight.id),
    );

    for (const highlight of originalHighlights) {
      if (!retainedIds.has(highlight.id)) {
        await deleteProjectHighlight(projectId, highlight.id);
      }
    }

    const persistedHighlights: ProjectHighlight[] = [];
    for (let index = 0; index < currentHighlights.length; index += 1) {
      const highlight = currentHighlights[index];
      const text = highlight.text.trim();
      if (!text) continue;

      if (highlight.id.startsWith("new-")) {
        const response = await createProjectHighlight(projectId, { text, sortOrder: index });
        persistedHighlights.push(response.data);
        continue;
      }

      const original = originalHighlights.find((item) => item.id === highlight.id);
      if (original?.text === text && original.sortOrder === index) {
        persistedHighlights.push({ ...highlight, text, sortOrder: index });
        continue;
      }

      const response = await updateProjectHighlight(projectId, highlight.id, {
        text,
        sortOrder: index,
      });
      persistedHighlights.push(response.data);
    }

    setHighlights(persistedHighlights);
    setOriginalHighlights(persistedHighlights);
  }

  async function handleSaveHighlights() {
    if (!id) {
      setHighlightError("Save the project first, then save its highlights.");
      return;
    }

    const nonEmptyHighlights = highlights.filter((highlight) => highlight.text.trim());
    if (highlights.length > 0 && nonEmptyHighlights.length === 0) {
      setHighlightError("Enter text for a highlight before saving.");
      return;
    }

    setHighlightError(null);
    setHighlightSuccess(null);
    setIsHighlightsSubmitting(true);
    try {
      if (nonEmptyHighlights.length !== highlights.length) {
        setHighlights(nonEmptyHighlights);
      }
      await persistHighlights(id, nonEmptyHighlights);
      setHighlightSuccess("Highlights saved successfully.");
    } catch (requestError) {
      setHighlightError(
        requestError instanceof AdminApiError
          ? requestError.message || "Unable to save highlights. Please try again."
          : "Unable to save highlights. Please try again.",
      );
    } finally {
      setIsHighlightsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
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
      let projectId = id;
      if (id) {
        await updateProject(id, payload);
      } else {
        const response = await createProject(payload);
        projectId = response.data.id;
      }

      if (projectId) await persistHighlights(projectId);
      if (id) {
        setInitialForm(form);
        setSuccess("Project saved successfully. Preview reflects saved data.");
      } else if (projectId) {
        navigate(`/admin/projects/${projectId}`, { replace: true });
      }
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
      setSuccess("Amenity saved successfully.");
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
      setSuccess("Amenity saved successfully.");
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
      setSuccess("Amenity removed successfully.");
    } catch {
      setAmenityError("Unable to delete amenity. Please try again.");
    }
  }

  if (isLoading || isLoadingDevelopers) {
    return <AdminLayout><p>Loading project...</p></AdminLayout>;
  }

  const highlightsDirty =
    JSON.stringify(highlights.map(({ id: _id, ...highlight }) => highlight)) !==
    JSON.stringify(originalHighlights.map(({ id: _id, ...highlight }) => highlight));

  return (
    <AdminLayout>
      <div className="admin-top-bar">
        <Link className="admin-action admin-action--secondary" to="/admin/projects">
          ← Back to Projects
        </Link>
      </div>
      {id && (
        <ProjectWorkspaceNav
          projectId={id}
          projectName={form.name}
          active="overview"
          previewHref={
            form.developerId && form.slug && form.locationSlug
              ? `/${developers.find((developer) => developer.id === form.developerId)?.slug ?? ""}/${form.locationSlug}/${form.slug}`
              : undefined
          }
        />
      )}
      {!id && <h1>Add Project</h1>}
      {id && (
        <>
          <h2>Project details</h2>
          <p className="admin-form-guidance">Required fields are marked by the browser. Save this section before opening the public preview.</p>
          {JSON.stringify(form) !== JSON.stringify(initialForm) && <p className="admin-unsaved-state">Unsaved project changes</p>}
          <div className="admin-project-readiness" aria-label="Project workspace status">
            <div><strong>Project details</strong><span className="admin-status-ready">Ready to edit</span></div>
            <div><strong>Highlights</strong><span>{highlights.length ? `${highlights.length} added` : "Optional · none added"}</span></div>
            <div><strong>Amenities</strong><span>{amenities.length ? `${amenities.length} added` : "Optional · none added"}</span></div>
            <div><strong>Media & configurations</strong><span>Manage from workspace sections</span></div>
          </div>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
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
        <button className="admin-action admin-action--primary" type="submit" disabled={isSubmitting || isHighlightsSubmitting || developers.length === 0}>{isSubmitting ? "Saving..." : "Save Project"}</button>
      </form>

      <section className="admin-highlights-section" id="highlights">
        <h2>Key Highlights</h2>
        <p>Optional selling points shown on the public project page. Save this section independently.</p>
        {highlightError && <p role="alert">{highlightError}</p>}
        {highlightSuccess && <p role="status">{highlightSuccess}</p>}
        {highlightsDirty && <p className="admin-unsaved-state">Unsaved highlight changes</p>}
        {highlights.length === 0 ? (
          <p>No highlights added yet.</p>
        ) : (
          <ol>
            {highlights.map((highlight, index) => (
              <li key={highlight.id}>
                <input
                  type="text"
                  aria-label={`Key highlight ${index + 1}`}
                  value={highlight.text}
                  onChange={(event) =>
                    setHighlights((current) =>
                      current.map((item) =>
                        item.id === highlight.id
                          ? { ...item, text: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => {
                    setHighlights((current) => current.filter((item) => item.id !== highlight.id));
                    setHighlightError(null);
                  }}
                >
                  Remove
                </button>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() =>
                    setHighlights((current) => {
                      const next = [...current];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      return next;
                    })
                  }
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={index === highlights.length - 1}
                  onClick={() =>
                    setHighlights((current) => {
                      const next = [...current];
                      [next[index], next[index + 1]] = [next[index + 1], next[index]];
                      return next;
                    })
                  }
                >
                  Move down
                </button>
              </li>
            ))}
          </ol>
        )}
        <div className="admin-highlights-actions">
          <button
            className="admin-action admin-action--secondary"
            type="button"
            disabled={highlights.length >= 12}
            onClick={() => {
              if (highlights.length >= 12) {
                setHighlightError("A project may have at most 12 highlights.");
                return;
              }
              setHighlights((current) => [
                ...current,
                { id: `new-${Date.now()}-${current.length}`, text: "", sortOrder: current.length },
              ]);
              setHighlightError(null);
            }}
          >
            + Add Highlight
          </button>
          <button
            className="admin-action admin-action--primary"
            type="button"
            onClick={handleSaveHighlights}
            disabled={!id || isSubmitting || isHighlightsSubmitting}
          >
            {isHighlightsSubmitting ? "Saving Highlights..." : "Save Highlights"}
          </button>
        </div>
        {!id && <p>Save the project first to persist its highlights.</p>}
        <p>Highlights are optional. Blank unsaved rows are ignored when saved.</p>
      </section>

      {id && (
        <section className="admin-amenities-section" id="amenities">
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
                      <button className="admin-action admin-action--primary admin-action--utility" type="submit" disabled={isAmenitySubmitting}>Save</button>
                      <button className="admin-action admin-action--secondary admin-action--utility" type="button" onClick={() => setEditingAmenityId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <span className="admin-amenity-name">{amenity.name}</span>
                      <div className="admin-amenity-actions">
                        <button
                          className="admin-action admin-action--utility"
                          type="button"
                          onClick={() => {
                            setEditingAmenityId(amenity.id);
                            setEditingAmenityName(amenity.name);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-action admin-action--utility admin-action--danger"
                          type="button"
                          onClick={() => handleDeleteAmenity(amenity.id)}
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
                <button className="admin-action admin-action--primary" type="submit" disabled={isAmenitySubmitting}>
                  {isAmenitySubmitting ? "Saving..." : "Save Amenity"}
                </button>
                <button className="admin-action admin-action--secondary" type="button" onClick={() => setIsAddingAmenity(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              className="admin-action admin-action--secondary"
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
