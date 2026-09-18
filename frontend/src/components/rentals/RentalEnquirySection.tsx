/*
 * PURPOSE:
 * Dominant primary section for "Looking to Rent" on the public Rental Desk page.
 *
 * FLOW:
 * RentalsPage -> RentalEnquirySection -> RentalEnquiryForm.
 *
 * RESPONSIBILITY:
 * Frames the primary rental service experience with clear editorial heading,
 * helpful narrative context, and the low-friction enquiry form card.
 */

import { RentalEnquiryForm } from "./RentalEnquiryForm";

export function RentalEnquirySection() {
  return (
    <section
      id="renter-enquiry"
      className="rental-section rental-section-primary"
      aria-labelledby="renter-section-heading"
    >
      <div className="rental-section-container">
        <div className="rental-section-header">
          <span className="rental-eyebrow">PRIMARY SERVICE · LOOKING TO RENT</span>
          <h2 id="renter-section-heading" className="rental-section-title">
            Tell us what you're looking for.
          </h2>
          <p className="rental-section-subtitle">
            You don't need to sift through cluttered public listings. Share your preferred configuration and locality below, and our Rental Desk will connect you with matching residential properties.
          </p>
        </div>

        <div className="rental-primary-card">
          <RentalEnquiryForm />
        </div>
      </div>
    </section>
  );
}
