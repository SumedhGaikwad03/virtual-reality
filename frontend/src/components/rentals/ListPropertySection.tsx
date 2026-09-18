/*
 * PURPOSE:
 * Secondary "List a Property" editorial CTA section on the public Rental Desk page.
 *
 * FLOW:
 * RentalsPage -> ListPropertySection -> Link to /rentals/list-property.
 *
 * RESPONSIBILITY:
 * Provides a refined editorial invitation for landlords and property owners
 * without cluttering the primary renter-focused page with an inline form.
 */

import { Link } from "react-router-dom";

type ListPropertySectionProps = {
  contactPhone?: string | null;
};

export function ListPropertySection({ contactPhone }: ListPropertySectionProps) {
  return (
    <section
      id="list-property"
      className="rental-section rental-section-secondary"
      aria-labelledby="owner-section-heading"
    >
      <div className="rental-section-container">
        <div className="rental-owner-cta-card">
          <div className="rental-owner-cta-content">
            <span className="rental-eyebrow">HAVE A HOME TO RENT OUT?</span>
            <h2 id="owner-section-heading" className="rental-owner-cta-title">
              List your property with our Rental Desk
            </h2>
            <p className="rental-owner-cta-desc">
              Share the essentials with our Rental Desk. We'll review your property details and contact you directly to coordinate suitable tenant matching.
            </p>

            <div className="rental-owner-cta-actions">
              <Link
                to="/rentals/list-property"
                className="rental-owner-link-btn"
                aria-label="Open property submission page"
              >
                <span>List a Property →</span>
              </Link>

              {contactPhone && (
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                  className="rental-owner-call-link"
                >
                  Or speak directly with our team at <strong>{contactPhone}</strong>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

