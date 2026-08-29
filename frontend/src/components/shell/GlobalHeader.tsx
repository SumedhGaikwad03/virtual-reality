/*
 * PURPOSE:
 * Global Header component for the public application shell.
 *
 * FLOW:
 * PublicShell -> GlobalHeader -> Navigation links & Assistant trigger.
 *
 * RESPONSIBILITY:
 * Renders consistent site-wide header across public routes:
 * - Displays prominent Developer Name on Developer & Project pages for maximum user trust
 * - Displays Virtual Reality platform brand on Home & Search pages
 * - Renders desktop navigation links, mobile hamburger menu drawer, and primary "✦ Ask Assistant" button
 */

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAssistant } from "../../context/AssistantContext";
import { useHeader } from "../../context/HeaderContext";

export function GlobalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openAssistant } = useAssistant();
  const { developerName } = useHeader();
  const location = useLocation();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleAssistantClick = () => {
    closeMobileMenu();
    openAssistant();
  };

  const headerTitle = developerName || "Virtual Reality";

  return (
    <header className="global-header" aria-label="Site Header">
      <div className="global-header-container">
        {/* Contextual Brand Identity: Developer Name on Developer/Project pages, Platform Name on Home/Search */}
        <Link
          to="/"
          className="global-brand-link"
          onClick={closeMobileMenu}
          title={headerTitle}
        >
          <span className={`global-brand-name ${developerName ? "is-developer-context" : ""}`}>
            {headerTitle}
          </span>
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="desktop-primary-nav" aria-label="Primary navigation">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/search"
            className={`nav-link ${location.pathname === "/search" ? "active" : ""}`}
          >
            Discover
          </Link>
        </nav>

        {/* Primary Action & Mobile Menu Toggle */}
        <div className="global-header-actions">
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
            <Link to="/" onClick={closeMobileMenu} className="mobile-nav-link">
              Home
            </Link>
            <Link to="/search" onClick={closeMobileMenu} className="mobile-nav-link">
              Discover Properties
            </Link>
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
