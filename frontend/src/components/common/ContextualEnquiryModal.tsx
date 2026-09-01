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

import { useState, useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { createLead, LeadApiError } from "../../api/lead";

type ContextualEnquiryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contextType: "project" | "developer";
  entityName: string;
  developerName?: string;
  projectId?: string;
  developerId?: string;
  configurationId?: string;
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

  // Lock page scrolling, establish initial focus, trap keyboard focus inside the
  // modal, and restore focus to the triggering control when the modal closes.
  useEffect(() => {
    if (!isOpen) {
      triggerRef?.current?.focus();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Wait for the opened modal subtree to be painted before focusing its first control.
    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
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
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg("Please enter your name and phone number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await createLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: message.trim() || undefined,
        projectId,
        developerId,
        configurationId,
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
              Your inquiry for <strong>{entityName}</strong> has been received. Our team will reach out with pricing and availability details.
            </p>
            <button
              type="button"
              className="enquiry-modal-submit-btn"
              onClick={handleClose}
            >
              Done
            </button>
          </div>
        ) : (
          <form className="contextual-enquiry-form" onSubmit={handleSubmit}>
            <span className="enquiry-modal-eyebrow">
              {isProject ? "DIRECT PROPERTY INQUIRY" : "DEVELOPER PORTFOLIO INQUIRY"}
            </span>

            <h2 id="modal-enquiry-title" className="enquiry-modal-title">
              {isProject ? `Interested in ${entityName}?` : `Connect with ${entityName}`}
            </h2>

            <p className="enquiry-modal-subtitle">
              {isProject
                ? `Get direct pricing, availability, and unit configuration details${developerName ? ` from ${developerName}` : ""}.`
                : `Request portfolio information, upcoming launches, and direct developer pricing.`}
            </p>

            {errorMsg && <div className="enquiry-modal-error">{errorMsg}</div>}

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
                placeholder={isProject ? "e.g. Interested in 3 BHK pricing and possession date." : "e.g. Looking for 2 & 3 BHK properties in Baner / Wakad."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="enquiry-modal-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Inquiry..." : "Submit Inquiry →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
