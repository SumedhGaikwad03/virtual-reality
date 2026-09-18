/*
 * PURPOSE:
 * Proactive "Let's Connect" Advisory Popup modal component for the public website.
 *
 * FLOW:
 * PublicShell (5-second session timer) -> AdvisoryPopupModal -> Invitation view -> Enquiry form view -> createLead API -> Success view.
 *
 * RESPONSIBILITY:
 * 1. Presents a warm, concise human advisory invitation card ("Let's Connect").
 * 2. Transitions seamlessly into the existing lead enquiry form on "[ Let's Connect ]" click.
 * 3. Provides direct reach actions (Phone call, WhatsApp) using configured site contact data.
 * 4. Submits inquiries through the existing lead submission pipeline (POST /api/leads).
 * 5. Manages keyboard focus trapping, Escape key dismissal, backdrop dismiss, and body scroll lock.
 */

import { useState, useEffect, useRef, type FormEvent } from "react";
import { createLead, LeadApiError } from "../../api/lead";
import type { Site } from "../../types/site";

type AdvisoryPopupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  site?: Site | null;
};

type ViewMode = "invite" | "form" | "success";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(",");

export function AdvisoryPopupModal({
  isOpen,
  onClose,
  site,
}: AdvisoryPopupModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("invite");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const primaryBtnRef = useRef<HTMLButtonElement | null>(null);
  const successBtnRef = useRef<HTMLButtonElement | null>(null);

  // Reset view mode and errors when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setViewMode("invite");
      setErrorMsg(null);
    }
  }, [isOpen]);

  // Handle focus trapping, Escape key, and body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-focus relevant control based on current view mode
    const timer = setTimeout(() => {
      if (viewMode === "invite") {
        primaryBtnRef.current?.focus();
      } else if (viewMode === "form") {
        firstInputRef.current?.focus();
      } else if (viewMode === "success") {
        successBtnRef.current?.focus();
      }
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        focusableSelector,
      );

      if (!focusableElements || focusableElements.length === 0) {
        event.preventDefault();
        modalRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, viewMode, onClose]);

  if (!isOpen) return null;

  const contact = site?.contact;
  const rawPhone = contact?.phone ? contact.phone.replace(/\s+/g, "") : "";
  const displayPhone = contact?.phone;
  const whatsappUrl =
    contact?.whatsappUrl ||
    (rawPhone
      ? `https://api.whatsapp.com/send/?phone=${rawPhone.replace(/^\+/, "")}&text=${encodeURIComponent(
          "Hello, I would like to connect with the Virtual Reality advisory team.",
        )}&type=phone_number&app_absent=0`
      : null);

  const handleStartForm = () => {
    setViewMode("form");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg("Please enter your name and phone number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const messageContent = message.trim()
        ? `[Advisory Consultation] ${message.trim()}`
        : "[Advisory Consultation Request]";

      await createLead({
        name: name.trim(),
        phone: phone.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
        message: messageContent,
      });

      setViewMode("success");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err) {
      if (err instanceof LeadApiError) {
        setErrorMsg("Unable to send inquiry. Please check your contact information.");
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setViewMode("invite");
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      className="advisory-popup-backdrop"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="advisory-popup-card"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="advisory-popup-title"
        data-lenis-prevent
      >
        {/* Close Button */}
        <button
          type="button"
          className="advisory-popup-close-btn"
          onClick={handleClose}
          aria-label="Close advisory invitation"
        >
          ✕
        </button>

        {/* ====================================================================
            STAGE 1: INVITATION VIEW
           ==================================================================== */}
        {viewMode === "invite" && (
          <div className="advisory-popup-invite-container">
            <div className="advisory-popup-header-block">
              <span className="advisory-popup-eyebrow">LET'S CONNECT</span>
              <h2 id="advisory-popup-title" className="advisory-popup-title">
                A more personal way to find the right home.
              </h2>
              <p className="advisory-popup-subtitle">
                Tell us what you're looking for, and our advisory team will guide you to the right next step across Pune's finest residences.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="advisory-popup-primary-action">
              <button
                ref={primaryBtnRef}
                type="button"
                className="advisory-popup-primary-btn"
                onClick={handleStartForm}
              >
                <span>Let's Connect →</span>
              </button>
            </div>

            {/* Direct Reach Channels */}
            {(displayPhone || whatsappUrl) && (
              <div className="advisory-popup-direct-reach">
                <span className="advisory-popup-direct-label">Prefer to speak directly?</span>
                <div className="advisory-popup-direct-links">
                  {displayPhone && (
                    <a
                      href={`tel:${rawPhone}`}
                      className="advisory-popup-channel-link"
                      aria-label={`Call advisory desk at ${displayPhone}`}
                    >
                      <span className="channel-icon" aria-hidden="true">📞</span>
                      <span>Call {displayPhone}</span>
                    </a>
                  )}

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="advisory-popup-channel-link advisory-popup-channel-link--whatsapp"
                      aria-label="Chat on WhatsApp with advisory desk"
                    >
                      <span className="channel-icon" aria-hidden="true">💬</span>
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Subtle dismiss option */}
            <div className="advisory-popup-dismiss-row">
              <button
                type="button"
                className="advisory-popup-maybe-later-btn"
                onClick={handleClose}
              >
                Maybe later
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            STAGE 2: FORM VIEW
           ==================================================================== */}
        {viewMode === "form" && (
          <form className="advisory-popup-form" onSubmit={handleSubmit}>
            <div className="advisory-popup-header-block">
              <span className="advisory-popup-eyebrow">ADVISORY CONSULTATION</span>
              <h2 id="advisory-popup-title" className="advisory-popup-title">
                How can we assist you?
              </h2>
              <p className="advisory-popup-subtitle">
                Share what you're looking for, and our team will get in touch with curated options.
              </p>
            </div>

            {errorMsg && (
              <div className="advisory-popup-error" role="alert">
                {errorMsg}
              </div>
            )}

            <div className="advisory-form-field">
              <label htmlFor="advisory-popup-name">
                Your Name <span className="required-star">*</span>
              </label>
              <input
                id="advisory-popup-name"
                ref={firstInputRef}
                type="text"
                className="advisory-form-input"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="advisory-form-field">
              <label htmlFor="advisory-popup-phone">
                Phone Number <span className="required-star">*</span>
              </label>
              <input
                id="advisory-popup-phone"
                type="tel"
                className="advisory-form-input"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="advisory-form-field">
              <label htmlFor="advisory-popup-email">
                Email Address <span className="optional-tag">(Optional)</span>
              </label>
              <input
                id="advisory-popup-email"
                type="email"
                className="advisory-form-input"
                placeholder="e.g. rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="advisory-form-field">
              <label htmlFor="advisory-popup-message">
                Preferred Locations / Configurations <span className="optional-tag">(Optional)</span>
              </label>
              <textarea
                id="advisory-popup-message"
                className="advisory-form-textarea"
                rows={2}
                placeholder="e.g. Looking for a 3 BHK in Baner or Koregaon Park..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="advisory-form-actions">
              <button
                type="submit"
                className="advisory-popup-primary-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting Request..." : "Request Consultation →"}
              </button>

              <button
                type="button"
                className="advisory-popup-back-btn"
                onClick={() => setViewMode("invite")}
              >
                ← Back
              </button>
            </div>
          </form>
        )}

        {/* ====================================================================
            STAGE 3: SUCCESS CONFIRMATION VIEW
           ==================================================================== */}
        {viewMode === "success" && (
          <div className="advisory-popup-success-container">
            <span className="advisory-popup-success-badge">✓ REQUEST RECEIVED</span>
            <h2 id="advisory-popup-title" className="advisory-popup-title">
              Thank You
            </h2>
            <p className="advisory-popup-subtitle">
              Your consultation request has been received. Our senior advisory team will reach out to you shortly.
            </p>
            <button
              ref={successBtnRef}
              type="button"
              className="advisory-popup-primary-btn"
              onClick={handleClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
