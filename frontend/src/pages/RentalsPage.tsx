/*
 * PURPOSE:
 * Public Rental Desk service page orchestrator.
 *
 * FLOW:
 * AppRouter (/rentals) -> RentalsPage ->
 * RentalHero -> RentalEnquirySection -> RentalProcessSection -> ListPropertySection -> RentalClosingSection -> AboutFooter.
 *
 * RESPONSIBILITY:
 * Composes the primary renter-first flow, secondary owner pathway, factual workflow pillars,
 * direct advisory closing, and shared site footer.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSite } from "../components/home/hooks/useSite";
import { AboutFooter } from "../components/home/AboutFooter";
import { RentalHero } from "../components/rentals/RentalHero";
import { RentalEnquirySection } from "../components/rentals/RentalEnquirySection";
import { RentalProcessSection } from "../components/rentals/RentalProcessSection";
import { ListPropertySection } from "../components/rentals/ListPropertySection";
import { RentalClosingSection } from "../components/rentals/RentalClosingSection";
import { scrollToElement } from "../scroll/scrollTo";
import "../styles/rentals.css";

export function RentalsPage() {
  const { site, isLoading, hasError } = useSite();
  const location = useLocation();

  // Destination-owned smooth scroll execution for hash navigation
  useEffect(() => {
    if (!isLoading && location.hash) {
      const targetId = location.hash.replace("#", "");
      let attempts = 0;
      const maxAttempts = 12;

      const scrollInterval = setInterval(() => {
        attempts += 1;
        const el = document.getElementById(targetId);
        if (el) {
          scrollToElement(el);
          clearInterval(scrollInterval);
        } else if (attempts >= maxAttempts) {
          clearInterval(scrollInterval);
        }
      }, 50);

      return () => clearInterval(scrollInterval);
    }
  }, [isLoading, location.hash]);

  if (isLoading) {
    return (
      <div className="rental-loading-state" aria-busy="true">
        <p>Loading Rental Desk...</p>
      </div>
    );
  }

  if (hasError || !site) {
    return (
      <div className="rental-error-state" role="alert">
        <p>Unable to load the Rental Desk. Please try refreshing.</p>
      </div>
    );
  }

  // Derive primary hero asset if configured in site media, else pass undefined for architectural fallback
  const heroImage = site.homeMedia?.find(
    (m) => m.category === "HERO" && m.isPrimary,
  )?.url;

  return (
    <main className="rental-page-container">
      {/* 1. HERO */}
      <RentalHero heroImageUrl={heroImage} />

      {/* 2. PRIMARY EXPERIENCE: LOOKING TO RENT */}
      <RentalEnquirySection />

      {/* 3. HOW THE RENTAL DESK WORKS */}
      <RentalProcessSection />

      {/* 4. SECONDARY EXPERIENCE: LIST A PROPERTY CTA */}
      <ListPropertySection contactPhone={site.contact?.phone} />

      {/* 5. DIRECT ADVISORY / CONTACT CLOSING */}
      <RentalClosingSection site={site} />

      {/* 6. ABOUT FOOTER */}
      <AboutFooter site={site} />
    </main>
  );
}
