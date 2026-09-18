/*
 * PURPOSE:
 * Modal dialog for administrative manual creation of Rental Property records.
 *
 * FLOW:
 * RentalAvailablePage -> AddRentalPropertyModal -> createRentalProperty API.
 *
 * RESPONSIBILITY:
 * Provides a structured form for registering landlord/owner property listings,
 * validating inputs, displaying progress/error feedback, and returning the newly created property upon completion.
 */

import { useState, useEffect, type FormEvent } from "react";
import { AdminApiError } from "../../api/admin-client";
import { createRentalProperty } from "../../api/admin-rentals";
import type {
  AdminRentalProperty,
  RentalPropertyStatus,
} from "../../types/admin-rental";

type AddRentalPropertyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (property: AdminRentalProperty) => void;
};

const statusOptions: Array<{ value: RentalPropertyStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "VERIFIED", label: "Verified" },
  { value: "AVAILABLE", label: "Available" },
  { value: "RENTED", label: "Rented" },
  { value: "ARCHIVED", label: "Archived" },
];

export function AddRentalPropertyModal({
  isOpen,
  onClose,
  onSuccess,
}: AddRentalPropertyModalProps) {
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [flatType, setFlatType] = useState("");
  const [approxSizeSqFt, setApproxSizeSqFt] = useState("");
  const [location, setLocation] = useState("");
  const [areaLocality, setAreaLocality] = useState("");
  const [societyDeveloper, setSocietyDeveloper] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [status, setStatus] = useState<RentalPropertyStatus>("NEW");
  const [internalNotes, setInternalNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  function resetForm() {
    setOwnerName("");
    setPhone("");
    setFlatType("");
    setApproxSizeSqFt("");
    setLocation("");
    setAreaLocality("");
    setSocietyDeveloper("");
    setAdditionalDetails("");
    setStatus("NEW");
    setInternalNotes("");
    setError(null);
  }

  function handleClose() {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedOwner = ownerName.trim();
    const trimmedPhone = phone.trim();
    const trimmedFlat = flatType.trim();
    const trimmedLoc = location.trim();
    const trimmedArea = areaLocality.trim();

    if (!trimmedOwner) {
      setError("Owner name is required.");
      return;
    }

    if (!trimmedPhone) {
      setError("Contact phone number is required.");
      return;
    }

    if (!trimmedFlat) {
      setError("Flat type (e.g. 2 BHK) is required.");
      return;
    }

    if (!trimmedLoc && !trimmedArea) {
      setError("Please specify at least a Location (City) or Area/Locality.");
      return;
    }

    let parsedSize: number | undefined;
    if (approxSizeSqFt.trim()) {
      const num = Number(approxSizeSqFt.trim());
      if (Number.isNaN(num) || num <= 0 || num > 50000) {
        setError("Approximate size must be a valid number under 50,000 sq ft.");
        return;
      }
      parsedSize = Math.round(num);
    }

    setIsSubmitting(true);

    try {
      const response = await createRentalProperty({
        ownerName: trimmedOwner,
        phone: trimmedPhone,
        flatType: trimmedFlat,
        approxSizeSqFt: parsedSize,
        location: trimmedLoc || undefined,
        areaLocality: trimmedArea || undefined,
        societyDeveloper: societyDeveloper.trim() || undefined,
        additionalDetails: additionalDetails.trim() || undefined,
        status,
        internalNotes: internalNotes.trim() || undefined,
      });

      resetForm();
      onSuccess(response.data);
    } catch (requestError) {
      if (requestError instanceof AdminApiError) {
        setError(requestError.message || "Failed to create rental property.");
      } else if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Unable to create rental property. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="admin-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-rental-property-title"
    >
      <div className="admin-modal-card--wide">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 id="add-rental-property-title" style={{ margin: 0, fontSize: "1.25rem", color: "var(--admin-text)" }}>
            Add Rental Property
          </h2>
          <button
            type="button"
            className="admin-action admin-action--secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            style={{ padding: "0.25rem 0.6rem", fontSize: "0.85rem" }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="admin-alert-banner admin-alert-banner--error" role="alert">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Owner Details */}
          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label htmlFor="property-owner-name">
                Owner / Landlord Name <span style={{ color: "var(--admin-danger-text)" }}>*</span>
              </label>
              <input
                id="property-owner-name"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="property-phone">
                Phone Number <span style={{ color: "var(--admin-danger-text)" }}>*</span>
              </label>
              <input
                id="property-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Property Specifics */}
          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label htmlFor="property-flat-type">
                Flat Type <span style={{ color: "var(--admin-danger-text)" }}>*</span>
              </label>
              <input
                id="property-flat-type"
                type="text"
                value={flatType}
                onChange={(e) => setFlatType(e.target.value)}
                placeholder="e.g. 2 BHK, 3 BHK Luxury"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="property-size">Approx Size (sq ft)</label>
              <input
                id="property-size"
                type="number"
                value={approxSizeSqFt}
                onChange={(e) => setApproxSizeSqFt(e.target.value)}
                placeholder="e.g. 1250"
                min={1}
                max={50000}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="property-society">Society / Project / Developer</label>
            <input
              id="property-society"
              type="text"
              value={societyDeveloper}
              onChange={(e) => setSocietyDeveloper(e.target.value)}
              placeholder="e.g. Pride World City / Supreme Towers"
              disabled={isSubmitting}
            />
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label htmlFor="property-area">Area / Locality</label>
              <input
                id="property-area"
                type="text"
                value={areaLocality}
                onChange={(e) => setAreaLocality(e.target.value)}
                placeholder="e.g. Baner"
                disabled={isSubmitting}
              />
              <span className="admin-field-hint">Neighborhood or sector</span>
            </div>

            <div className="admin-form-group">
              <label htmlFor="property-location">Location / City</label>
              <input
                id="property-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune"
                disabled={isSubmitting}
              />
              <span className="admin-field-hint">City or region</span>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="property-status">Initial Status</label>
            <select
              id="property-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as RentalPropertyStatus)}
              disabled={isSubmitting}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label htmlFor="property-details">Additional Details (From Owner)</label>
            <textarea
              id="property-details"
              rows={3}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Landlord supplied details: furnishing state, floor number, parking, expected deposit..."
              disabled={isSubmitting}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="property-internal-notes">Internal Notes (Admin Only)</label>
            <textarea
              id="property-internal-notes"
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Private triage notes, landlord expected rent, key availability, commission..."
              disabled={isSubmitting}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              className="admin-action admin-action--secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-action admin-action--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
