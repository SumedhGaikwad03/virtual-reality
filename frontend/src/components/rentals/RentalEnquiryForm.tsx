/*
 * PURPOSE:
 * Primary "Looking to Rent" enquiry form.
 *
 * FLOW:
 * RentalsPage -> RentalEnquirySection -> RentalEnquiryForm -> submitRentalEnquiry API.
 *
 * RESPONSIBILITY:
 * Collects renter requirements (core: BHK, locality, name, phone; optional: budget, furnishing, move-in, who it's for, notes).
 * Submits to backend and renders polished submission feedback without gating on optional fields.
 */

import { FormEvent, useState } from "react";
import { RentalApiError, submitRentalEnquiry } from "../../api/rental.api";

type RenterFormState = {
  name: string;
  phone: string;
  configuration: string;
  areaLocality: string;
  budget: string;
  furnishing: string;
  moveInTimeframe: string;
  whoIsFor: string;
  notes: string;
};

const initialForm: RenterFormState = {
  name: "",
  phone: "",
  configuration: "2 BHK",
  areaLocality: "",
  budget: "",
  furnishing: "",
  moveInTimeframe: "",
  whoIsFor: "",
  notes: "",
};

export function RentalEnquiryForm() {
  const [form, setForm] = useState<RenterFormState>(initialForm);
  const [showOptional, setShowOptional] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof RenterFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    form.name.trim().length > 0 &&
    form.phone.trim().length >= 10 &&
    form.configuration.trim().length > 0 &&
    form.areaLocality.trim().length > 0;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please provide your name and a valid phone number.");
      return;
    }

    if (!form.areaLocality.trim()) {
      setError("Please specify your preferred area or locality (e.g. Baner, Kharadi).");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitRentalEnquiry({
        name: form.name.trim(),
        phone: form.phone.trim(),
        configuration: form.configuration.trim(),
        areaLocality: form.areaLocality.trim(),
        ...(form.budget.trim() ? { budget: form.budget.trim() } : {}),
        ...(form.furnishing.trim() ? { furnishing: form.furnishing.trim() } : {}),
        ...(form.moveInTimeframe.trim() ? { moveInTimeframe: form.moveInTimeframe.trim() } : {}),
        ...(form.whoIsFor.trim() ? { whoIsFor: form.whoIsFor.trim() } : {}),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      });

      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof RentalApiError
          ? err.message
          : "We could not submit your enquiry. Please verify your details and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rental-form-success-card" role="status" aria-live="polite">
        <div className="success-badge-icon">✓</div>
        <h3 className="success-card-title">Enquiry Received</h3>
        <p className="success-card-desc">
          Thank you. Our Rental Desk has received your requirement. A property advisor will review relevant opportunities and reach out to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="rental-secondary-cta-btn"
        >
          Submit Another Enquiry
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

      {/* Primary Essential Requirements */}
      <div className="form-group-row">
        <label className="form-label">
          Flat Configuration <span className="required-star">*</span>
          <select
            value={form.configuration}
            onChange={(e) => updateField("configuration", e.target.value)}
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
          </select>
        </label>

        <label className="form-label">
          Preferred Locality / Area <span className="required-star">*</span>
          <input
            type="text"
            required
            value={form.areaLocality}
            onChange={(e) => updateField("areaLocality", e.target.value)}
            placeholder="e.g. Baner, Balewadi, Kharadi, Koregaon Park"
            className="form-input"
          />
        </label>
      </div>

      <div className="form-group-row">
        <label className="form-label">
          Full Name <span className="required-star">*</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Your name"
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

      {/* Progressive Disclosure for Additional Preferences */}
      <div className="optional-toggle-wrapper">
        <button
          type="button"
          onClick={() => setShowOptional((prev) => !prev)}
          className="optional-toggle-btn"
          aria-expanded={showOptional}
        >
          <span>{showOptional ? "− Fewer preferences" : "+ Add budget & move-in preferences (optional)"}</span>
        </button>
      </div>

      {showOptional && (
        <div className="optional-fields-container">
          <div className="form-group-row">
            <label className="form-label">
              Monthly Budget Range <span className="optional-tag">(optional)</span>
              <input
                type="text"
                value={form.budget}
                onChange={(e) => updateField("budget", e.target.value)}
                placeholder="e.g. ₹25,000 – ₹35,000 / month"
                className="form-input"
              />
            </label>

            <label className="form-label">
              Furnishing Preference <span className="optional-tag">(optional)</span>
              <select
                value={form.furnishing}
                onChange={(e) => updateField("furnishing", e.target.value)}
                className="form-select"
              >
                <option value="">Any / Flexible</option>
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully Furnished">Fully Furnished</option>
              </select>
            </label>
          </div>

          <div className="form-group-row">
            <label className="form-label">
              Move-in Timeline <span className="optional-tag">(optional)</span>
              <select
                value={form.moveInTimeframe}
                onChange={(e) => updateField("moveInTimeframe", e.target.value)}
                className="form-select"
              >
                <option value="">Flexible</option>
                <option value="Immediate">Immediate / Within 7 days</option>
                <option value="Within 15-30 days">Within 15–30 days</option>
                <option value="Next month">Next month onwards</option>
              </select>
            </label>

            <label className="form-label">
              Who is the home for? <span className="optional-tag">(optional)</span>
              <select
                value={form.whoIsFor}
                onChange={(e) => updateField("whoIsFor", e.target.value)}
                className="form-select"
              >
                <option value="">Prefer not to say</option>
                <option value="Family">Family</option>
                <option value="Working Professionals">Working Professionals / Bachelors</option>
                <option value="Company Lease">Company / Corporate Lease</option>
                <option value="Individual">Individual</option>
              </select>
            </label>
          </div>

          <label className="form-label">
            Specific Requirements / Notes <span className="optional-tag">(optional)</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="e.g. High floor, gated society, pet friendly, parking needed..."
              className="form-textarea"
            />
          </label>
        </div>
      )}

      {/* Submission CTA */}
      <div className="rental-form-actions">
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="rental-primary-submit-btn"
        >
          {isSubmitting ? "Sending Enquiry..." : "Send Rental Enquiry →"}
        </button>
        <span className="rental-form-privacy-note">
          Your contact information is only used by Virtual Reality to discuss relevant rental options.
        </span>
      </div>
    </form>
  );
}
