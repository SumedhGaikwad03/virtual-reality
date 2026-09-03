/*
 * PURPOSE:
 * Admin configuration media management page.
 *
 * FLOW:
 * Admin Configuration Media Management Flow
 *
 * RESPONSIBILITY:
 * Manages unit-specific media assets (floor plans, interior photos, fixtures/amenities, brochures)
 * belonging to a configuration. Handles file uploads to Cloudinary, metadata editing, and activation toggling.
 */

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AdminApiError } from "../../api/admin-client";
import { getConfiguration } from "../../api/admin-configurations";
import { getProject } from "../../api/admin-projects";
import {
  getConfigurationMedia,
  updateMedia,
  uploadMedia,
} from "../../api/admin-media";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ProjectWorkspaceNav } from "../../components/admin/ProjectWorkspaceNav";

import type { AdminConfiguration } from "../../types/admin-configuration";
import type { AdminProject } from "../../types/admin-project";
import type {
  AdminMedia,
  MediaCategory,
  MediaMetadataInput,
  MediaType,
} from "../../types/admin-media";

// Configuration-specific media categories: strictly separated from project-level media categories
const configurationCategories: MediaCategory[] = [
  "FLOOR_PLAN",
  "GALLERY",
  "INTERIOR",
  "AMENITY",
  "BROCHURE",
];

const mediaTypes: MediaType[] = ["IMAGE", "DOCUMENT", "VIDEO"];

const categoryLabels: Record<MediaCategory, string> = {
  FLOOR_PLAN: "Floor Plan",
  GALLERY: "Gallery",
  INTERIOR: "Interior",
  AMENITY: "Amenity",
  BROCHURE: "Brochure",
  HERO: "Hero",
  HERO_CAROUSEL: "Hero Carousel",
  CARD: "Card",
  EXTERIOR: "Exterior",
  LOCATION: "Location",
  CONSTRUCTION: "Construction",
  PROJECT_VIDEO: "Project Video",
};

const categoryDescriptions: Record<string, string> = {
  FLOOR_PLAN: "2D or 3D floor plans and unit layout drawings.",
  GALLERY: "General photo gallery of this unit configuration.",
  INTERIOR: "Interior photos and rendered views of rooms and living areas.",
  AMENITY: "Unit-specific fixtures, fittings, and exclusive amenities.",
  BROCHURE: "Downloadable configuration brochures, specifications, and PDFs.",
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
    return "Configuration or project not found.";
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

  return "Unable to load configuration media. Please try again.";
}

