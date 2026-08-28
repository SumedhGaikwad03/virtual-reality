/*
 * PURPOSE:
 * Admin project media management page.
 *
 * FLOW:
 * Project Media Management Flow
 *
 * RESPONSIBILITY:
 * Manages project-level media assets (HERO, HERO_CAROUSEL, GALLERY, EXTERIOR, INTERIOR, LOCATION, CONSTRUCTION, PROJECT_VIDEO).
 * Handles file uploads to Cloudinary, metadata editing, activation toggling, and category grouping.
 */

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AdminApiError } from "../../api/admin-client";
import { getProject } from "../../api/admin-projects";
import {
  getProjectMedia,
  updateMedia,
  uploadMedia,
} from "../../api/admin-media";
import { AdminLayout } from "../../components/admin/AdminLayout";

import type { AdminProject } from "../../types/admin-project";
import type {
  AdminMedia,
  MediaCategory,
  MediaMetadataInput,
  MediaType,
} from "../../types/admin-media";

// Project-level media categories allowed for upload and presentation
const projectCategories: MediaCategory[] = [
  "HERO",
  "HERO_CAROUSEL",
  "GALLERY",
  "EXTERIOR",
  "INTERIOR",
  "LOCATION",
  "CONSTRUCTION",
  "PROJECT_VIDEO",
];

const mediaTypes: MediaType[] = ["IMAGE", "VIDEO", "DOCUMENT"];

const categoryLabels: Record<MediaCategory, string> = {
  HERO: "Hero",
  HERO_CAROUSEL: "Hero Carousel",
  GALLERY: "Gallery",
  EXTERIOR: "Exterior",
  INTERIOR: "Interior",
  LOCATION: "Location",
  CONSTRUCTION: "Construction",
  PROJECT_VIDEO: "Project Video",
  CARD: "Card",
  AMENITY: "Amenity",
  FLOOR_PLAN: "Floor Plan",
  BROCHURE: "Brochure",
};

const categoryDescriptions: Record<string, string> = {
  HERO: "A dominant project image.",
  HERO_CAROUSEL:
    "Multiple prominent images intended for a rotating presentation.",
  GALLERY: "A browsable collection of project images.",
  EXTERIOR: "Exterior, property, and building images.",
  INTERIOR: "Interior space and unit images.",
  LOCATION: "Location and neighborhood maps or views.",
  CONSTRUCTION: "Construction updates and progress images.",
  PROJECT_VIDEO: "Project video assets.",
};

function errorMessage(
  error: unknown,
  action: "load" | "upload" | "update",
) {
  if (!(error instanceof AdminApiError)) {
    return "Something went wrong. Please try again.";
  }

  if (error.status === 400) {
    return action === "upload"
      ? "Please check the media type, file, and fields."
      : "Please check the media metadata.";
  }

  if (error.status === 404) {
    return "Project not found.";
  }

  if (error.status === 413) {
    return "The selected file is too large.";
  }

  if (error.status === null) {
    return "Unable to reach the server. Please try again.";
  }

  if (action === "upload") {
    return "Unable to upload media. Please try again.";
  }

  if (action === "update") {
    return "Unable to update media. Please try again.";
  }

  return "Unable to load media. Please try again.";
}

