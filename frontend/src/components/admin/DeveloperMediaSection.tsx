/*
 * PURPOSE:
 * Admin Developer Media management section component.
 *
 * FLOW:
 * Admin Developer Management Flow: DeveloperFormPage -> DeveloperMediaSection -> admin-media API.
 *
 * RESPONSIBILITY:
 * Provides managed admin upload and preview UI for the two dedicated developer media slots:
 * 1. Brand Banner (DEVELOPER_BANNER)
 * 2. Developer Hero (DEVELOPER_HERO)
 * Reuses existing POST /api/admin/media, getDeveloperMedia, and updateMedia APIs.
 */

import { FormEvent, useEffect, useState } from "react";
import {
  getDeveloperMedia,
  updateMedia,
  uploadMedia,
} from "../../api/admin-media";
import type { AdminMedia } from "../../types/admin-media";

type DeveloperMediaSectionProps = {
  developerId: string;
};

export function DeveloperMediaSection({ developerId }: DeveloperMediaSectionProps) {
  const [mediaList, setMediaList] = useState<AdminMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadMedia = async () => {
    try {
      const response = await getDeveloperMedia(developerId);
      setMediaList(response.data);
    } catch {
      setError("Failed to load developer media.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [developerId]);

  const activeBanner = mediaList.find(
    (m) => m.category === "DEVELOPER_BANNER" && m.isActive,
  );
  const activeHero = mediaList.find(
    (m) => m.category === "DEVELOPER_HERO" && m.isActive,
  );

  async function handleBannerUpload(e: FormEvent) {
    e.preventDefault();
    if (!bannerFile) return;

    setError(null);
    setSuccess(null);
    setIsUploadingBanner(true);

    try {
      await uploadMedia({
        file: bannerFile,
        context: "DEVELOPER",
        developerId,
        type: "IMAGE",
        category: "DEVELOPER_BANNER",
        isPrimary: true,
      });

      setBannerFile(null);
      setSuccess("Brand banner uploaded successfully.");
      await loadMedia();
    } catch {
      setError("Failed to upload brand banner. Please try again.");
    } finally {
      setIsUploadingBanner(false);
    }
  }

  async function handleHeroUpload(e: FormEvent) {
    e.preventDefault();
    if (!heroFile) return;

    setError(null);
    setSuccess(null);
    setIsUploadingHero(true);

    try {
      await uploadMedia({
        file: heroFile,
        context: "DEVELOPER",
        developerId,
        type: "IMAGE",
        category: "DEVELOPER_HERO",
      });

      setHeroFile(null);
      setSuccess("Developer hero image uploaded successfully.");
      await loadMedia();
    } catch {
      setError("Failed to upload developer hero. Please try again.");
    } finally {
      setIsUploadingHero(false);
    }
  }

  async function handleRemoveMedia(mediaId: string, slotName: string) {
    if (!window.confirm(`Are you sure you want to remove the current ${slotName}?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await updateMedia(mediaId, { isActive: false });
      setSuccess(`${slotName} removed.`);
      await loadMedia();
    } catch {
      setError(`Failed to remove ${slotName}. Please try again.`);
    }
  }

  if (isLoading) {
    return <p>Loading developer media...</p>;
  }

  return (
    <section className="admin-developer-media-section">
      <div className="admin-section-heading">
        <h2>Developer Media</h2>
        <p>Manage the brand banner and atmospheric hero imagery for this developer's profile page.</p>
      </div>

      {error && <div className="admin-alert admin-alert-error" role="alert">{error}</div>}
      {success && <div className="admin-alert admin-alert-success" role="status">{success}</div>}

      <div className="admin-developer-media-grid">
        {/* SLOT 1: BRAND BANNER */}
        <div className="admin-media-slot-card">
          <div className="slot-header">
            <h3>Brand Banner</h3>
            <p>Wide developer logo or brand identity banner used at the top of the public Developer Page.</p>
          </div>

          {activeBanner ? (
            <div className="slot-preview-container">
              <div className="preview-image-wrapper banner-preview">
                <img src={activeBanner.url} alt={activeBanner.altText || "Brand Banner"} />
              </div>
              <div className="slot-actions">
                <button
                  type="button"
                  className="admin-btn-secondary-danger"
                  onClick={() => handleRemoveMedia(activeBanner.id, "Brand Banner")}
                >
                  Remove Banner
                </button>
              </div>
            </div>
          ) : (
            <div className="slot-empty-state">
              <p className="empty-state-text">No brand banner uploaded yet.</p>
            </div>
          )}

          <form onSubmit={handleBannerUpload} className="slot-upload-form">
            <label className="form-label">
              <span>{activeBanner ? "Replace Brand Banner" : "Upload Brand Banner"}</span>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                className="file-input"
              />
            </label>
            <button
              type="submit"
              disabled={!bannerFile || isUploadingBanner}
              className="admin-btn-primary"
            >
              {isUploadingBanner ? "Uploading..." : activeBanner ? "Replace Banner" : "Upload Banner"}
            </button>
          </form>
        </div>

        {/* SLOT 2: DEVELOPER HERO */}
        <div className="admin-media-slot-card">
          <div className="slot-header">
            <h3>Developer Hero</h3>
            <p>Large atmospheric hero photography used as the primary background for the Developer Page.</p>
          </div>

          {activeHero ? (
            <div className="slot-preview-container">
              <div className="preview-image-wrapper hero-preview">
                <img src={activeHero.url} alt={activeHero.altText || "Developer Hero"} />
              </div>
              <div className="slot-actions">
                <button
                  type="button"
                  className="admin-btn-secondary-danger"
                  onClick={() => handleRemoveMedia(activeHero.id, "Developer Hero")}
                >
                  Remove Hero
                </button>
              </div>
            </div>
          ) : (
            <div className="slot-empty-state">
              <p className="empty-state-text">No developer hero image uploaded yet.</p>
            </div>
          )}

          <form onSubmit={handleHeroUpload} className="slot-upload-form">
            <label className="form-label">
              <span>{activeHero ? "Replace Developer Hero" : "Upload Developer Hero"}</span>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
                className="file-input"
              />
            </label>
            <button
              type="submit"
              disabled={!heroFile || isUploadingHero}
              className="admin-btn-primary"
            >
              {isUploadingHero ? "Uploading..." : activeHero ? "Replace Hero" : "Upload Hero"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
