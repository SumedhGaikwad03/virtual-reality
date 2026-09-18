/*
 * PURPOSE:
 * Modal dialog for administrative manual creation of Rental Enquiry records.
 *
 * FLOW:
 * RentalEnquiriesPage -> AddRentalEnquiryModal -> createRentalEnquiry API.
 *
 * RESPONSIBILITY:
 * Provides a structured form for recording seeker requirements, validating inputs,
 * displaying progress/error feedback, and returning the newly created enquiry upon completion.
 */

import { useState, useEffect, type FormEvent } from "react";
import { AdminApiError } from "../../api/admin-client";
import { createRentalEnquiry } from "../../api/admin-rentals";
import type {
  AdminRentalEnquiry,
  RentalEnquiryStatus,
} from "../../types/admin-rental";

type AddRentalEnquiryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (enquiry: AdminRentalEnquiry) => void;
};

const statusOptions: Array<{ value: RentalEnquiryStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "MATCHED", label: "Matched" },
  { value: "CLOSED", label: "Closed" },
  { value: "ARCHIVED", label: "Archived" },
];

export function AddRentalEnquiryModal({
  isOpen,
  onClose,
  onSuccess,
}: AddRentalEnquiryModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [configuration, setConfiguration] = useState("");
  const [location, setLocation] = useState("");
  const [areaLocality, setAreaLocality] = useState("");
  const [budget, setBudget] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [moveInTimeframe, setMoveInTimeframe] = useState("");
  const [whoIsFor, setWhoIsFor] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<RentalEnquiryStatus>("NEW");
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
    setName("");
    setPhone("");
    setConfiguration("");
    setLocation("");
    setAreaLocality("");
    setBudget("");
    setFurnishing("");
    setMoveInTimeframe("");
    setWhoIsFor("");
    setNotes("");
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

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedConfig = configuration.trim();
    const trimmedLoc = location.trim();
    const trimmedArea = areaLocality.trim();

    if (!trimmedName) {
      setError("Seeker name is required.");
      return;
    }

    if (!trimmedPhone) {
      setError("Contact phone number is required.");
      return;
    }

    if (!trimmedConfig) {
      setError("Configuration (e.g. 2 BHK) is required.");
      return;
    }

    if (!trimmedLoc && !trimmedArea) {
      setError("Please specify at least a Location (City) or Area/Locality.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createRentalEnquiry({
        name: trimmedName,
        phone: trimmedPhone,
        configuration: trimmedConfig,
        location: trimmedLoc || undefined,
        areaLocality: trimmedArea || undefined,
        budget: budget.trim() || undefined,
        furnishing: furnishing.trim() || undefined,
        moveInTimeframe: moveInTimeframe.trim() || undefined,
        whoIsFor: whoIsFor.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
        internalNotes: internalNotes.trim() || undefined,
      });

      resetForm();
      onSuccess(response.data);
    } catch (requestError) {
      if (requestError instanceof AdminApiError) {
        setError(requestError.message || "Failed to create rental enquiry.");
      } else if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Unable to create rental enquiry. Please try again.");
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
      aria-labelledby="add-rental-enquiry-title"
    >
      <div className="admin-modal-card--wide">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 id="add-rental-enquiry-title" style={{ margin: 0, fontSize: "1.25rem", color: "var(--admin-text)" }}>
            Add Rental Enquiry
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
          {/* Seeker Contact & Requirement */}
          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label htmlFor="enquiry-name">
                Seeker Name <span style={{ color: "var(--admin-danger-text)" }}>*</span>
              </label>
              <input
                id="enquiry-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="enquiry-phone">
                Phone Number <span style={{ color: "var(--admin-danger-text)" }}>*</span>
              </label>
              <input
                id="enquiry-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label htmlFor="enquiry-config">
                Configuration <span style={{ color: "var(--admin-danger-text)" }}>*</span>
              </label>
              <input
                id="enquiry-config"
                type="text"
                value={configuration}
                onChange={(e) => setConfiguration(e.target.value)}
                placeholder="e.g. 2 BHK, 3 BHK"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="enquiry-budget">Budget</label>
              <input
                id="enquiry-budget"
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. ₹35,000 - ₹45,000"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label htmlFor="enquiry-area">Area / Locality</label>
              <input
                id="enquiry-area"
                type="text"
                value={areaLocality}
                onChange={(e) => setAreaLocality(e.target.value)}
                placeholder="e.g. Baner / Balewadi"
                disabled={isSubmitting}
              />
              <span className="admin-field-hint">Neighborhood or preferred area</span>
            </div>

            <div className="admin-form-group">
              <label htmlFor="enquiry-location">Location / City</label>
              <input
                id="enquiry-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune"
                disabled={isSubmitting}
              />
              <span className="admin-field-hint">City or region</span>
            </div>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label htmlFor="enquiry-furnishing">Furnishing Preference</label>
              <input
                id="enquiry-furnishing"
                type="text"
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                placeholder="e.g. Semi-Furnished / Fully Furnished"
                disabled={isSubmitting}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="enquiry-timeframe">Move-in Timeframe</label>
              <input
                id="enquiry-timeframe"
                type="text"
                value={moveInTimeframe}
                onChange={(e) => setMoveInTimeframe(e.target.value)}
                placeholder="e.g. Immediate / Within 15 days"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label htmlFor="enquiry-who-is-for">Who is it for?</label>
              <input
                id="enquiry-who-is-for"
                type="text"
                value={whoIsFor}
                onChange={(e) => setWhoIsFor(e.target.value)}
                placeholder="e.g. Family / Working Professionals"
                disabled={isSubmitting}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="enquiry-status">Initial Status</label>
              <select
                id="enquiry-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as RentalEnquiryStatus)}
                disabled={isSubmitting}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="enquiry-notes">Seeker Notes / Requirements</label>
            <textarea
              id="enquiry-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes or requirements provided directly by the seeker..."
              disabled={isSubmitting}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="enquiry-internal-notes">Internal Notes (Admin Only)</label>
            <textarea
              id="enquiry-internal-notes"
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Private triage notes, verified budget, follow-up progress..."
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
              {isSubmitting ? "Creating..." : "Create Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
