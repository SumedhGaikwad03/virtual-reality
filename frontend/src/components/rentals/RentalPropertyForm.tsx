/*
 * PURPOSE:
 * Secondary "List a Property" submission form for owners and landlords.
 *
 * FLOW:
 * RentalsPage -> ListPropertySection -> RentalPropertyForm -> submitRentalProperty API.
 *
 * RESPONSIBILITY:
 * Collects property essentials (ownerName, phone, flatType, areaLocality, approxSizeSqFt, societyDeveloper, additionalDetails).
 * Submits to backend and provides immediate success confirmation along with direct call options.
 */

import { FormEvent, useState } from "react";
import { RentalApiError, submitRentalProperty } from "../../api/rental.api";
import { useSite } from "../home/hooks/useSite";

type PropertyFormState = {
  ownerName: string;
  phone: string;
  flatType: string;
  areaLocality: string;
  approxSizeSqFt: string;
  societyDeveloper: string;
  additionalDetails: string;
};

const initialForm: PropertyFormState = {
  ownerName: "",
  phone: "",
  flatType: "2 BHK",
  areaLocality: "",
  approxSizeSqFt: "",
  societyDeveloper: "",
  additionalDetails: "",
};

export function RentalPropertyForm() {
  const { site } = useSite();
  const [form, setForm] = useState<PropertyFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof PropertyFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    form.ownerName.trim().length > 0 &&
    form.phone.trim().length >= 10 &&
    form.flatType.trim().length > 0 &&
    form.areaLocality.trim().length > 0;

  const phoneLink = site?.contact?.phone ? `tel:${site.contact.phone.replace(/[^+\d]/g, "")}` : null;
  const whatsappUrl = site?.contact?.whatsappUrl || null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.ownerName.trim() || !form.phone.trim()) {
      setError("Please provide your name and a valid phone number.");
      return;
    }

    if (!form.areaLocality.trim()) {
      setError("Please specify the property area or locality.");
      return;
    }

    const parsedSize = form.approxSizeSqFt.trim() ? Number(form.approxSizeSqFt.trim()) : undefined;
    if (parsedSize !== undefined && (isNaN(parsedSize) || parsedSize <= 0)) {
      setError("Approximate size must be a positive number in sq ft.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitRentalProperty({
        ownerName: form.ownerName.trim(),
        phone: form.phone.trim(),
        flatType: form.flatType.trim(),
        areaLocality: form.areaLocality.trim(),
        ...(parsedSize ? { approxSizeSqFt: parsedSize } : {}),
        ...(form.societyDeveloper.trim() ? { societyDeveloper: form.societyDeveloper.trim() } : {}),
        ...(form.additionalDetails.trim() ? { additionalDetails: form.additionalDetails.trim() } : {}),
      });

      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof RentalApiError
          ? err.message
          : "We could not submit your property details. Please verify your details and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rental-form-success-card" role="status" aria-live="polite">
        <div className="success-badge-icon">✓</div>
        <h3 className="success-card-title">Property Details Submitted</h3>
        <p className="success-card-desc">
          Thank you. Our Rental Desk has recorded your property details. We'll be in touch to discuss tenant requirements and key coordination.
        </p>

        {phoneLink && (
          <div className="owner-post-submit-actions">
            <p className="owner-call-prompt">Prefer discussing right away?</p>
            <div className="owner-call-cluster">
              <a href={phoneLink} className="rental-call-btn">
                <span>📞 Call Rental Desk ({site?.contact?.phone})</span>
              </a>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rental-whatsapp-btn"
                >
                  <span>Chat on WhatsApp →</span>
                </a>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="rental-secondary-cta-btn mt-4"
        >
          Submit Another Property
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rental-form" noValidate>
      {error && (
        <div className="rental-form-error-banner" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Owner Contact */}
      <div className="form-group-row">
        <label className="form-label">
          Owner / Contact Name <span className="required-star">*</span>
          <input
            type="text"
            required
            value={form.ownerName}
            onChange={(e) => updateField("ownerName", e.target.value)}
            placeholder="Your full name"
            className="form-input"
          />
        </label>

        <label className="form-label">
          Phone Number <span className="required-star">*</span>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="10-digit mobile number"
            className="form-input"
          />
        </label>
      </div>

      {/* Property Details */}
      <div className="form-group-row">
        <label className="form-label">
          Flat Configuration <span className="required-star">*</span>
          <select
            value={form.flatType}
            onChange={(e) => updateField("flatType", e.target.value)}
            className="form-select"
            required
          >
            <option value="1 BHK">1 BHK</option>
            <option value="1.5 BHK">1.5 BHK</option>
            <option value="2 BHK">2 BHK</option>
            <option value="2.5 BHK">2.5 BHK</option>
            <option value="3 BHK">3 BHK</option>
            <option value="3.5 BHK">3.5 BHK</option>
            <option value="4+ BHK">4+ BHK</option>
            <option value="Penthouse / Villa">Penthouse / Villa</option>
            <option value="Studio / 1 RK">Studio / 1 RK</option>
          </select>
        </label>

        <label className="form-label">
          Locality / Area <span className="required-star">*</span>
          <input
            type="text"
            required
            value={form.areaLocality}
            onChange={(e) => updateField("areaLocality", e.target.value)}
            placeholder="e.g. Kharadi, Baner, Wakad, Viman Nagar"
            className="form-input"
          />
        </label>
      </div>

      <div className="form-group-row">
        <label className="form-label">
          Society / Building Name <span className="optional-tag">(optional)</span>
          <input
            type="text"
            value={form.societyDeveloper}
            onChange={(e) => updateField("societyDeveloper", e.target.value)}
            placeholder="e.g. VTP Pegasus, Kolte Patil Life Republic"
            className="form-input"
          />
        </label>

        <label className="form-label">
          Approx. Size in Sq Ft <span className="optional-tag">(optional)</span>
          <input
            type="number"
            min={100}
            max={50000}
            value={form.approxSizeSqFt}
            onChange={(e) => updateField("approxSizeSqFt", e.target.value)}
            placeholder="e.g. 1150"
            className="form-input"
          />
        </label>
      </div>

      <label className="form-label">
        Additional Information <span className="optional-tag">(optional)</span>
        <textarea
          rows={3}
          value={form.additionalDetails}
          onChange={(e) => updateField("additionalDetails", e.target.value)}
          placeholder="Share rent expectations, deposit, furnishing, floor, parking, or possession dates..."
          className="form-textarea"
        />
      </label>

      {/* Submission Cluster with Direct Call Option */}
      <div className="rental-form-actions">
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="rental-primary-submit-btn"
        >
          {isSubmitting ? "Submitting Property..." : "Submit Property →"}
        </button>

        {phoneLink && (
          <div className="owner-inline-callout">
            <span>Prefer to speak directly? </span>
            <a href={phoneLink} className="inline-call-link">
              Call our Rental Desk ({site?.contact?.phone})
            </a>
          </div>
        )}
      </div>
    </form>
  );
}
