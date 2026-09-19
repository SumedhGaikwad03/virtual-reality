/*
 * PURPOSE:
 * Provides an accessible, non-intrusive contextual enquiry modal for Project and Developer pages.
 *
 * FLOW:
 * CTA Click (Schedule a Visit / Request a Callback / Configuration / SubNav) -> ContextualEnquiryModal -> Lead API -> Success feedback
 *
 * RESPONSIBILITY:
 * Manages modal visibility, accessible focus trapping/restoration, body scroll locking,
 * Escape key listener, backdrop click dismiss, 2-step Schedule Visit progressive disclosure,
 * streamlined Request Callback flow, and submitting inbound lead inquiries with automatic context.
 */

import { useState, useEffect, useRef, type FormEvent } from "react";
import { createLead, LeadApiError } from "../../api/lead";
import { getOptimizedImageUrl } from "../../utils/image";

export type EnquiryIntent = "SCHEDULE_VISIT" | "REQUEST_CALLBACK";

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
  locationName?: string;
  projectThumbnailUrl?: string | null;
  projectId?: string;
  developerId?: string;
  configurationId?: string;
  configurationInfo?: ConfigurationContextInfo | null;
  triggerRef?: React.RefObject<HTMLElement | null>;
  initialIntent?: EnquiryIntent;
};

type TimeSlot = "Morning" | "Afternoon" | "Evening";

