/*
 * PURPOSE:
 * Renders the project enquiry and lead capture form on the public project page.
 *
 * FLOW:
 * Lead / Enquiry Flow
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
      setError("Name and phone are required.");
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
    <section>
      <h2>Enquire about this project</h2>

      {submitted && (
        <p role="status">
          Your enquiry has been submitted.
        </p>
      )}

      {error && <p role="alert">{error}</p>}

      <form ref={contactRef} onSubmit={handleSubmit}>
        <label>
          Name
          <input
            required
            value={form.name}
            onChange={(event) =>
              updateField("name", event.target.value)
            }
          />
        </label>

        <label>
          Phone
          <input
            required
            value={form.phone}
            onChange={(event) =>
              updateField("phone", event.target.value)
            }
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              updateField("email", event.target.value)
            }
          />
        </label>

        {project.configurations.length > 0 && (
          <label>
            Configuration
            <select
              value={form.configurationId}
              onChange={(event) =>
                updateField("configurationId", event.target.value)
              }
            >
              <option value="">Any configuration</option>

              {project.configurations.map(
                (configuration: Configuration) => (
                  <option
                    key={configuration.id}
                    value={configuration.id}
                  >
                    {configuration.name}
                  </option>
                ),
              )}
            </select>
          </label>
        )}

        <label>
          Message
          <textarea
            value={form.message}
            onChange={(event) =>
              updateField("message", event.target.value)
            }
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit enquiry"}
        </button>
      </form>
    </section>
  );
}