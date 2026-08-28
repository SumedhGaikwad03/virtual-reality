/*
 * PURPOSE:
 * Admin home media management page.
 *
 * FLOW:
 * Home Media Management Flow
 *
 * RESPONSIBILITY:
 * Manages site-level visual assets (HERO, HERO_CAROUSEL, CARD, GALLERY) displayed on the public homepage.
 * Handles file uploads, sorting, and activation toggling without entity ownership.
 */

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  getHomeMedia,
  uploadMedia,
  updateMedia,
} from "../../api/admin-media";
import type {
  AdminMedia,
  MediaCategory,
  MediaType,
} from "../../types/admin-media";

// HOME media is restricted to four public homepage categories
const homeCategories: MediaCategory[] = [
  "HERO",
  "HERO_CAROUSEL",
  "CARD",
  "GALLERY",
];

const categoryLabels: Record<MediaCategory, string> = {
  HERO: "Hero",
  HERO_CAROUSEL: "Hero Carousel",
  CARD: "Cards",
  GALLERY: "Gallery",
  AMENITY: "Amenity",
  EXTERIOR: "Exterior",
  INTERIOR: "Interior",
  LOCATION: "Location",
  CONSTRUCTION: "Construction",
  FLOOR_PLAN: "Floor Plan",
  BROCHURE: "Brochure",
  PROJECT_VIDEO: "Project Video",
};

const categoryOrder: MediaCategory[] = [
  "HERO",
  "HERO_CAROUSEL",
  "CARD",
  "GALLERY",
];