const timeSlots: Array<{ id: TimeSlot; label: string; hours: string }> = [
  { id: "Morning", label: "Morning", hours: "10 AM – 1 PM" },
  { id: "Afternoon", label: "Afternoon", hours: "1 PM – 5 PM" },
  { id: "Evening", label: "Evening", hours: "5 PM – 8 PM" },
];

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
  locationName,
  projectThumbnailUrl,
  projectId,
  developerId,
  configurationId,
  configurationInfo,
  triggerRef,
  initialIntent = "SCHEDULE_VISIT",
}: ContextualEnquiryModalProps) {
  const [intent, setIntent] = useState<EnquiryIntent>(initialIntent);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState<TimeSlot | "">("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const step2TextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const successBtnRef = useRef<HTMLButtonElement | null>(null);

  // Sync initialIntent and reset flow state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIntent(initialIntent);
      setStep(1);
      setIsSuccess(false);
      setErrorMsg(null);
    }
  }, [isOpen, initialIntent]);

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
      } else if (step === 2) {
        step2TextareaRef.current?.focus();
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
  }, [isOpen, isSuccess, step, triggerRef, onClose]);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split("T")[0];

  const handleContinueStep1 = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg("Please enter your name and phone number.");
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg("Please enter your name and phone number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const effectiveConfigId = configurationId || configurationInfo?.id;

    // Encode intent, scheduling details, and notes into structured message string
    let structuredMessage = "";
    if (intent === "SCHEDULE_VISIT") {
      const parts: string[] = ["[Schedule a Visit]"];
      if (preferredDate) parts.push(`Preferred Date: ${preferredDate}`);
      if (preferredTime) {
        const slot = timeSlots.find((s) => s.id === preferredTime);
        parts.push(`Preferred Time: ${slot ? `${slot.label} (${slot.hours})` : preferredTime}`);
      }
      if (message.trim()) parts.push(`Notes: ${message.trim()}`);
      structuredMessage = parts.join("\n");
    } else {
      const parts: string[] = ["[Request a Callback]"];
      if (message.trim()) parts.push(`Notes: ${message.trim()}`);
      structuredMessage = parts.join("\n");
    }

    try {
      await createLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: structuredMessage || undefined,
        projectId,
        developerId,
        configurationId: effectiveConfigId,
      });

      setIsSuccess(true);
      setName("");
      setPhone("");
      setEmail("");
      setPreferredDate("");
      setPreferredTime("");
      setMessage("");
      setStep(1);
    } catch (err) {
      if (err instanceof LeadApiError) {
        setErrorMsg("Unable to send request. Please check your contact information.");
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
    setStep(1);
    onClose();
  };

  const isProject = contextType === "project";
  const isSchedule = intent === "SCHEDULE_VISIT";

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
          aria-label="Close enquiry panel"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="enquiry-success-container">
            <span className="enquiry-success-badge">✓ REQUEST RECEIVED</span>
            <h2 id="modal-enquiry-title" className="enquiry-modal-title">
              {isSchedule ? "Visit Requested" : "Callback Requested"}
            </h2>
            <p className="enquiry-modal-subtitle">
              {isSchedule
                ? `We'll get back to you shortly regarding your visit to ${entityName}.`
                : `We'll get back to you shortly regarding ${entityName}.`}
            </p>
            <button
              ref={successBtnRef}
              type="button"
              className="enquiry-modal-submit-btn enquiry-modal-continue-btn"
              onClick={handleClose}
            >
              Continue Exploring
            </button>
          </div>
        ) : (
          <div className="contextual-enquiry-flow">
            {/* Contextual Header Block */}
            <div className="enquiry-modal-header-block">
              <div className="enquiry-modal-eyebrow-row">
                <span className="enquiry-modal-eyebrow">
                  {!isProject
                    ? "DEVELOPER ENQUIRY"
                    : isSchedule
                    ? step === 1
                      ? "PROJECT VISIT"
                      : "ALMOST THERE"
                    : "REQUEST A CALLBACK"}
                </span>
                {isProject && isSchedule && (
                  <span className="enquiry-modal-step-indicator">
                    Step {step} of 2
                  </span>
                )}
              </div>

              <h2 id="modal-enquiry-title" className="enquiry-modal-title">
                {!isProject
                  ? entityName
                  : isSchedule
                  ? step === 1
                    ? "Schedule a Visit"
                    : "When would you prefer to visit?"
                  : "Speak with an Advisor"}
              </h2>

              {step === 1 && (
                <p className="enquiry-modal-subtitle">
                  {!isProject
                    ? "Connect directly for portfolio details, upcoming launches, and pricing."
                    : isSchedule
                    ? `Experience ${entityName} in person. Share your details and we'll arrange a personalised site visit.`
                    : `Connect directly with our advisory team regarding ${entityName}.`}
                </p>
              )}
            </div>

            {/* Compact Project Context Card (Shown on Step 1 or Callback) */}
            {isProject && (step === 1 || !isSchedule) && (
              <div className="enquiry-project-context-card">
                {projectThumbnailUrl && (
                  <div className="enquiry-project-context-thumb">
                    <img
                      src={getOptimizedImageUrl(projectThumbnailUrl, { width: 200 })}
                      alt={entityName}
                      className="enquiry-project-context-img"
                    />
                  </div>
                )}
                <div className="enquiry-project-context-details">
                  <span className="enquiry-project-context-name">{entityName}</span>
                  {locationName && (
                    <span className="enquiry-project-context-location">{locationName}</span>
                  )}
                  {developerName && (
                    <span className="enquiry-project-context-dev">by {developerName}</span>
                  )}
                </div>
              </div>
            )}

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

            {errorMsg && (
              <div className="enquiry-modal-error" role="alert">
                {errorMsg}
              </div>
            )}

            {/* SCHEDULE VISIT: STEP 1 */}
            {isSchedule && step === 1 && (
              <form className="contextual-enquiry-form" onSubmit={handleContinueStep1}>
                <div className="enquiry-form-group">
                  <label htmlFor="enquiry-name">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="enquiry-name"
                    ref={firstInputRef}
                    type="text"
                    className="enquiry-form-input"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="enquiry-form-group">
                  <label htmlFor="enquiry-phone">
                    Mobile Number <span className="required-star">*</span>
                  </label>
                  <input
                    id="enquiry-phone"
                    type="tel"
                    className="enquiry-form-input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="enquiry-form-group">
                  <label htmlFor="enquiry-email">
                    Email <span className="optional-tag">Optional</span>
                  </label>
                  <input
                    id="enquiry-email"
                    type="email"
                    className="enquiry-form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="enquiry-form-group">
                  <label htmlFor="enquiry-date">
                    Preferred Visit Date <span className="optional-tag">Optional</span>
                  </label>
                  <input
                    id="enquiry-date"
                    type="date"
                    min={todayStr}
                    className="enquiry-form-input"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="enquiry-modal-submit-btn"
                >
                  Continue →
                </button>

                <p className="enquiry-modal-privacy-note">
                  Your information is safe with us. We’ll contact you only about this project.
                </p>
              </form>
            )}

            {/* SCHEDULE VISIT: STEP 2 */}
            {isSchedule && step === 2 && (
              <form className="contextual-enquiry-form" onSubmit={handleFinalSubmit}>
                <div className="enquiry-form-group">
                  <span className="enquiry-form-label-text">
                    Select Preferred Time <span className="optional-tag">Optional</span>
                  </span>
                  <div className="enquiry-timeslot-grid" role="radiogroup" aria-label="Preferred visit time">
                    {timeSlots.map((slot) => {
                      const isSelected = preferredTime === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          className={`enquiry-timeslot-card ${isSelected ? "selected" : ""}`}
                          onClick={() => setPreferredTime(isSelected ? "" : slot.id)}
                        >
                          <span className="enquiry-timeslot-label">{slot.label}</span>
                          <span className="enquiry-timeslot-hours">{slot.hours}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="enquiry-form-group">
                  <label htmlFor="enquiry-message">
                    Anything you'd like us to know? <span className="optional-tag">Optional</span>
                  </label>
                  <textarea
                    id="enquiry-message"
                    ref={step2TextareaRef}
                    className="enquiry-form-textarea"
                    rows={3}
                    placeholder="e.g. Preferred floor, specific requirements, or questions..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="enquiry-modal-actions-row">
                  <button
                    type="button"
                    className="enquiry-modal-back-btn"
                    onClick={() => {
                      setErrorMsg(null);
                      setStep(1);
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="enquiry-modal-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Requesting Visit..." : "Request Visit →"}
                  </button>
                </div>
              </form>
            )}

            {/* REQUEST CALLBACK / GENERAL FLOW */}
            {!isSchedule && (
              <form className="contextual-enquiry-form" onSubmit={handleFinalSubmit}>
                <div className="enquiry-form-group">
                  <label htmlFor="enquiry-callback-name">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="enquiry-callback-name"
                    ref={firstInputRef}
                    type="text"
                    className="enquiry-form-input"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="enquiry-form-group">
                  <label htmlFor="enquiry-callback-phone">
                    Mobile Number <span className="required-star">*</span>
                  </label>
                  <input
                    id="enquiry-callback-phone"
                    type="tel"
                    className="enquiry-form-input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="enquiry-form-group">
                  <label htmlFor="enquiry-callback-email">
                    Email <span className="optional-tag">Optional</span>
                  </label>
                  <input
                    id="enquiry-callback-email"
                    type="email"
                    className="enquiry-form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="enquiry-form-group">
                  <label htmlFor="enquiry-callback-message">
                    Message <span className="optional-tag">Optional</span>
                  </label>
                  <textarea
                    id="enquiry-callback-message"
                    className="enquiry-form-textarea"
                    rows={3}
                    placeholder={
                      isProject
                        ? `Share what you'd like to discuss regarding ${entityName}...`
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
                  {isSubmitting ? "Submitting..." : "Request Callback →"}
                </button>

                <p className="enquiry-modal-privacy-note">
                  Your information is safe with us. We’ll contact you only about this enquiry.
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

