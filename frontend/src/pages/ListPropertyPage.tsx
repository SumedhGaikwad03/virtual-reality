/*
 * PURPOSE:
 * Dedicated public landing page for property owners/landlords to submit a rental property.
 *
 * FLOW:
 * AppRouter (/rentals/list-property) -> ListPropertyPage ->
 * Owner Hero (with back link, process pillars, CTA) -> Property Submission Section (RentalPropertyForm) ->
 * Process Explanation -> Architectural Banner -> AboutFooter.
 *
 * RESPONSIBILITY:
 * Provides a large, immersive, editorial, and architecturally refined owner hero
 * matching the visual footprint of the main /rentals landing page, seamlessly
 * guiding owners into the frictionless submission flow below.
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSite } from "../components/home/hooks/useSite";
import { AboutFooter } from "../components/home/AboutFooter";
import { RentalPropertyForm } from "../components/rentals/RentalPropertyForm";
import { scrollToElement } from "../scroll/scrollTo";
import "../styles/rentals.css";

export function ListPropertyPage() {
  const { site, isLoading, hasError } = useSite();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  if (isLoading) {
    return (
      <div className="rental-loading-state" aria-busy="true">
        <p>Loading Property Desk...</p>
      </div>
    );
  }

  if (hasError || !site) {
    return (
      <div className="rental-error-state" role="alert">
        <p>Unable to load the Property Desk. Please try refreshing.</p>
      </div>
    );
  }

  const phone = site.contact?.phone;
  const cleanPhone = phone ? phone.replace(/\s+/g, "") : null;
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        "Hello, I have a property I would like to list with the Virtual Reality Rental Desk.",
      )}`
    : null;

  const handleScrollToForm = () => {
    scrollToElement("owner-submission-section");
  };

  // High-end residential architecture hero background
  const heroImage =
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85";

  return (
    <main className="owner-page-container">
      {/* 1. LARGE IMMERSIVE OWNER HERO */}
      <section className="owner-hero" aria-label="Property Desk Owner Hero">
        <div className="owner-hero-media-wrapper">
          <img
            src={heroImage}
            alt="Virtual Reality Property Desk curated residential architecture"
            className="owner-hero-image"
            loading="eager"
            decoding="async"
          />
          <div className="owner-hero-scrim" />
        </div>

        <div className="floating-owner-hero-content">
          {/* Back Navigation Link integrated with breathing room */}
          <Link to="/rentals" className="owner-hero-back-link" aria-label="Back to main Rental Desk">
            ← Back to Rental Desk
          </Link>

          <div className="owner-hero-eyebrow-row">
            <span className="owner-hero-eyebrow">PROPERTY DESK · OWNER SUBMISSION</span>
          </div>

          <h1 className="owner-hero-headline">
            Have a home to rent out?
          </h1>

          <p className="owner-hero-supporting">
            Share the essentials with our Rental Desk. We'll review the details and get in touch to discuss suitable tenant opportunities.
          </p>

          <div className="owner-hero-actions">
            <button
              type="button"
              onClick={handleScrollToForm}
              className="owner-hero-primary-btn"
              aria-label="Submit your property - scroll to intake form"
            >
              <span>Submit Your Property ↓</span>
            </button>

            {cleanPhone ? (
              <a
                href={`tel:${cleanPhone}`}
                className="owner-hero-secondary-btn"
                aria-label={`Speak with Rental Desk at ${phone}`}
              >
                <span>Speak with Rental Desk →</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleScrollToForm}
                className="owner-hero-secondary-btn"
              >
                <span>Speak with Rental Desk →</span>
              </button>
            )}
          </div>

          {/* 3-Step Process Treatment embedded in lower hero */}
          <div className="owner-hero-process-strip" aria-label="Submission process summary">
            <div className="owner-hero-process-item">
              <span className="owner-hero-process-num">01</span>
              <h3 className="owner-hero-process-title">Share the details</h3>
              <p className="owner-hero-process-desc">Give us the key information about your property.</p>
            </div>
            <div className="owner-hero-process-item">
              <span className="owner-hero-process-num">02</span>
              <h3 className="owner-hero-process-title">We review</h3>
              <p className="owner-hero-process-desc">Our Rental Desk reviews your submission.</p>
            </div>
            <div className="owner-hero-process-item">
              <span className="owner-hero-process-num">03</span>
              <h3 className="owner-hero-process-title">We connect</h3>
              <p className="owner-hero-process-desc">We'll get in touch to discuss next steps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRIMARY TWO-COLUMN WORKFLOW: EDITORIAL INTRO / VISUAL + SUBMISSION FORM */}
      <section id="owner-submission-section" className="owner-submission-section" aria-label="Property Submission Details">
        <div className="owner-page-layout">
          {/* Left Column: Visual & Contextual Advisory */}
          <div className="owner-intro-column">
            <div className="owner-media-frame">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85"
                alt="Contemporary curated residence interior in Pune"
                className="owner-media-image"
                loading="eager"
              />
              <span className="owner-media-badge">Curated Residences · Pune</span>
            </div>

            <div className="owner-editorial-card">
              <span className="owner-editorial-eyebrow">PROPERTY DESK</span>
              <h2 className="owner-editorial-title">Share the essentials.</h2>
              <p className="owner-editorial-desc">
                You don't need to prepare a complete property listing or photo package right now. Share the key details with us, and our Rental Desk will follow up directly.
              </p>
            </div>

            <div className="owner-direct-advisory-box">
              <span className="owner-advisory-eyebrow">PREFER TO SPEAK DIRECTLY?</span>
              <h3 className="owner-advisory-heading">Connect with our desk</h3>
              <p className="owner-advisory-text">
                Have multiple units or urgent leasing terms? Speak with an advisor directly.
              </p>
              <div className="owner-advisory-buttons">
                {cleanPhone && (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="owner-call-pill-btn"
                    aria-label={`Call Rental Desk at ${phone}`}
                  >
                    <span>📞 Call {phone}</span>
                  </a>
                )}
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="owner-whatsapp-pill-btn"
                    aria-label="Chat with Rental Desk on WhatsApp"
                  >
                    <span>💬 WhatsApp Desk</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Elevated Form Card */}
          <div className="owner-form-column">
            <div className="owner-form-card">
              <div className="owner-form-header">
                <span className="rental-eyebrow">INTAKE FORM</span>
                <h2 className="owner-form-title">Property & Contact Details</h2>
                <p className="owner-form-subtitle">
                  Provide what you have on hand — our team handles the rest.
                </p>
              </div>
              <RentalPropertyForm />
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW THE DESK OPERATES (COMPACT 3-STEP FACTUAL PROCESS) */}
      <section className="owner-process-section" aria-labelledby="owner-process-heading">
        <div className="rental-section-header text-center">
          <span className="rental-eyebrow">HOW THE DESK OPERATES</span>
          <h2 id="owner-process-heading" className="rental-section-title">
            Simple, direct, and transparent.
          </h2>
        </div>

        <div className="owner-process-grid">
          <div className="owner-process-card">
            <span className="owner-process-num">01</span>
            <h3 className="owner-process-card-title">Share the Details</h3>
            <p className="owner-process-card-desc">
              Submit your property essentials, locality, and flat configuration through the form above.
            </p>
          </div>

          <div className="owner-process-card">
            <span className="owner-process-num">02</span>
            <h3 className="owner-process-card-title">We Review</h3>
            <p className="owner-process-card-desc">
              Our Rental Desk reviews your property details against active tenant requirements.
            </p>
          </div>

          <div className="owner-process-card">
            <span className="owner-process-num">03</span>
            <h3 className="owner-process-card-title">We Connect</h3>
            <p className="owner-process-card-desc">
              We'll get in touch directly to discuss pricing expectations, visit coordination, and next steps.
            </p>
          </div>
        </div>
      </section>

      {/* 4. RESTRAINED EDITORIAL BANNER */}
      <section className="owner-banner-section" aria-label="Virtual Reality property standard">
        <div className="owner-banner-wrapper">
          <img
            src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85"
            alt="Refined residential architecture in Pune"
            className="owner-banner-image"
            loading="lazy"
          />
          <div className="owner-banner-scrim" />
          <div className="owner-banner-content">
            <span className="owner-banner-eyebrow">VIRTUAL REALITY PROPERTY DESK</span>
            <blockquote className="owner-banner-quote">
              Connecting thoughtful homeowners with verified residences in Pune.
            </blockquote>
          </div>
        </div>
      </section>

      {/* 5. ABOUT FOOTER */}
      <AboutFooter site={site} />
    </main>
  );
}