export function HomeMediaPage() {
  const [media, setMedia] = useState<AdminMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMedia() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getHomeMedia();
      setMedia(response.data);
    } catch {
      setError("Unable to load home media.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadMedia();
  }, []);

  async function handleUpload(input: {
    file: File;
    type: MediaType;
    category: MediaCategory;
    slot?: string;
    title?: string;
    altText?: string;
  }) {
    try {
      setIsUploading(true);
      setError(null);

      // HOME media has no entity owner (developerId, projectId, configurationId are all omitted)
      await uploadMedia({
        file: input.file,
        context: "HOME",
        type: input.type,
        category: input.category,
        slot: input.slot,
        title: input.title,
        altText: input.altText,
      });

      await loadMedia();
    } catch {
      setError("Unable to upload media.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleToggle(mediaItem: AdminMedia) {
    try {
      setError(null);

      // Activation toggling is metadata-only (isActive flag), preserving the uploaded Cloudinary asset
      await updateMedia(mediaItem.id, {
        isActive: !mediaItem.isActive,
      });

      setMedia((current) =>
        current.map((item) =>
          item.id === mediaItem.id
            ? {
                ...item,
                isActive: !item.isActive,
              }
            : item,
        ),
      );
    } catch {
      setError("Unable to update media.");
    }
  }

  const groupedMedia = useMemo(() => {
    return categoryOrder.map((category) => ({
      category,
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

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <p>Website content</p>

          <h1>Home Media</h1>

          <p>
            Manage the images and media displayed on
            the public homepage.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      <section className="admin-card">
        <h2>Add Home Media</h2>

        <HomeMediaUploadForm
          isUploading={isUploading}
          onUpload={handleUpload}
        />
      </section>

      {isLoading && (
        <section className="admin-card">
          <p>Loading home media...</p>
        </section>
      )}

      {!isLoading && media.length === 0 && (
        <section className="admin-card">
          <p>
            No home media has been uploaded yet.
          </p>
        </section>
      )}

      {!isLoading &&
        groupedMedia.map(({ category, items }) => (
          <section
            className="admin-card"
            key={category}
          >
            <div className="admin-page-heading">
              <div>
                <h2>
                  {categoryLabels[category]}
                </h2>

                <p>
                  {items.length}{" "}
                  {items.length === 1
                    ? "item"
                    : "items"}
                </p>
              </div>
            </div>

            {items.length === 0 ? (
              <p>
                No{" "}
                {categoryLabels[
                  category
                ].toLowerCase()}{" "}
                media yet.
              </p>
            ) : (
              <div className="admin-media-grid">
                {items.map((item) => (
                  <HomeMediaCard
                    key={item.id}
                    media={item}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
    </AdminLayout>
  );
}

function HomeMediaCard({
  media,
  onToggle,
}: {
  media: AdminMedia;
  onToggle: (
    media: AdminMedia,
  ) => Promise<void>;
}) {
  return (
    <article
      className={`admin-media-card ${
        !media.isActive
          ? "admin-media-card-inactive"
          : ""
      }`}
    >
      <div className="admin-media-preview">
        {media.type === "IMAGE" ? (
          <img
            src={media.url}
            alt={
              media.altText ??
              media.title ??
              ""
            }
          />
        ) : media.type === "VIDEO" ? (
          <video
            src={media.url}
            controls
            preload="metadata"
          />
        ) : (
          <a
            href={media.url}
            target="_blank"
            rel="noreferrer"
          >
            Open document
          </a>
        )}
      </div>

      <div className="admin-media-card-content">
        <h3>
          {media.title ??
            media.slot ??
            categoryLabels[media.category]}
        </h3>

        <dl>
          <div>
            <dt>Slot</dt>

            <dd>
              {media.slot ?? "Not assigned"}
            </dd>
          </div>

          <div>
            <dt>Order</dt>

            <dd>
              {media.sortOrder}
            </dd>
          </div>

          <div>
            <dt>Status</dt>

            <dd>
              {media.isActive
                ? "Active"
                : "Inactive"}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() =>
            void onToggle(media)
          }
        >
          {media.isActive
            ? "Deactivate"
            : "Activate"}
        </button>
      </div>
    </article>
  );
}

function HomeMediaUploadForm({
  isUploading,
  onUpload,
}: {
  isUploading: boolean;
  onUpload: (input: {
    file: File;
    type: MediaType;
    category: MediaCategory;
    slot?: string;
    title?: string;
    altText?: string;
  }) => Promise<void>;
}) {
  const [file, setFile] =
    useState<File | null>(null);

  const [type, setType] =
    useState<MediaType>("IMAGE");

  const [category, setCategory] =
    useState<MediaCategory>("HERO");

  const [slot, setSlot] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [altText, setAltText] =
    useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!file) {
      return;
    }

    await onUpload({
      file,
      type,
      category,
      slot: slot.trim() || undefined,
      title: title.trim() || undefined,
      altText: altText.trim() || undefined,
    });

    setFile(null);
    setSlot("");
    setTitle("");
    setAltText("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          File

          <input
            type="file"
            accept={
              type === "IMAGE"
                ? "image/*"
                : type === "VIDEO"
                  ? "video/*"
                  : "*/*"
            }
            onChange={(event) => {
              setFile(
                event.target.files?.[0] ??
                  null,
              );
            }}
          />
        </label>
      </div>

      <div>
        <label>
          Type

          <select
            value={type}
            onChange={(event) =>
              setType(
                event.target
                  .value as MediaType,
              )
            }
          >
            <option value="IMAGE">
              Image
            </option>

            <option value="VIDEO">
              Video
            </option>

            <option value="DOCUMENT">
              Document
            </option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Category

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target
                  .value as MediaCategory,
              )
            }
          >
            {homeCategories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {categoryLabels[item]}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      <div>
        <label>
          Slot

          <input
            value={slot}
            onChange={(event) =>
              setSlot(event.target.value)
            }
            placeholder="hero"
          />
        </label>
      </div>

      <div>
        <label>
          Title

          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Main homepage hero"
          />
        </label>
      </div>

      <div>
        <label>
          Alt text

          <input
            value={altText}
            onChange={(event) =>
              setAltText(
                event.target.value,
              )
            }
            placeholder="Describe the image"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={!file || isUploading}
      >
        {isUploading
          ? "Uploading..."
          : "Upload Media"}
      </button>
    </form>
  );
}