export function ProjectMediaPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const [project, setProject] = useState<AdminProject | null>(null);
  const [media, setMedia] = useState<AdminMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadMedia() {
    if (!projectId) return;

    try {
      const response = await getProjectMedia(projectId);
      setMedia(response.data);
    } catch (requestError) {
      setError(errorMessage(requestError, "load"));
    }
  }

  useEffect(() => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    let active = true;

    // Load parent project and its media assets in parallel
    Promise.all([getProject(projectId), getProjectMedia(projectId)])
      .then(([projectResponse, mediaResponse]) => {
        if (!active) return;
        setProject(projectResponse.data);
        setMedia(mediaResponse.data);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(errorMessage(requestError, "load"));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [projectId]);

  async function handleUpload(input: {
    file: File;
    type: MediaType;
    category: MediaCategory;
    slot?: string;
    title?: string;
    altText?: string;
    sortOrder: number;
    isPrimary: boolean;
  }) {
    if (!projectId || !project) {
      setError("Project is missing.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsUploading(true);

    try {
      // Project media requires context: "PROJECT", valid projectId, and valid developerId
      await uploadMedia({
        file: input.file,
        context: "PROJECT",
        type: input.type,
        category: input.category,
        projectId: project.id,
        developerId: project.developerId,
        slot: input.slot,
        title: input.title,
        altText: input.altText,
        sortOrder: input.sortOrder,
        isPrimary: input.isPrimary,
      });

      await loadMedia();
      setSuccess("Media uploaded successfully.");
    } catch (requestError) {
      setError(errorMessage(requestError, "upload"));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleToggle(mediaItem: AdminMedia) {
    setError(null);
    setSuccess(null);

    try {
      // Modifies isActive status on the database record without deleting the Cloudinary asset
      const response = await updateMedia(mediaItem.id, {
        isActive: !mediaItem.isActive,
      });

      setMedia((current) =>
        current.map((item) =>
          item.id === mediaItem.id ? response.data : item,
        ),
      );
      setSuccess(
        `Media ${!mediaItem.isActive ? "activated" : "deactivated"} successfully.`,
      );
    } catch (requestError) {
      setError(errorMessage(requestError, "update"));
    }
  }

  async function handleUpdate(
    id: string,
    payload: MediaMetadataInput,
  ) {
    setError(null);
    setSuccess(null);

    try {
      const response = await updateMedia(id, payload);

      setMedia((current) =>
        current.map((item) =>
          item.id === id ? response.data : item,
        ),
      );

      setEditingId(null);
      setSuccess("Media metadata updated.");
    } catch (requestError) {
      setError(errorMessage(requestError, "update"));
    }
  }

  const groupedMedia = useMemo(() => {
    return projectCategories.map((category) => ({
      category,
      label: categoryLabels[category] ?? category,
      description: categoryDescriptions[category] ?? "",
      items: media
        .filter((item) => item.category === category)
        .sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder;
          }
          return a.createdAt.localeCompare(b.createdAt);
        }),
    }));
  }, [media]);

  const uncategorizedMedia = useMemo(() => {
    return media
      .filter((item) => !projectCategories.includes(item.category))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [media]);

  if (!projectId) {
    return (
      <AdminLayout>
        <p role="alert">Project ID could not be determined.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <p>
        <Link to="/admin/projects">← Projects</Link>
        {project && (
          <>
            {" "}· <Link to={`/admin/projects/${projectId}`}>View Project</Link>
            {" "}· <Link to={`/admin/projects/${projectId}/configurations`}>Configurations</Link>
          </>
        )}
      </p>

      {isLoading && <p>Loading project media...</p>}

      {error && <p role="alert">{error}</p>}

      {success && <p role="status">{success}</p>}

      {!isLoading && project && (
        <>
          <div className="admin-page-heading">
            <div>
              <p>Project Media</p>
              <h1>{project.name}</h1>
              <p>
                {project.developer?.name ?? "Developer"} · {project.locationName} · Manage images, videos, and media assets organized by category.
              </p>
            </div>
          </div>

          <section className="admin-card">
            <h2>Upload Project Media</h2>
            <ProjectMediaUploadForm
              isUploading={isUploading}
              onSubmit={handleUpload}
            />
          </section>

          <h2>Current Project Media</h2>

          {media.length === 0 ? (
            <section className="admin-card">
              <p>No media found for this project. Upload your first media asset above.</p>
            </section>
          ) : (
            <>
              {groupedMedia.map(({ category, label, description, items }) => (
                <section className="admin-card" key={category} style={{ marginBottom: "1.5rem" }}>
                  <div className="admin-page-heading">
                    <div>
                      <h3>{label}</h3>
                      <p>{description}</p>
                    </div>
                    <p>
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </p>
                  </div>

                  {items.length === 0 ? (
                    <p>No {label.toLowerCase()} media yet.</p>
                  ) : (
                    <div className="admin-media-list">
                      {items.map((item) => (
                        <ProjectMediaCard
                          key={item.id}
                          media={item}
                          isEditing={editingId === item.id}
                          onEdit={() => setEditingId(item.id)}
                          onCancel={() => setEditingId(null)}
                          onToggle={() => handleToggle(item)}
                          onUpdate={handleUpdate}
                        />
                      ))}
                    </div>
                  )}
                </section>
              ))}

              {uncategorizedMedia.length > 0 && (
                <section className="admin-card" style={{ marginBottom: "1.5rem" }}>
                  <div className="admin-page-heading">
                    <div>
                      <h3>Other Media</h3>
                      <p>Assets with non-standard project categories.</p>
                    </div>
                    <p>
                      {uncategorizedMedia.length}{" "}
                      {uncategorizedMedia.length === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="admin-media-list">
                    {uncategorizedMedia.map((item) => (
                      <ProjectMediaCard
                        key={item.id}
                        media={item}
                        isEditing={editingId === item.id}
                        onEdit={() => setEditingId(item.id)}
                        onCancel={() => setEditingId(null)}
                        onToggle={() => handleToggle(item)}
                        onUpdate={handleUpdate}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </AdminLayout>
  );
}

function ProjectMediaUploadForm({
  isUploading,
  onSubmit,
}: {
  isUploading: boolean;
  onSubmit: (input: {
    file: File;
    type: MediaType;
    category: MediaCategory;
    slot?: string;
    title?: string;
    altText?: string;
    sortOrder: number;
    isPrimary: boolean;
  }) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<MediaType>("IMAGE");
  const [category, setCategory] = useState<MediaCategory>("HERO");
  const [slot, setSlot] = useState("");
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTypeChange(newType: MediaType) {
    setType(newType);
    if (newType === "VIDEO") {
      setCategory("PROJECT_VIDEO");
    } else if (category === "PROJECT_VIDEO") {
      setCategory("HERO");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Please select a file.");
      return;
    }

    const order = Number(sortOrder);

    if (!Number.isSafeInteger(order) || order < 0) {
      setError("Sort order must be a non-negative whole number.");
      return;
    }

    setError(null);

    await onSubmit({
      file,
      type,
      category,
      slot: slot.trim() || undefined,
      title: title.trim() || undefined,
      altText: altText.trim() || undefined,
      sortOrder: order,
      isPrimary,
    });

    setFile(null);
    setSlot("");
    setTitle("");
    setAltText("");
    setSortOrder("0");
    setIsPrimary(false);

    const input = document.getElementById(
      "project-media-file-input",
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  return (
    <form
      className="admin-media-upload-form"
      onSubmit={submit}
    >
      {error && <p role="alert">{error}</p>}

      <label>
        File
        <input
          id="project-media-file-input"
          required
          type="file"
          accept={
            type === "IMAGE"
              ? "image/*"
              : type === "VIDEO"
                ? "video/*"
                : "*/*"
          }
          onChange={(event) =>
            setFile(event.target.files?.[0] ?? null)
          }
        />
      </label>

      <label>
        Media type
        <select
          value={type}
          onChange={(event) =>
            handleTypeChange(event.target.value as MediaType)
          }
        >
          {mediaTypes.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label>
        Category
        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as MediaCategory)
          }
        >
          {projectCategories.map((value) => (
            <option key={value} value={value}>
              {categoryLabels[value]}
            </option>
          ))}
        </select>
      </label>

      <label>
        Slot (optional)
        <input
          value={slot}
          placeholder="e.g. hero, exterior-main"
          onChange={(event) => setSlot(event.target.value)}
        />
      </label>

      <label>
        Title (optional)
        <input
          value={title}
          placeholder="e.g. Main elevation entrance"
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>

      <label>
        Alt text (optional)
        <input
          value={altText}
          placeholder="Describe the media asset for accessibility"
          onChange={(event) => setAltText(event.target.value)}
        />
      </label>

      <label>
        Sort order
        <input
          type="number"
          min="0"
          step="1"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
        />
      </label>

      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={isPrimary}
          onChange={(event) => setIsPrimary(event.target.checked)}
        />
        Primary asset
      </label>

      <button type="submit" disabled={isUploading || !file}>
        {isUploading ? "Uploading..." : "Upload Project Media"}
      </button>
    </form>
  );
}

function ProjectMediaCard({
  media,
  isEditing,
  onEdit,
  onCancel,
  onToggle,
  onUpdate,
}: {
  media: AdminMedia;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onToggle: () => void;
  onUpdate: (
    id: string,
    payload: MediaMetadataInput,
  ) => Promise<void>;
}) {
  return (
    <article
      className={`admin-card admin-media-card ${
        !media.isActive ? "admin-media-card-inactive" : ""
      }`}
    >
      {media.type === "IMAGE" ? (
        <img
          src={media.thumbnailUrl ?? media.url}
          alt={
            media.altText ??
            media.title ??
            categoryLabels[media.category] ??
            "Project media"
          }
        />
      ) : media.type === "VIDEO" ? (
        <video controls src={media.url} preload="metadata" />
      ) : (
        <p>
          <a
            href={media.url}
            target="_blank"
            rel="noreferrer"
          >
            Open document
          </a>
        </p>
      )}

      <h4>
        {media.title ??
          media.slot ??
          categoryLabels[media.category] ??
          media.category}
      </h4>

      <p>
        {media.type} · {categoryLabels[media.category] ?? media.category}
      </p>

      <p>
        {media.isPrimary ? "Primary" : "Not primary"} · Order {media.sortOrder} · Status: {media.isActive ? "Active" : "Inactive"}
      </p>

      {media.slot && <p>Slot: {media.slot}</p>}

      <p>
        <a
          href={media.url}
          target="_blank"
          rel="noreferrer"
        >
          Open media URL
        </a>
      </p>

      {isEditing ? (
        <ProjectMediaEditForm
          media={media}
          onCancel={onCancel}
          onSubmit={onUpdate}
        />
      ) : (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button type="button" onClick={onEdit}>
            Edit metadata
          </button>

          <button type="button" onClick={onToggle}>
            {media.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      )}
    </article>
  );
}

function ProjectMediaEditForm({
  media,
  onCancel,
  onSubmit,
}: {
  media: AdminMedia;
  onCancel: () => void;
  onSubmit: (
    id: string,
    payload: MediaMetadataInput,
  ) => Promise<void>;
}) {
  const [category, setCategory] = useState<MediaCategory>(media.category);
  const [slot, setSlot] = useState(media.slot ?? "");
  const [title, setTitle] = useState(media.title ?? "");
  const [altText, setAltText] = useState(media.altText ?? "");
  const [sortOrder, setSortOrder] = useState(String(media.sortOrder));
  const [isPrimary, setIsPrimary] = useState(media.isPrimary);
  const [isActive, setIsActive] = useState(media.isActive);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const order = Number(sortOrder);

    if (!Number.isSafeInteger(order) || order < 0) {
      setError("Sort order must be a non-negative whole number.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await onSubmit(media.id, {
        category,
        slot: slot.trim() || null,
        title: title.trim() || null,
        altText: altText.trim() || null,
        sortOrder: order,
        isPrimary,
        isActive,
      });
    } catch (requestError) {
      setError(errorMessage(requestError, "update"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="admin-media-edit-form"
      onSubmit={submit}
    >
      {error && <p role="alert">{error}</p>}

      <label>
        Category
        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as MediaCategory)
          }
        >
          {projectCategories.map((value) => (
            <option key={value} value={value}>
              {categoryLabels[value]}
            </option>
          ))}
        </select>
      </label>

      <label>
        Slot
        <input
          value={slot}
          placeholder="e.g. hero, exterior-1"
          onChange={(event) => setSlot(event.target.value)}
        />
      </label>

      <label>
        Title
        <input
          value={title}
          placeholder="Media title"
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>

      <label>
        Alt text
        <input
          value={altText}
          placeholder="Describe image"
          onChange={(event) => setAltText(event.target.value)}
        />
      </label>

      <label>
        Sort order
        <input
          type="number"
          min="0"
          step="1"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
        />
      </label>

      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={isPrimary}
          onChange={(event) => setIsPrimary(event.target.checked)}
        />
        Primary asset
      </label>

      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        Active
      </label>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <button
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
