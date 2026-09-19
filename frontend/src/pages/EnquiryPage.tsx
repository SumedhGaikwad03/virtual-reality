/*
 * PURPOSE:
 * Standalone Public Property Enquiry Page (/enquiry).
 *
 * FLOW:
 * Route: /enquiry (standalone outside PublicShell) -> EnquiryPage -> createLead() -> POST /api/leads -> Success confirmation.
 *
 * RESPONSIBILITY:
 * Generic, editorial, calm, and trustworthy standalone consultation card for clients.
 * Short, continuous minimum path with 3 mandatory fields:
 * 1. Full Name
 * 2. Mobile Number
 * 3. Preferred Visit Date (structured visitDate)
 *
 * Preferred Visit Time (structured visitTime), Location, Budget, Email, and Notes remain optional and progressive.
 * No developer, project, configuration, or broker context is required.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createLead, LeadApiError } from "../api/lead";
import "../styles/enquiry.css";

type TimeSlotType = "Morning" | "Afternoon" | "Evening";

interface TimeSlotConfig {
  id: TimeSlotType;
  label: string;
  timeRange: string;
}

const TIME_SLOT_OPTIONS: TimeSlotConfig[] = [
  { id: "Morning", label: "Morning", timeRange: "10 AM – 1 PM" },
  { id: "Afternoon", label: "Afternoon", timeRange: "1 PM – 5 PM" },
  { id: "Evening", label: "Evening", timeRange: "5 PM – 8 PM" },
];

// High-end residential architecture backdrop asset reused from platform
const BACKDROP_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85";

function getTodayISTDateString(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

export function EnquiryPage() {
  // Ensure page scrolls to top upon entry
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // 3 Mandatory form state items
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");

  // Optional form state
  const [timeSlot, setTimeSlot] = useState<TimeSlotType | "">("");
  const [showOptional, setShowOptional] = useState(false);
  const [locationPref, setLocationPref] = useState("");
  const [budgetPref, setBudgetPref] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Submission UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Minimum allowable date is today in Asia/Kolkata (YYYY-MM-DD)
  const todayStr = getTodayISTDateString();

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your full name.";
    }

    const cleanPhone = phone.trim().replace(/[\s\-().]/g, "");
    const phoneMatch = cleanPhone.match(/^(?:\+?91|0)?([6-9]\d{9})$/);
    if (!cleanPhone) {
      newErrors.phone = "Please enter your mobile number.";
    } else if (!phoneMatch) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!preferredDate) {
      newErrors.preferredDate = "Please select a preferred visit date.";
    } else if (preferredDate < todayStr) {
      newErrors.preferredDate = "Date cannot be in the past.";
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    // Format optional free-form details into message only (no visitDate or visitTime duplication)
    const optionalLines: string[] = [];
    if (locationPref.trim()) {
      optionalLines.push(`Preferred Location: ${locationPref.trim()}`);
    }
    if (budgetPref.trim()) {
      optionalLines.push(`Budget: ${budgetPref.trim()}`);
    }
    if (notes.trim()) {
      if (optionalLines.length > 0) {
        optionalLines.push(`\nNotes:\n${notes.trim()}`);
      } else {
        optionalLines.push(`Notes:\n${notes.trim()}`);
      }
    }

    const formattedMessage = optionalLines.length > 0 ? optionalLines.join("\n") : undefined;

    try {
      await createLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        visitDate: preferredDate,
        visitTime: timeSlot || undefined,
        message: formattedMessage,
      });

      setSubmitted(true);
    } catch (err) {
      if (err instanceof LeadApiError) {
        setSubmitError("Unable to submit enquiry right now. Please check your connection or contact us directly.");
      } else {
        setSubmitError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="enquiry-page-wrapper">
      {/* 1. Full-Bleed Architectural Backdrop with Dark Scrim */}
      <div className="enquiry-backdrop-wrapper" aria-hidden="true">
        <img
          src={BACKDROP_IMAGE}
          alt="Residential Architecture"
          className="enquiry-backdrop-image"
          loading="eager"
          decoding="async"
        />
        <div className="enquiry-backdrop-scrim" />
      </div>

      {/* 2. Main Centered Form Card */}
      <main className="enquiry-container">
        <div className="enquiry-form-card">
          {submitted ? (
            <div className="enquiry-success-view">
              <div className="enquiry-success-icon" aria-hidden="true">
                ✓
              </div>
              <div className="enquiry-brass-accent" aria-hidden="true" />
              <h1 className="enquiry-success-title">Property Enquiry Received</h1>
              <p className="enquiry-success-text">
                Thank you. We've received your requirements and will take care of the next steps.
              </p>
              <div className="enquiry-success-actions">
                <Link to="/" className="enquiry-btn-primary">
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Reassuring Editorial Header */}
              <header className="enquiry-header">
                <div className="enquiry-brass-accent" aria-hidden="true" />
                <h1 className="enquiry-title">Find Your Next Address</h1>
                <p className="enquiry-subtitle">
                  Tell us what you're looking for. We'll take care of the rest.
                </p>
                <p className="enquiry-subtitle-secondary">
                  A few details help us prepare the right options for you.
                </p>
              </header>

              <form onSubmit={handleSubmit} noValidate>
                {submitError && (
                  <div className="enquiry-feedback-error" role="alert">
                    {submitError}
                  </div>
                )}

                {/* Section 1: Your Details */}
                <section className="enquiry-section">
                  <h2 className="enquiry-section-title">Your Details</h2>
                  <div className="enquiry-grid">
                    <div className="enquiry-field">
                      <label htmlFor="enquiry-name" className="enquiry-label">
                        Full name <span className="required" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="enquiry-name"
                        type="text"
                        className={`enquiry-input ${errors.name ? "has-error" : ""}`}
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                        }}
                        required
                        aria-required="true"
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && <span className="enquiry-error-text">{errors.name}</span>}
                    </div>

                    <div className="enquiry-field">
                      <label htmlFor="enquiry-phone" className="enquiry-label">
                        Mobile number <span className="required" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="enquiry-phone"
                        type="tel"
                        className={`enquiry-input ${errors.phone ? "has-error" : ""}`}
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                        }}
                        required
                        aria-required="true"
                        aria-invalid={!!errors.phone}
                      />
                      {errors.phone && <span className="enquiry-error-text">{errors.phone}</span>}
                    </div>
                  </div>
                </section>

                {/* Section 2: When Would You Like To Visit? */}
                <section className="enquiry-section">
                  <h2 className="enquiry-section-title">When would you like to visit?</h2>
                  <div className="enquiry-grid">
                    <div className="enquiry-field full-width">
                      <label htmlFor="enquiry-date" className="enquiry-label">
                        Preferred date <span className="required" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="enquiry-date"
                        type="date"
                        min={todayStr}
                        className={`enquiry-input ${errors.preferredDate ? "has-error" : ""}`}
                        value={preferredDate}
                        onChange={(e) => {
                          setPreferredDate(e.target.value);
                          if (errors.preferredDate) {
                            setErrors((prev) => ({ ...prev, preferredDate: "" }));
                          }
                        }}
                        required
                        aria-required="true"
                        aria-invalid={!!errors.preferredDate}
                      />
                      {errors.preferredDate && (
                        <span className="enquiry-error-text">{errors.preferredDate}</span>
                      )}
                    </div>

                    <div className="enquiry-field full-width">
                      <label className="enquiry-label">
                        Preferred time <span className="enquiry-label-optional">(Optional)</span>
                      </label>
                      <div className="enquiry-chips-group" role="radiogroup" aria-label="Preferred visit time">
                        {TIME_SLOT_OPTIONS.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            role="radio"
                            aria-checked={timeSlot === slot.id}
                            className={`enquiry-chip ${timeSlot === slot.id ? "active" : ""}`}
                            onClick={() => setTimeSlot(timeSlot === slot.id ? "" : slot.id)}
                          >
                            <span className="enquiry-chip-label">{slot.label}</span>
                            <span className="enquiry-chip-time">{slot.timeRange}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Optional Details Accordion */}
                <div className="enquiry-optional-section">
                  <button
                    type="button"
                    className="enquiry-optional-toggle"
                    onClick={() => setShowOptional(!showOptional)}
                    aria-expanded={showOptional}
                  >
                    <div className="enquiry-optional-toggle-text">
                      <span className="enquiry-optional-toggle-title">
                        {showOptional ? "− Hide additional details" : "＋ Add more details (optional)"}
                      </span>
                      <span className="enquiry-optional-toggle-subtext">
                        Location, budget, email & notes
                      </span>
                    </div>
                    <span className="enquiry-optional-toggle-icon" aria-hidden="true">
                      {showOptional ? "▲" : "▼"}
                    </span>
                  </button>

                  {showOptional && (
                    <div className="enquiry-optional-content">
                      <div className="enquiry-grid">
                        <div className="enquiry-field">
                          <label htmlFor="enquiry-location" className="enquiry-label">
                            Preferred Location <span className="enquiry-label-optional">(Optional)</span>
                          </label>
                          <input
                            id="enquiry-location"
                            type="text"
                            className="enquiry-input"
                            placeholder="e.g. Kharadi, Baner"
                            value={locationPref}
                            onChange={(e) => setLocationPref(e.target.value)}
                          />
                        </div>

                        <div className="enquiry-field">
                          <label htmlFor="enquiry-budget" className="enquiry-label">
                            Budget <span className="enquiry-label-optional">(Optional)</span>
                          </label>
                          <input
                            id="enquiry-budget"
                            type="text"
                            className="enquiry-input"
                            placeholder="e.g. ₹1.5 Cr – ₹2.5 Cr"
                            value={budgetPref}
                            onChange={(e) => setBudgetPref(e.target.value)}
                          />
                        </div>

                        <div className="enquiry-field full-width">
                          <label htmlFor="enquiry-email" className="enquiry-label">
                            Email <span className="enquiry-label-optional">(Optional)</span>
                          </label>
                          <input
                            id="enquiry-email"
                            type="email"
                            className={`enquiry-input ${errors.email ? "has-error" : ""}`}
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                            }}
                            aria-invalid={!!errors.email}
                          />
                          {errors.email && <span className="enquiry-error-text">{errors.email}</span>}
                        </div>

                        <div className="enquiry-field full-width">
                          <label htmlFor="enquiry-notes" className="enquiry-label">
                            Anything else you'd like us to know? <span className="enquiry-label-optional">(Optional)</span>
                          </label>
                          <textarea
                            id="enquiry-notes"
                            className="enquiry-textarea"
                            placeholder="Floor preferences, timeline, specific requirements..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Submit Action */}
                <button
                  type="submit"
                  className="enquiry-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Request a Visit →"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
