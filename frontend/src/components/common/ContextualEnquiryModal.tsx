/*
 * PURPOSE:
 * Provides an accessible, non-intrusive contextual enquiry modal for Project and Developer pages.
 *
 * FLOW:
 * CTA Click (ProjectPage / DeveloperPage / Sticky Bar) -> ContextualEnquiryModal -> Lead API -> Success feedback
 *
 * RESPONSIBILITY:
 * Manages modal visibility, accessible focus trapping/restoration, body scroll locking,
 * Escape key listener, backdrop click dismiss, and submitting inbound lead inquiries.
 */

import { useState, useEffect, useRef, type FormEvent } from "react";
import { createLead, LeadApiError } from "../../api/lead";

export type ConfigurationContextInfo = {
  id?: string;
  name?: string;
  bhk?: number;
  carpetArea?: number;
};

type ContextualEnquiryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contextType: "project" | "developer";
  entityName: string;
  developerName?: string;
  projectId?: string;
  developerId?: string;
  configurationId?: string;
  configurationInfo?: ConfigurationContextInfo | null;
  triggerRef?: React.RefObject<HTMLElement | null>;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(",");

export function ContextualEnquiryModal({
  isOpen,
  onClose,
  contextType,
  entityName,
  developerName,
  projectId,
  developerId,
  configurationId,
  configurationInfo,
  triggerRef,
}: ContextualEnquiryModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const successBtnRef = useRef<HTMLButtonElement | null>(null);

  // Lock page scrolling, establish initial focus, trap keyboard focus inside the
  // modal, and restore focus to the triggering control when the modal closes.
  useEffect(() => {
    if (!isOpen) {
      triggerRef?.current?.focus();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first interactive control once the opened modal paints
    const timer = setTimeout(() => {
      if (isSuccess) {
        successBtnRef.current?.focus();
      } else {
        firstInputRef.current?.focus();
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
  }, [isOpen, isSuccess, triggerRef, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg("Please enter your name and phone number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const effectiveConfigId = configurationId || configurationInfo?.id;

    try {
      await createLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: message.trim() || undefined,
        projectId,
        developerId,
        configurationId: effectiveConfigId,
      });

      setIsSuccess(true);
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
    setIsSuccess(false);
    setErrorMsg(null);
    onClose();
  };

  const isProject = contextType === "project";

  return (
    <div
      className="contextual-enquiry-backdrop"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="contextual-enquiry-card"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-enquiry-title"
        data-lenis-prevent
      >
        <button
          type="button"
          className="contextual-enquiry-close-btn"
          onClick={handleClose}
          aria-label="Close inquiry modal"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="enquiry-success-container">
            <span className="enquiry-success-badge">✓ REQUEST RECEIVED</span>
            <h2 id="modal-enquiry-title" className="enquiry-modal-title">
              Thank You
            </h2>
            <p className="enquiry-modal-subtitle">
              Your enquiry for <strong>{entityName}</strong> has been received. We’ll be in touch shortly.
            </p>
            <button
              ref={successBtnRef}
              type="button"
              className="enquiry-modal-submit-btn"
              onClick={handleClose}
            >
              Done
            </button>
          </div>
        ) : (
          <form className="contextual-enquiry-form" onSubmit={handleSubmit}>
            <div className="enquiry-modal-header-block">
              <span className="enquiry-modal-eyebrow">
                {isProject ? "ENQUIRE ABOUT" : "DEVELOPER ENQUIRY"}
              </span>

              <h2 id="modal-enquiry-title" className="enquiry-modal-title">
                {entityName}
              </h2>

              {isProject && developerName && (
                <div className="enquiry-modal-developer-by">
                  by {developerName}
                </div>
              )}

              <p className="enquiry-modal-subtitle">
                {isProject
                  ? "Tell us how you'd like to explore this property."
                  : "Connect directly for portfolio details, upcoming launches, and pricing."}
              </p>
            </div>

            {/* Contextual Configuration Information Pill (Informational Only) */}
            {configurationInfo && (configurationInfo.name || configurationInfo.bhk) && (
              <div className="enquiry-contextual-config-card">
                <span className="enquiry-contextual-config-label">Configuration</span>
                <span className="enquiry-contextual-config-value">
                  {configurationInfo.name}
                  {configurationInfo.bhk ? ` · ${configurationInfo.bhk} BHK` : ""}
                  {configurationInfo.carpetArea
                    ? ` · ${configurationInfo.carpetArea.toLocaleString()} sq.ft.`
                    : ""}
                </span>
              </div>
            )}

            {errorMsg && <div className="enquiry-modal-error" role="alert">{errorMsg}</div>}

            <div className="enquiry-form-group">
              <label htmlFor="enquiry-name">
                Your Name <span className="required-star">*</span>
              </label>
              <input
                id="enquiry-name"
                ref={firstInputRef}
                type="text"
                className="enquiry-form-input"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="enquiry-form-group">
              <label htmlFor="enquiry-phone">
                Phone Number <span className="required-star">*</span>
              </label>
              <input
                id="enquiry-phone"
                type="tel"
                className="enquiry-form-input"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="enquiry-form-group">
              <label htmlFor="enquiry-email">
                Email Address <span className="optional-tag">(Optional)</span>
              </label>
              <input
                id="enquiry-email"
                type="email"
                className="enquiry-form-input"
                placeholder="e.g. rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="enquiry-form-group">
              <label htmlFor="enquiry-message">
                Message or Requirements <span className="optional-tag">(Optional)</span>
              </label>
              <textarea
                id="enquiry-message"
                className="enquiry-form-textarea"
                rows={2}
                placeholder={
                  isProject
                    ? `Share what you're looking for at ${entityName}...`
                    : `Share what you're looking for with ${entityName}...`
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="enquiry-modal-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Enquiry →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
