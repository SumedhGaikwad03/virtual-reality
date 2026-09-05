/*
 * PURPOSE:
 * Structured Contact + Advisory section for the public homepage.
 *
 * FLOW:
 * HomePage -> ContactAdvisorySection -> createLead API (Branch 1: Advisory Lead) OR openAssistant() (Branch 1: Tara Assistant) OR direct action triggers (Branch 2: Contact Channels).
 *
 * RESPONSIBILITY:
 * Presents a clear two-branch architecture:
 * 1. Advisory & Guidance:
 *    - Path A: Request human advisory consultation (submits to createLead API with status/validation feedback).
 *    - Path B: Launch Tara property discovery assistant.
 * 2. Direct Contact Channels:
 *    - Persisted phone, email, office address, WhatsApp, Google Maps, and clipboard copy action.
 */

import { FormEvent, useState } from "react";
import { createLead, LeadApiError } from "../../api/lead";
import { useAssistant } from "../../context/AssistantContext";
import type { Site } from "../../types/site";

type ContactAdvisorySectionProps = {
  site: Site;
};

type AdvisoryFormState = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

const initialForm: AdvisoryFormState = {
  name: "",
  phone: "",
  email: "",
  message: "",
};

export function ContactAdvisorySection({ site }: ContactAdvisorySectionProps) {
  const { openAssistant } = useAssistant();
  const [form, setForm] = useState<AdvisoryFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const contact = site.contact;
  const rawPhone = contact.phone ? contact.phone.replace(/\s+/g, "") : "";

  function updateField(field: keyof AdvisoryFormState, value: string) {
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
      const messageContent = form.message.trim()
        ? `[Advisory Consultation] ${form.message.trim()}`
        : "[Advisory Consultation Request]";

      await createLead({
        name: form.name.trim(),
        phone: form.phone.trim(),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        message: messageContent,
      });

      setForm(initialForm);
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof LeadApiError
          ? "We could not submit your consultation request. Please try again."
          : "We could not submit your consultation request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCopyNumber() {
    if (contact.phone) {
      navigator.clipboard.writeText(contact.phone);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }

  const effectiveMapsUrl =
    contact.googleMapsUrl ||
    (contact.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          contact.address,
        )}`
      : null);

  const whatsappUrl =
    contact.whatsappUrl ||
    (rawPhone
      ? `https://api.whatsapp.com/send/?phone=${rawPhone.replace(/^\+/, "")}&text&type=phone_number&app_absent=0`
      : null);

  return (
    <section
      id="contact"
      className="contact-advisory-section"
      aria-labelledby="contact-advisory-heading"
    >
      {/* Section Editorial Header */}
      <div className="section-header-editorial">
        <span className="section-eyebrow">CONNECT & ADVISORY</span>
        <h2 id="contact-advisory-heading" className="section-title">
          Let’s Connect
        </h2>
        <p className="section-subtitle">
          Whether you have a question, need personalized guidance, or want to explore properties, choose what works best for you.
        </p>
      </div>

      <div className="contact-advisory-grid">
        {/* ====================================================================
            BRANCH 1: Property Advisory & Guidance
           ==================================================================== */}
        <div id="advisory" className="advisory-card">
          <div className="advisory-card-header">
            <span className="card-badge-eyebrow">CONSULTATION & DISCOVERY</span>
            <h3 className="card-heading">Property Advisory</h3>
            <p className="card-description">
              Get bespoke architectural recommendations or explore prime inventory with Tara, our property discovery advisor.
            </p>
          </div>

          {/* Path B: Fast Option-Based Discovery Entry */}
          <div className="tara-discovery-callout">
            <div className="tara-callout-text">
              <strong>Prefer guided discovery?</strong>
              <span>Explore matching Pune residences step by step with Tara.</span>
            </div>
            <button
              type="button"
              onClick={openAssistant}
              className="tara-launch-btn"
              aria-label="Explore properties with Tara"
            >
              ✦ Explore with Tara →
            </button>
          </div>

          <div className="advisory-divider">
            <span>or request a personalized consultation</span>
          </div>

          {/* Path A: Human Advisory Consultation Request Form */}
          {submitted && (
            <div className="advisory-success-banner" role="status">
              <strong>Consultation Request Received</strong>
              <p>Our senior real estate advisory team will reach out to you shortly.</p>
            </div>
          )}

          {error && (
            <div className="advisory-error-banner" role="alert">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="advisory-consultation-form">
            <div className="form-group-row">
              <label className="form-label">
                <span className="form-label-text">
                  Name <span className="required-star" aria-hidden="true">*</span>
                </span>
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
                <span className="form-label-text">
                  Phone <span className="required-star" aria-hidden="true">*</span>
                </span>
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
              <span className="form-label-text">
                Email <span className="optional-tag">(optional)</span>
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="Email address"
                className="form-input"
              />
            </label>

            <label className="form-label">
              <span className="form-label-text">
                Requirements or Questions <span className="optional-tag">(optional)</span>
              </span>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                placeholder="Please share your preferred configurations, locations, or questions (e.g. 3 BHK in Baner, budget preferences)..."
                className="form-textarea"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="advisory-submit-btn"
            >
              {isSubmitting ? "Submitting Request..." : "Request Advisory Consultation →"}
            </button>
          </form>
        </div>

        {/* ====================================================================
            BRANCH 2: Direct Contact Channels & Office Details
           ==================================================================== */}
        <div className="direct-contact-card">
          <div className="direct-contact-header">
            <span className="card-badge-eyebrow">DIRECT REACH</span>
            <h3 className="card-heading">Direct Channels & Office</h3>
            <p className="card-description">
              Reach our desk directly or visit our office for in-person consultation.
            </p>
          </div>

          <div className="direct-contact-details">
            {contact.contactPersonName && (
              <div className="contact-person-badge">
                <span className="person-icon" aria-hidden="true">👤</span>
                <div>
                  <strong>{contact.contactPersonName}</strong>
                  <span className="person-role">Authorized Firm Representative</span>
                </div>
              </div>
            )}

            {contact.phone && (
              <div className="contact-detail-row">
                <span className="detail-label">Direct Phone</span>
                <div className="detail-value-group">
                  <a href={`tel:${rawPhone}`} className="detail-link">
                    {contact.phone}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="detail-copy-btn"
                    aria-label="Copy phone number"
                  >
                    {copySuccess ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            {contact.email && (
              <div className="contact-detail-row">
                <span className="detail-label">Email Inquiries</span>
                <a href={`mailto:${contact.email}`} className="detail-link">
                  {contact.email}
                </a>
              </div>
            )}

            {contact.address && (
              <div className="contact-detail-row">
                <span className="detail-label">Office Address</span>
                <address className="detail-address">
                  {contact.address.split("\n").map((line, idx) => (
                    <span key={idx} className="address-line">
                      {line}
                    </span>
                  ))}
                </address>
              </div>
            )}
          </div>

          {/* Direct Action Suite */}
          <div className="direct-action-suite" role="group" aria-label="Quick contact actions">
            {contact.phone && (
              <a
                href={`tel:${rawPhone}`}
                className="action-tile action-tile--call"
                aria-label={`Call ${contact.phone}`}
              >
                <span className="action-icon" aria-hidden="true">📞</span>
                <span className="action-title">Call Now</span>
                <span className="action-meta">{contact.phone}</span>
              </a>
            )}

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-tile action-tile--whatsapp"
                aria-label="Chat on WhatsApp"
              >
                <span className="action-icon" aria-hidden="true">💬</span>
                <span className="action-title">WhatsApp</span>
                <span className="action-meta">Instant Chat</span>
              </a>
            )}

            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="action-tile action-tile--email"
                aria-label={`Email ${contact.email}`}
              >
                <span className="action-icon" aria-hidden="true">✉</span>
                <span className="action-title">Email Us</span>
                <span className="action-meta">{contact.email}</span>
              </a>
            )}

            {effectiveMapsUrl && (
              <a
                href={effectiveMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-tile action-tile--maps"
                aria-label="View on Google Maps"
              >
                <span className="action-icon" aria-hidden="true">📍</span>
                <span className="action-title">Get Directions</span>
                <span className="action-meta">Google Maps</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
