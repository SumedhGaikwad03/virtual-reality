/*
 * PURPOSE:
 * Persistent floating "Ask Assistant" entry control component.
 *
 * FLOW:
 * Global / Homepage Navigation Flow -> FloatingSearchControl -> /search.
 *
 * RESPONSIBILITY:
 * Renders a subtle, non-intrusive floating action button with a neutral SVG icon linking directly to the property discovery assistant.
 */

import { Link } from "react-router-dom";

export function FloatingSearchControl() {
  return (
    <div className="floating-search-control-container">
      <Link
        to="/search"
        className="floating-search-btn"
        aria-label="Ask Assistant"
        title="Ask Assistant"
      >
        <svg
          className="floating-search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="floating-search-label">Ask Assistant</span>
      </Link>
    </div>
  );
}
