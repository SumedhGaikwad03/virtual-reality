/*
 * PURPOSE:
 * Property Discovery Assistant entry component for the public homepage.
 *
 * FLOW:
 * Homepage Content Flow: HomePage -> ConversationalSearchEntry -> /search?q=...
 *
 * RESPONSIBILITY:
 * Presents an invitation to interact with the property discovery assistant
 * with interactive example prompt pills and direct navigation to /search.
 */

import { useNavigate } from "react-router-dom";

const EXAMPLE_PROMPTS = [
  "2 BHK near Hinjewadi",
  "Homes under ₹80L",
  "Ready-to-move projects",
];

export function ConversationalSearchEntry() {
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q")?.toString().trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate("/search");
    }
  };

  const handlePromptClick = (promptText: string) => {
    navigate(`/search?q=${encodeURIComponent(promptText)}`);
  };

  return (
    <section className="conversational-search-entry" aria-labelledby="assistant-entry-heading">
      <div className="conversational-search-card">
        <span className="section-eyebrow">ASK THE ASSISTANT</span>
        <h2 id="assistant-entry-heading" className="conversational-search-title">
          Find a home that fits you.
        </h2>
        <p className="conversational-search-subtitle">
          Tell us what you're looking for, in your own words. We'll help you find the right home.
        </p>

        <form onSubmit={handleSearchSubmit} className="conversational-search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              name="q"
              placeholder="e.g. 2 BHK near Baner under 90 Lakhs..."
              className="conversational-search-input"
              aria-label="Describe what you are looking for in a home"
            />
            <button type="submit" className="conversational-search-submit" aria-label="Ask the Assistant">
              Ask the Assistant →
            </button>
          </div>
        </form>

        <div className="conversational-prompt-pills" aria-label="Example search prompts">
          <span className="prompt-label">Try asking:</span>
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="prompt-pill-btn"
              onClick={() => handlePromptClick(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