export function ConfigurationMediaPage() {
  const { configurationId } = useParams<{ configurationId: string }>();

  const [configuration, setConfiguration] =
    useState<AdminConfiguration | null>(null);
  const [project, setProject] = useState<AdminProject | null>(null);
  const [media, setMedia] = useState<AdminMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadMedia() {
    if (!configurationId) return;

    try {
      const response = await getConfigurationMedia(configurationId);
      setMedia(response.data);
    } catch (requestError) {
      setError(errorMessage(requestError, "load"));
    }
  }

  useEffect(() => {
    if (!configurationId) {
      setIsLoading(false);
      return;
    }

    let active = true;

    // Load configuration, resolve its parent project, and load all configuration media assets
    getConfiguration(configurationId)
      .then((configResponse) =>
        getProject(configResponse.data.projectId).then((projectResponse) =>
          getConfigurationMedia(configurationId).then((mediaResponse) => ({
            configuration: configResponse.data,
            project: projectResponse.data,
            media: mediaResponse.data,
          })),
        ),
      )
      .then((result) => {
        if (!active) return;
        setConfiguration(result.configuration);
        setProject(result.project);
        setMedia(result.media);
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
  }, [configurationId]);

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
    if (!configurationId || !configuration || !project) {
      setError("Configuration or project information is missing.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsUploading(true);

    try {
      // Configuration media requires context: "CONFIGURATION", valid configurationId, projectId, and developerId
      await uploadMedia({
        file: input.file,
        context: "CONFIGURATION",
        type: input.type,
        category: input.category,
        configurationId: configuration.id,
        projectId: configuration.projectId,
        developerId: project.developerId,
        slot: input.slot,
        title: input.title,
        altText: input.altText,
        sortOrder: input.sortOrder,
        isPrimary: input.isPrimary,
      });

      await loadMedia();
      setSuccess("Configuration media uploaded successfully.");
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
      // Activation/deactivation is metadata-only and preserves the uploaded Cloudinary asset
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
    return configurationCategories.map((category) => ({
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
      .filter((item) => !configurationCategories.includes(item.category))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [media]);

  if (!configurationId) {
    return (
      <AdminLayout>
        <p role="alert">Configuration ID could not be determined.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-top-bar">
        <Link
          className="admin-action admin-action--secondary"
          to={project ? `/admin/projects/${project.id}/configurations` : "/admin/projects"}
        >
          ← Back to Configurations
        </Link>
        {configuration && (
          <Link
            className="admin-action admin-action--secondary"
            to={`/admin/configurations/${configuration.id}`}
          >
            Edit Configuration
          </Link>
        )}
      </div>

      {isLoading && <p>Loading configuration media...</p>}

      {error && <p role="alert">{error}</p>}

      {success && <p role="status">{success}</p>}

      {!isLoading && configuration && project && (
        <>
          <ProjectWorkspaceNav
            projectId={project.id}
            projectName={project.name}
            active="configurations"
            previewHref={`/${project.developer.slug}/${project.locationSlug}/${project.slug}`}
          />
          <div className="admin-page-heading">
            <div>
              <p>Project: {project.name} · Configuration Media</p>
              <h1>{configuration.name}</h1>
              <p>
                {configuration.bhk} BHK · {configuration.carpetArea} sq ft · ₹{configuration.priceFrom} · Status: {configuration.availabilityStatus}
              </p>
            </div>
          </div>

          <section className="admin-card">
            <h2>Upload Configuration Media</h2>
            <ConfigurationMediaUploadForm
              isUploading={isUploading}
              onSubmit={handleUpload}
            />
          </section>

          <h2>Current Configuration Media</h2>

          {media.length === 0 ? (
            <section className="admin-card">
              <p>No media found for this configuration. Upload your first media asset above.</p>
            </section>
          ) : (
            <>
              {groupedMedia.map(({ category, label, description, items }) => (
                <section
                  className="admin-card"
                  key={category}
                  style={{ marginBottom: "1.5rem" }}
                >
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
                        <ConfigurationMediaCard
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
                <section
                  className="admin-card"
                  style={{ marginBottom: "1.5rem" }}
                >
                  <div className="admin-page-heading">
                    <div>
                      <h3>Other Media</h3>
                      <p>Assets with non-standard configuration categories.</p>
                    </div>
                    <p>
                      {uncategorizedMedia.length}{" "}
                      {uncategorizedMedia.length === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="admin-media-list">
                    {uncategorizedMedia.map((item) => (
                      <ConfigurationMediaCard
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

function ConfigurationMediaUploadForm({
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
  const [category, setCategory] =
    useState<MediaCategory>("FLOOR_PLAN");
  const [slot, setSlot] = useState("");
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTypeChange(newType: MediaType) {
    setType(newType);
    if (newType === "DOCUMENT") {
      setCategory("BROCHURE");
    } else if (newType === "VIDEO") {
      setCategory("GALLERY");
    } else if (category === "BROCHURE") {
      setCategory("FLOOR_PLAN");
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
      "configuration-media-file-input",
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
          id="configuration-media-file-input"
          required
          type="file"
          accept={
            type === "IMAGE"
              ? "image/*"
              : type === "VIDEO"
                ? "video/*"
                : ".pdf,.doc,.docx,application/pdf,text/plain,*/*"
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
          {configurationCategories.map((value) => (
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
          placeholder="e.g. 2bhk-layout, unit-main"
          onChange={(event) => setSlot(event.target.value)}
        />
      </label>

      <label>
        Title (optional)
        <input
          value={title}
          placeholder="e.g. Master Bedroom Floor Layout"
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>

      <label>
        Alt text (optional)
        <input
          value={altText}
          placeholder="Describe the unit layout or visual for accessibility"
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
        {isUploading ? "Uploading..." : "Upload Configuration Media"}
      </button>
    </form>
  );
}

function ConfigurationMediaCard({
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
            "Configuration media"
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
            Open document ({media.title ?? "Brochure"})
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
        <ConfigurationMediaEditForm
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

function ConfigurationMediaEditForm({
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
          {configurationCategories.map((value) => (
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
          placeholder="e.g. 2bhk-layout, unit-main"
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
          placeholder="Describe visual for accessibility"
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
