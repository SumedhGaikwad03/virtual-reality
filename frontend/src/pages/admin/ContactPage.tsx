/*
 * PURPOSE:
 * Admin firm contact configuration management page.
 *
 * FLOW:
 * Admin Layout -> ContactPage -> Admin Contact API (/api/admin/contact).
 *
 * RESPONSIBILITY:
 * Provides an administrative form to view, test, and update persisted firm contact info
 * (contact person, phone, email, office address, Google Maps URL, WhatsApp link).
 */

import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  getAdminContact,
  updateAdminContact,
  type AdminFirmContact,
} from "../../api/admin-contact";

export function ContactPage() {
  const [contact, setContact] = useState<AdminFirmContact | null>(null);
  const [formData, setFormData] = useState({
    contactPersonName: "",
    phone: "",
    email: "",
    address: "",
    googleMapsUrl: "",
    whatsappUrl: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  async function loadContact() {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await getAdminContact();
      setContact(res.data);
      setFormData({
        contactPersonName: res.data.contactPersonName || "",
        phone: res.data.phone || "",
        email: res.data.email || "",
        address: res.data.address || "",
        googleMapsUrl: res.data.googleMapsUrl || "",
        whatsappUrl: res.data.whatsappUrl || "",
      });
    } catch {
      setErrorMessage("Unable to load firm contact settings.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadContact();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const res = await updateAdminContact({
        contactPersonName: formData.contactPersonName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        googleMapsUrl: formData.googleMapsUrl.trim() || null,
        whatsappUrl: formData.whatsappUrl.trim(),
      });

      setContact(res.data);
      setSuccessMessage("Firm contact settings saved successfully.");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update firm contact settings.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCopyNumber() {
    if (formData.phone) {
      navigator.clipboard.writeText(formData.phone);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  }

  const effectiveMapsUrl =
    formData.googleMapsUrl.trim() ||
    (formData.address.trim()
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          formData.address.trim(),
        )}`
      : null);

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <p>Website configuration</p>
          <h1>Firm Contact Information</h1>
          <p>
            Manage firm contact details and customer communication channels displayed across all public pages.
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
          <p>Loading contact configuration...</p>
        </section>
      ) : (
        <div className="admin-contact-grid">
          {/* Main Edit Form */}
          <section className="admin-card">
            <h2>Edit Contact Details</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <label>
                Contact Person Name
                <input
                  type="text"
                  required
                  value={formData.contactPersonName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactPersonName: e.target.value,
                    }))
                  }
                  placeholder="e.g. Dipankar Jagtap"
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="e.g. +91 89996 43665"
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="e.g. dipankarjagtap@virtual2reality.in"
                />
              </label>

              <label>
                Office Address (multi-line supported)
                <textarea
                  required
                  rows={4}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Office No. 202, 2nd Floor&#10;Mspace Mall, Near Mahindra Antheia&#10;Pimpri, Pune 411018"
                />
              </label>

              <label>
                WhatsApp Direct Link
                <input
                  type="url"
                  required
                  value={formData.whatsappUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      whatsappUrl: e.target.value,
                    }))
                  }
                  placeholder="https://api.whatsapp.com/send/?phone=918999643665..."
                />
              </label>

              <label>
                Google Maps Navigation URL (Optional)
                <input
                  type="url"
                  value={formData.googleMapsUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      googleMapsUrl: e.target.value,
                    }))
                  }
                  placeholder="https://maps.google.com/?q=..."
                />
                <small className="admin-form-hint">
                  Leave blank to automatically use standard address query navigation.
                </small>
              </label>

              <div className="admin-form-actions">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="admin-action admin-action--primary"
                >
                  {isSaving ? "Saving..." : "Save Contact Settings"}
                </button>
              </div>
            </form>
          </section>

          {/* Live Action Preview & Testing Card */}
          <section className="admin-card admin-contact-preview-card">
            <h2>Public Action Preview</h2>
            <p className="admin-preview-desc">
              Test how phone, WhatsApp, email, maps, and copy actions operate for visitors.
            </p>

            <div className="admin-contact-preview-box">
              <div className="admin-contact-preview-identity">
                <span className="admin-preview-person">
                  {formData.contactPersonName || "Dipankar Jagtap"}
                </span>
                <span className="admin-preview-role">Virtual Reality Firm Representative</span>
              </div>

              <div className="admin-contact-preview-details">
                <div className="admin-preview-item">
                  <span className="admin-preview-label">Phone:</span>
                  <a
                    href={`tel:${formData.phone.replace(/\s+/g, "")}`}
                    className="admin-preview-link"
                  >
                    {formData.phone || "+91 89996 43665"}
                  </a>
                </div>

                <div className="admin-preview-item">
                  <span className="admin-preview-label">Email:</span>
                  <a
                    href={`mailto:${formData.email}`}
                    className="admin-preview-link"
                  >
                    {formData.email || "dipankarjagtap@virtual2reality.in"}
                  </a>
                </div>

                <div className="admin-preview-item">
                  <span className="admin-preview-label">Address:</span>
                  <p className="admin-preview-address">
                    {formData.address || "Office No. 202, 2nd Floor, Mspace Mall..."}
                  </p>
                </div>
              </div>

              {/* Action Buttons Test Suite */}
              <div className="admin-contact-test-actions">
                <a
                  href={`tel:${formData.phone.replace(/\s+/g, "")}`}
                  className="admin-action-btn admin-action-btn--call"
                >
                  📞 Call
                </a>

                <a
                  href={formData.whatsappUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-action-btn admin-action-btn--whatsapp"
                >
                  💬 WhatsApp
                </a>

                <a
                  href={`mailto:${formData.email}`}
                  className="admin-action-btn admin-action-btn--email"
                >
                  ✉ Email
                </a>

                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="admin-action-btn admin-action-btn--copy"
                >
                  {copyFeedback ? "✓ Copied!" : "📋 Copy Number"}
                </button>

                {effectiveMapsUrl && (
                  <a
                    href={effectiveMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-action-btn admin-action-btn--maps"
                  >
                    📍 Maps
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
