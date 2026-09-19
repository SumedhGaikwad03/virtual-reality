/*
 * PURPOSE:
 * Full-bleed atmospheric visual hero section for the public Rental Desk page.
 *
 * FLOW:
 * RentalsPage -> RentalHero -> Smooth anchor scroll triggers (#renter-enquiry, #list-property).
 *
 * RESPONSIBILITY:
 * Composes a cinematic architectural hero with prominent editorial headline,
 * strong primary "Looking to Rent" CTA button, and secondary "List a Property" link.
 */

import { useNavigate } from "react-router-dom";
import { scrollToElement } from "../../scroll/scrollTo";
import { getOptimizedImageUrl } from "../../utils/image";

type RentalHeroProps = {
  heroImageUrl?: string | null;
};

export function RentalHero({ heroImageUrl }: RentalHeroProps) {
  const navigate = useNavigate();

  // Use high-end architectural default hero if none supplied
  const defaultHero =
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85";
  const bgImage = heroImageUrl || defaultHero;

  const handleRenterClick = () => {
    scrollToElement("renter-enquiry");
  };

  const handleOwnerClick = () => {
    navigate("/rentals/list-property");
  };

  return (
    <section className="rental-hero" aria-label="Rental Desk Hero">
      <div className="rental-hero-media-wrapper">
        <img
          src={getOptimizedImageUrl(bgImage)}
          alt="Virtual Reality Rental Desk curated residences"
          className="rental-hero-image"
          loading="eager"
          decoding="async"
        />
        <div className="rental-hero-scrim" />
      </div>

      <div className="floating-rental-hero-content">
        <div className="rental-hero-eyebrow-row">
          <span className="rental-hero-eyebrow">RENTAL DESK</span>
        </div>

        <h1 className="rental-hero-headline">
          Find a home to rent,
          <br className="hero-break" />
          without the noise.
        </h1>

        <p className="rental-hero-supporting">
          Tell our property desk what kind of home you need. We review your requirements and connect you directly with suitable rental opportunities.
        </p>

        <div className="rental-hero-actions">
          <button
            type="button"
            onClick={handleRenterClick}
            className="rental-hero-primary-btn"
            aria-label="Looking to rent a home - go to enquiry form"
          >
            <span>Looking to Rent ↓</span>
          </button>

          <button
            type="button"
            onClick={handleOwnerClick}
            className="rental-hero-secondary-btn"
            aria-label="List a property - go to owner submission page"
          >
            <span>List a Property →</span>
          </button>
        </div>
      </div>
    </section>
  );
}
