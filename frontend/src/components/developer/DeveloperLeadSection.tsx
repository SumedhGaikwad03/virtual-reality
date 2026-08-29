/*
 * PURPOSE:
 * Renders the developer-level enquiry form on the public Developer page.
 *
 * FLOW:
 * Developer Enquiry Flow: DeveloperPage -> DeveloperLeadSection -> createLead API (developerId context).
 *
 * RESPONSIBILITY:
 * Handles consumer contact input for enquiring directly about a developer,
 * automatically binds developerId context (omitting projectId & configurationId),
 * submits enquiry payload via createLead API, and renders submission status.
 */

import { FormEvent, useState } from "react";
import { createLead, LeadApiError } from "../../api/lead";
import type { PublicDeveloper } from "../../types/developer";

type DeveloperLeadSectionProps = {
  developer: PublicDeveloper;
};

type DeveloperLeadFormState = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

const initialForm: DeveloperLeadFormState = {
  name: "",
  phone: "",
  email: "",
  message: "",
};

export function DeveloperLeadSection({ developer }: DeveloperLeadSectionProps) {
  const [form, setForm] = useState<DeveloperLeadFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof DeveloperLeadFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSubmitted(false);

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone number are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createLead({
        name: form.name.trim(),
        phone: form.phone.trim(),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        developerId: developer.id,
        ...(form.message.trim() ? { message: form.message.trim() } : {}),
      });

      setForm(initialForm);
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof LeadApiError
          ? "We could not submit your enquiry. Please try again."
          : "We could not submit your enquiry. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="developer-lead-section" aria-labelledby="developer-enquiry-heading">
      <div className="developer-lead-card">
        <span className="section-eyebrow">ENQUIRE</span>
        <h2 id="developer-enquiry-heading" className="developer-lead-title">
          Interested in {developer.name}?
        </h2>
        <p className="developer-lead-subtitle">
          Connect directly with {developer.name} for current and upcoming developments.
        </p>

        {submitted && (
          <div className="developer-lead-success" role="status">
            <p>Your enquiry for {developer.name} has been submitted. Our team will reach out shortly.</p>
          </div>
        )}

        {error && (
          <div className="developer-lead-error" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="developer-lead-form">
          <div className="form-group-row">
            <label className="form-label">
              Name <span className="required-star">*</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Your full name"
                className="form-input"
              />
            </label>

            <label className="form-label">
              Phone <span className="required-star">*</span>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="Phone number"
                className="form-input"
              />
            </label>
          </div>

          <label className="form-label">
            Email <span className="optional-tag">(optional)</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="Email address"
              className="form-input"
            />
          </label>

          <label className="form-label">
            Message <span className="optional-tag">(optional)</span>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder={`Share what you're looking for with ${developer.name}...`}
              className="form-textarea"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="developer-lead-submit-btn"
          >
            {isSubmitting ? "Submitting..." : `Enquire about ${developer.name} →`}
          </button>
        </form>
      </div>
    </section>
  );
}
