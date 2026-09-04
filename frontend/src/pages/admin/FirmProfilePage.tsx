/*
 * PURPOSE:
 * Admin firm profile and founder identity management page.
 *
 * FLOW:
 * Admin Layout -> FirmProfilePage -> Admin Firm Profile API (/api/admin/firm-profile) & Media API.
 *
 * RESPONSIBILITY:
 * Provides an administrative form to manage company overview and founder profile details
 * (founderName, founderTitle, founderExperience, founderBio, companyDescription, founderImageMediaId),
 * using the existing media management library for image selection.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  getAdminFirmProfile,
  updateAdminFirmProfile,
  type AdminFirmProfile,
} from "../../api/admin-firm-profile";
import { getHomeMedia, type AdminMedia } from "../../api/admin-media";

export function FirmProfilePage() {
  const [profile, setProfile] = useState<AdminFirmProfile | null>(null);
  const [availableMedia, setAvailableMedia] = useState<AdminMedia[]>([]);
  const [formData, setFormData] = useState({
    founderName: "",
    founderTitle: "",
    founderExperience: "",
    founderBio: "",
    founderImageMediaId: "" as string | null,
    companyDescription: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadData() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [profileRes, mediaRes] = await Promise.all([
        getAdminFirmProfile(),
        getHomeMedia().catch(() => ({ data: [] })),
      ]);

      setProfile(profileRes.data);
      setFormData({
        founderName: profileRes.data.founderName || "",
        founderTitle: profileRes.data.founderTitle || "",
        founderExperience: profileRes.data.founderExperience || "",
        founderBio: profileRes.data.founderBio || "",
        founderImageMediaId: profileRes.data.founderImageMediaId || null,
        companyDescription: profileRes.data.companyDescription || "",
      });

      // Filter only image type media for portrait selection
      const imageList = (mediaRes.data || []).filter(
        (m: AdminMedia) => m.type === "IMAGE" && m.isActive,
      );
      setAvailableMedia(imageList);
    } catch {
      setErrorMessage("Unable to load firm profile settings.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const res = await updateAdminFirmProfile({
        founderName: formData.founderName.trim(),
        founderTitle: formData.founderTitle.trim(),
        founderExperience: formData.founderExperience.trim(),
        founderBio: formData.founderBio.trim() || null,
        companyDescription: formData.companyDescription.trim() || null,
        founderImageMediaId: formData.founderImageMediaId || null,
      });

      setProfile(res.data);
      setSuccessMessage("Firm profile and founder details saved successfully.");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update firm profile.");
    } finally {
      setIsSaving(false);
    }
  }

  const selectedMedia = availableMedia.find(
    (m) => m.id === formData.founderImageMediaId,
  );
  const currentImageUrl =
    selectedMedia?.url || profile?.founderImageMedia?.url || null;

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <p>Website identity & leadership</p>
          <h1>Firm Profile & Company Identity</h1>
          <p>
            Manage founder biography, leadership presence, and company overview shown on the public site.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="admin-alert-banner admin-alert-banner--success" role="status">
          ✓ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="admin-alert-banner admin-alert-banner--error" role="alert">
          ⚠ {errorMessage}
        </div>
      )}

      {isLoading ? (
        <section className="admin-card">
          <p>Loading firm profile configuration...</p>
        </section>
      ) : (
        <div className="admin-contact-grid">
          {/* Main Edit Form */}
          <section className="admin-card">
            <h2>Edit Founder & Company Identity</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <label>
                Founder Full Name
                <input
                  type="text"
                  required
                  value={formData.founderName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      founderName: e.target.value,
                    }))
                  }
                  placeholder="e.g. Dipankar Jagtap"
                />
              </label>

              <label>
                Founder Official Title
                <input
                  type="text"
                  required
                  value={formData.founderTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      founderTitle: e.target.value,
                    }))
                  }
                  placeholder="e.g. Founder of Virtual Reality"
                />
              </label>

              <label>
                Experience Statement
                <input
                  type="text"
                  required
                  value={formData.founderExperience}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      founderExperience: e.target.value,
                    }))
                  }
                  placeholder="e.g. 20+ years of experience in the real estate industry"
                />
              </label>

              <label>
                Founder Biography / Leadership Philosophy
                <textarea
                  rows={4}
                  value={formData.founderBio}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      founderBio: e.target.value,
                    }))
                  }
                  placeholder="Describe founder background, vision, and real estate expertise..."
                />
              </label>

              <label>
                Company Overview & Philosophy
                <textarea
                  rows={4}
                  value={formData.companyDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      companyDescription: e.target.value,
                    }))
                  }
                  placeholder="Virtual Reality is a real-estate discovery platform..."
                />
              </label>

              {/* Founder Image Selector referencing existing Media system */}
              <div className="admin-media-picker-container">
                <span className="admin-label-title">Founder Portrait Image</span>
                <p className="admin-form-hint">
                  Select an image from the existing media library. Upload new photos in{" "}
                  <Link to="/admin/media">Home Media</Link>.
                </p>

                {availableMedia.length === 0 ? (
                  <div className="admin-media-picker-empty">
                    <p>No active images found in Home Media.</p>
                    <Link to="/admin/media" className="admin-action-btn">
                      Upload Photos in Home Media
                    </Link>
                  </div>
                ) : (
                  <div className="admin-media-picker-grid" role="radiogroup" aria-label="Founder image selection">
                    <div
                      className={`admin-media-picker-item ${
                        !formData.founderImageMediaId ? "is-selected" : ""
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          founderImageMediaId: null,
                        }))
                      }
                      role="radio"
                      aria-checked={!formData.founderImageMediaId}
                      tabIndex={0}
                    >
                      <div className="admin-media-picker-no-img">No Image (Monogram)</div>
                      <span>Default</span>
                    </div>

                    {availableMedia.map((mediaItem) => (
                      <div
                        key={mediaItem.id}
                        className={`admin-media-picker-item ${
                          formData.founderImageMediaId === mediaItem.id
                            ? "is-selected"
                            : ""
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            founderImageMediaId: mediaItem.id,
                          }))
                        }
                        role="radio"
                        aria-checked={formData.founderImageMediaId === mediaItem.id}
                        tabIndex={0}
                      >
                        <img
                          src={mediaItem.thumbnailUrl || mediaItem.url}
                          alt={mediaItem.altText || mediaItem.title || "Media preview"}
                          className="admin-media-picker-thumb"
                        />
                        <span className="admin-media-picker-name">
                          {mediaItem.title || mediaItem.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-form-actions">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="admin-action admin-action--primary"
                >
                  {isSaving ? "Saving..." : "Save Firm Profile"}
                </button>
              </div>
            </form>
          </section>

          {/* Live Public Preview Card */}
          <section className="admin-card admin-contact-preview-card">
            <h2>Public Layout Preview</h2>
            <p className="admin-preview-desc">
              How the founder profile and company identity render for visitors.
            </p>

            <div className="admin-profile-preview-card">
              <div className="admin-profile-preview-portrait-wrap">
                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt={formData.founderName || "Founder"}
                    className="admin-profile-preview-img"
                  />
                ) : (
                  <div className="admin-profile-preview-monogram" aria-label="Founder initials">
                    {(formData.founderName || "D")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <div className="admin-profile-preview-content">
                <span className="admin-profile-preview-exp-badge">
                  {formData.founderExperience || "20+ years of experience in the real estate industry"}
                </span>

                <h3 className="admin-profile-preview-name">
                  {formData.founderName || "Dipankar Jagtap"}
                </h3>

                <p className="admin-profile-preview-title">
                  {formData.founderTitle || "Founder of Virtual Reality"}
                </p>

                {formData.founderBio && (
                  <blockquote className="admin-profile-preview-bio">
                    "{formData.founderBio}"
                  </blockquote>
                )}

                {formData.companyDescription && (
                  <div className="admin-profile-preview-company">
                    <span className="admin-preview-label">Company Overview:</span>
                    <p>{formData.companyDescription}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
