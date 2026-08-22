import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AdminApiError } from "../../api/admin-client";
import { getProject } from "../../api/admin-projects";
import { getConfiguration } from "../../api/admin-configurations";
import {
  getConfigurationMedia,
  getProjectMedia,
  updateMedia,
  uploadMedia,
} from "../../api/admin-media";
import { AdminLayout } from "../../components/admin/AdminLayout";

import type { AdminProject } from "../../types/admin-project";
import type { AdminConfiguration } from "../../types/admin-configuration";
import type {
  AdminMedia,
  MediaCategory,
  MediaMetadataInput,
  MediaType,
} from "../../types/admin-media";

const mediaTypes: MediaType[] = ["IMAGE", "DOCUMENT", "VIDEO"];

const mediaCategories: MediaCategory[] = [
  "HERO",
  "HERO_CAROUSEL",
  "GALLERY",
  "AMENITY",
  "EXTERIOR",
  "INTERIOR",
  "LOCATION",
  "CONSTRUCTION",
  "FLOOR_PLAN",
  "BROCHURE",
  "PROJECT_VIDEO",
];

function errorMessage(
  error: unknown,
  action: "load" | "upload" | "update",
) {
  if (!(error instanceof AdminApiError)) {
    return "Something went wrong. Please try again.";
  }

  if (error.status === 400) {
    return action === "upload"
      ? "Please check the media type and file."
      : "Please check the media metadata.";
  }

  if (error.status === 404) {
    return "Project or configuration not found.";
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

function formatMediaLabel(value: string) {
  return value.replaceAll("_", " ");
}

type MediaManagerProps = {
  ownerType: "project" | "configuration";
};

export function ProjectMediaPage() {
  return <MediaManagerPage ownerType="project" />;
}

export function ConfigurationMediaPage() {
  return <MediaManagerPage ownerType="configuration" />;
}

function MediaManagerPage({ ownerType }: MediaManagerProps) {
  const params = useParams<{
    projectId: string;
    configurationId: string;
  }>();

  const ownerId =
    ownerType === "project"
      ? params.projectId
      : params.configurationId;

  const [project, setProject] = useState<AdminProject | null>(null);
  const [configuration, setConfiguration] =
    useState<AdminConfiguration | null>(null);
  const [media, setMedia] = useState<AdminMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadMedia() {
    if (!ownerId) {
      return;
    }

    const response =
      ownerType === "project"
        ? await getProjectMedia(ownerId)
        : await getConfigurationMedia(ownerId);

    setMedia(response.data);
  }

  useEffect(() => {
    if (!ownerId) {
      setIsLoading(false);
      return;
    }

    let active = true;

    const load =
      ownerType === "project"
        ? Promise.all([
            getProject(ownerId),
            getProjectMedia(ownerId),
          ]).then(([projectResponse, mediaResponse]) => ({
            project: projectResponse.data,
            configuration: null,
            media: mediaResponse.data,
          }))
        : getConfiguration(ownerId).then(
            (configurationResponse) =>
              getProject(configurationResponse.data.projectId).then(
                (projectResponse) =>
                  getConfigurationMedia(ownerId).then(
                    (mediaResponse) => ({
                      project: projectResponse.data,
                      configuration: configurationResponse.data,
                      media: mediaResponse.data,
                    }),
                  ),
              ),
          );

    load
      .then((result) => {
        if (!active) {
          return;
        }

        setProject(result.project);
        setConfiguration(result.configuration);
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
  }, [ownerId, ownerType]);

  async function handleUpload(
    input: Omit<
      Parameters<typeof uploadMedia>[0],
      "projectId" | "configurationId"
    >,
  ) {
    if (!ownerId) {
      setError("Media owner is missing.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsUploading(true);

    try {
      await uploadMedia({
        ...input,
        ...(ownerType === "project"
          ? { projectId: ownerId }
          : { configurationId: ownerId }),
      });

      await loadMedia();

      setSuccess("Media uploaded successfully.");
    } catch (requestError) {
      setError(errorMessage(requestError, "upload"));
    } finally {
      setIsUploading(false);
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

  if (!ownerId) {
    return (
      <AdminLayout>
        <p role="alert">Media owner could not be determined.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <p>
        <Link
          to={
            ownerType === "project"
              ? "/admin/projects"
              : "/admin/projects"
          }
        >
          ← Projects
        </Link>
      </p>

      {isLoading && <p>Loading media...</p>}

      {error && <p role="alert">{error}</p>}

      {success && <p role="status">{success}</p>}

      {!isLoading && (
        <>
          <p>
            {ownerType === "project"
              ? "Project"
              : "Configuration"}
            :{" "}
            {ownerType === "project"
              ? project?.name
              : configuration?.name}
          </p>

          {ownerType === "configuration" && (
            <p>Project: {project?.name}</p>
          )}

          <h1>Media</h1>

          <MediaUploadForm
            isUploading={isUploading}
            onSubmit={handleUpload}
          />

          {media.length === 0 ? (
            <section className="admin-card">
              <p>No media found.</p>
            </section>
          ) : (
            <div className="admin-media-list">
              {media.map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  isEditing={editingId === item.id}
                  onEdit={() => setEditingId(item.id)}
                  onCancel={() => setEditingId(null)}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

function MediaUploadForm({
  isUploading,
  onSubmit,
}: {
  isUploading: boolean;
  onSubmit: (
    input: Omit<
      Parameters<typeof uploadMedia>[0],
      "projectId" | "configurationId"
    >,
  ) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<MediaType>("IMAGE");
  const [category, setCategory] =
    useState<MediaCategory>("GALLERY");
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!file) {
      setError("Please select a file.");
      return;
    }

    const order = Number(sortOrder);

    if (!Number.isSafeInteger(order) || order < 0) {
      setError(
        "Sort order must be a non-negative whole number.",
      );
      return;
    }

    setError(null);

    await onSubmit({
      file,
      type,
      category,
      ...(title.trim()
        ? { title: title.trim() }
        : {}),
      ...(altText.trim()
        ? { altText: altText.trim() }
        : {}),
      sortOrder: order,
      isPrimary,
    });

    setFile(null);
    setTitle("");
    setAltText("");
    setSortOrder("0");
    setIsPrimary(false);

    const input = document.getElementById(
      "media-file-input",
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  return (
    <form
      className="admin-card admin-media-upload-form"
      onSubmit={submit}
    >
      <h2>Upload Media</h2>

      {error && <p role="alert">{error}</p>}

      <label>
        File
        <input
          id="media-file-input"
          required
          type="file"
          onChange={(event) =>
            setFile(event.target.files?.[0] ?? null)
          }
        />
      </label>

      <label>
        Type
        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value as MediaType)
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
            setCategory(
              event.target.value as MediaCategory,
            )
          }
        >
          {mediaCategories.map((value) => (
            <option key={value} value={value}>
              {formatMediaLabel(value)}
            </option>
          ))}
        </select>
      </label>

      <label>
        Title
        <input
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
        />
      </label>

      <label>
        Alt text
        <input
          value={altText}
          onChange={(event) =>
            setAltText(event.target.value)
          }
        />
      </label>

      <label>
        Sort order
        <input
          type="number"
          min="0"
          step="1"
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(event.target.value)
          }
        />
      </label>

      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={isPrimary}
          onChange={(event) =>
            setIsPrimary(event.target.checked)
          }
        />
        Primary
      </label>

      <button type="submit" disabled={isUploading}>
        {isUploading
          ? "Uploading..."
          : "Upload media"}
      </button>
    </form>
  );
}

function MediaCard({
  media,
  isEditing,
  onEdit,
  onCancel,
  onUpdate,
}: {
  media: AdminMedia;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: (
    id: string,
    payload: MediaMetadataInput,
  ) => Promise<void>;
}) {
  return (
    <article className="admin-card admin-media-card">
      {media.type === "IMAGE" ? (
        <img
          src={media.thumbnailUrl ?? media.url}
          alt={
            media.altText ??
            media.title ??
            "Uploaded media"
          }
        />
      ) : media.type === "VIDEO" ? (
        <video controls src={media.url} />
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

      <h2>
        {media.title ??
          formatMediaLabel(media.category)}
      </h2>

      <p>
        {media.type} ·{" "}
        {formatMediaLabel(media.category)}
      </p>

      <p>
        {media.isPrimary
          ? "Primary"
          : "Not primary"}{" "}
        · Order {media.sortOrder} · Source{" "}
        {media.source}
      </p>

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
        <MediaEditForm
          media={media}
          onCancel={onCancel}
          onSubmit={onUpdate}
        />
      ) : (
        <button type="button" onClick={onEdit}>
          Edit metadata
        </button>
      )}
    </article>
  );
}

function MediaEditForm({
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
  const [category, setCategory] =
    useState<MediaCategory>(media.category);
  const [title, setTitle] =
    useState(media.title ?? "");
  const [altText, setAltText] =
    useState(media.altText ?? "");
  const [sortOrder, setSortOrder] =
    useState(String(media.sortOrder));
  const [isPrimary, setIsPrimary] =
    useState(media.isPrimary);
  const [isActive, setIsActive] =
    useState(media.isActive);
  const [error, setError] =
    useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const order = Number(sortOrder);

    if (!Number.isSafeInteger(order) || order < 0) {
      setError(
        "Sort order must be a non-negative whole number.",
      );
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await onSubmit(media.id, {
        category,
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
            setCategory(
              event.target.value as MediaCategory,
            )
          }
        >
          {mediaCategories.map((value) => (
            <option key={value} value={value}>
              {formatMediaLabel(value)}
            </option>
          ))}
        </select>
      </label>

      <label>
        Title
        <input
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
        />
      </label>

      <label>
        Alt text
        <input
          value={altText}
          onChange={(event) =>
            setAltText(event.target.value)
          }
        />
      </label>

      <label>
        Sort order
        <input
          type="number"
          min="0"
          step="1"
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(event.target.value)
          }
        />
      </label>

      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={isPrimary}
          onChange={(event) =>
            setIsPrimary(event.target.checked)
          }
        />
        Primary
      </label>

      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) =>
            setIsActive(event.target.checked)
          }
        />
        Active
      </label>

      <div>
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