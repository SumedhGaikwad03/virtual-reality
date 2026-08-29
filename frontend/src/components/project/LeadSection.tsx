/*
 * PURPOSE:
 * Renders the project enquiry and lead capture form on the public project page.
 *
 * FLOW:
 * Lead / Enquiry Flow: ProjectPage -> LeadSection -> createLead API.
 *
 * RESPONSIBILITY:
 * Handles consumer contact input, automatically binds project and selected configuration context,
 * submits enquiry payload via createLead API, and renders submission status.
 */

import { FormEvent, useEffect, useState } from "react";
import type { RefObject } from "react";
import { createLead, LeadApiError } from "../../api/lead";
import type { Configuration, Project } from "../../types/project";

type LeadSectionProps = {
  project: Project;
  selectedConfigurationId?: string | null;
  contactRef?: RefObject<HTMLFormElement | null>;
};

type LeadFormState = {
  name: string;
  phone: string;
  email: string;
  configurationId: string;
  message: string;
};

const initialForm: LeadFormState = {
  name: "",
  phone: "",
  email: "",
  configurationId: "",
  message: "",
};

export function LeadSection({
  project,
  selectedConfigurationId,
  contactRef,
}: LeadSectionProps) {
  const [form, setForm] = useState<LeadFormState>({
    ...initialForm,
    configurationId: selectedConfigurationId ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize configuration selection from the ProjectPage orchestrator / URL
  useEffect(() => {
    setForm((current) => ({
      ...current,
      configurationId: selectedConfigurationId ?? "",
    }));
  }, [selectedConfigurationId]);

  function updateField(field: keyof LeadFormState, value: string) {
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
        projectId: project.id,
        ...(form.configurationId
          ? { configurationId: form.configurationId }
          : {}),
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
    <section className="project-lead-section" aria-labelledby="project-lead-heading">
      <div className="project-lead-card">
        <span className="section-eyebrow">ENQUIRE</span>
        <h2 id="project-lead-heading" className="project-lead-title">
          Interested in {project.name}?
        </h2>
        <p className="project-lead-subtitle">
          Connect with our real-estate team for pricing, availability, and exclusive site visits.
        </p>

        {submitted && (
          <div className="project-lead-success" role="status">
            <p>Your enquiry for {project.name} has been submitted. Our team will reach out shortly.</p>
          </div>
        )}

        {error && (
          <div className="project-lead-error" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form ref={contactRef} onSubmit={handleSubmit} className="project-lead-form">
          <div className="form-group-row">
            <label className="form-label">
              Name <span className="required-star">*</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
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
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="Phone number"
                className="form-input"
              />
            </label>
          </div>

          <div className="form-group-row">
            <label className="form-label">
              Email <span className="optional-tag">(optional)</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Email address"
                className="form-input"
              />
            </label>

            {project.configurations.length > 0 && (
              <label className="form-label">
                Preferred Configuration <span className="optional-tag">(optional)</span>
                <select
                  value={form.configurationId}
                  onChange={(event) => updateField("configurationId", event.target.value)}
                  className="form-select"
                >
                  <option value="">Any configuration</option>
                  {project.configurations.map((config: Configuration) => (
                    <option key={config.id} value={config.id}>
                      {config.name} ({config.bhk} BHK)
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <label className="form-label">
            Message <span className="optional-tag">(optional)</span>
            <textarea
              rows={3}
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              placeholder={`Share what you're looking for at ${project.name}...`}
              className="form-textarea"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="project-lead-submit-btn"
          >
            {isSubmitting ? "Submitting..." : `Enquire about ${project.name} →`}
          </button>
        </form>
      </div>
    </section>
  );
}