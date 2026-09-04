/*
 * PURPOSE:
 * Global Header component for the public application shell.
 *
 * FLOW:
 * PublicShell -> GlobalHeader -> Navigation links & Assistant trigger.
 *
 * RESPONSIBILITY:
 * Renders consistent, minimal, and premium site-wide header across public routes:
 * - Displays prominent Developer Name on Developer & Project pages for maximum user trust
 * - Displays Virtual Reality platform brand on Home & Search pages
 * - Renders refined desktop navigation (Home, About) and unified Contact & Advisory CTA
 * - Renders accessible mobile drawer with smooth section scroll
 * - Houses prominent "✦ Ask Assistant" discovery trigger
 */

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAssistant } from "../../context/AssistantContext";
import { useHeader } from "../../context/HeaderContext";

export function GlobalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openAssistant } = useAssistant();
  const { developerName } = useHeader();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleAssistantClick = () => {
    closeMobileMenu();
    openAssistant();
  };

  const isFirmPage = location.pathname === "/" || location.pathname === "/firm";

  const handleHomeClick = () => {
    closeMobileMenu();
    if (isFirmPage) {
      if (location.hash) {
        navigate(location.pathname);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    navigate("/");
  };

  const handleAboutClick = () => {
    closeMobileMenu();
    if (isFirmPage) {
      const element = document.getElementById("about");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `${location.pathname}#about`);
        return;
      }
    }
    navigate("/firm#about");
  };

  const handleContactAdvisoryClick = () => {
    closeMobileMenu();
    if (isFirmPage) {
      const element = document.getElementById("contact");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `${location.pathname}#contact`);
        return;
      }
    }
    navigate("/firm#contact");
  };

  const headerTitle = developerName || "Virtual Reality";

  return (
    <header className="global-header" aria-label="Site Header">
      <div className="global-header-container">
        {/* Contextual Brand Identity */}
        <Link
          to="/"
          className="global-brand-link"
          onClick={handleHomeClick}
          title={headerTitle}
        >
          <span className={`global-brand-name ${developerName ? "is-developer-context" : ""}`}>
            {headerTitle}
          </span>
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="desktop-primary-nav" aria-label="Primary navigation">
          <button
            type="button"
            onClick={handleHomeClick}
            className={`nav-link-btn ${isFirmPage && !location.hash ? "active" : ""}`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={handleAboutClick}
            className={`nav-link-btn ${location.hash === "#about" ? "active" : ""}`}
          >
            About
          </button>
        </nav>

        {/* Primary Action & Mobile Menu Toggle */}
        <div className="global-header-actions">
          <button
            type="button"
            onClick={handleContactAdvisoryClick}
            className={`global-contact-advisory-btn ${
              location.hash === "#contact" || location.hash === "#advisory" ? "active" : ""
            }`}
            aria-label="Contact and Advisory Consultation"
          >
            Contact & Advisory
          </button>

          <button
            type="button"
            onClick={handleAssistantClick}
            className="global-assistant-btn"
            aria-label="Ask Property Discovery Assistant"
          >
            ✦ Ask Assistant
          </button>

          <button
            type="button"
            onClick={toggleMobileMenu}
            className="mobile-menu-toggle-btn"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="mobile-nav-drawer"
          role="region"
          aria-label="Mobile Navigation"
        >
          <nav className="mobile-nav-links">
            <button
              type="button"
              onClick={handleHomeClick}
              className="mobile-nav-link-btn"
            >
              Home
            </button>
            <button
              type="button"
              onClick={handleAboutClick}
              className="mobile-nav-link-btn"
            >
              About Firm
            </button>
            <button
              type="button"
              onClick={handleContactAdvisoryClick}
              className="mobile-nav-link-btn mobile-nav-highlight"
            >
              Contact & Advisory
            </button>
            <button
              type="button"
              onClick={handleAssistantClick}
              className="mobile-assistant-trigger-btn"
            >
              ✦ Ask Assistant
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
