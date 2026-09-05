/*
 * PURPOSE:
 * Property Discovery Advisor entry trigger card on the public homepage.
 *
 * FLOW:
 * Homepage Content Flow: HomePage -> ConversationalSearchEntry -> openAssistant().
 *
 * RESPONSIBILITY:
 * Presents an invitation to launch the option-based property discovery advisor overlay.
 * Uses accurate option-based discovery wording instead of conversational prompt language.
 */

import { useAssistant } from "../../context/AssistantContext";

export function ConversationalSearchEntry() {
  const { openAssistant } = useAssistant();

  return (
    <section className="conversational-search-entry" aria-labelledby="assistant-entry-heading">
      <div className="conversational-search-card">
        <div className="conversational-search-content">
          <span className="section-eyebrow">PROPERTY DISCOVERY ADVISOR</span>
          <h2 id="assistant-entry-heading" className="conversational-search-title">
            Find a home that fits your life.
          </h2>
          <p className="conversational-search-subtitle">
            Explore curated developments and bespoke residences with Tara through step-by-step preference matching.
          </p>

          <div className="conversational-prompt-chips" role="group" aria-label="Preference discovery options with Tara">
            <span className="prompt-chip-intro">Explore by Preference:</span>
            <button
              type="button"
              className="conversational-chip"
              onClick={openAssistant}
              aria-label="Explore 3 and 4 BHK residences with Tara"
            >
              3 & 4 BHK Residences
            </button>
            <button
              type="button"
              className="conversational-chip"
              onClick={openAssistant}
              aria-label="Explore ready to move residences with Tara"
            >
              Ready to Move
            </button>
            <button
              type="button"
              className="conversational-chip"
              onClick={openAssistant}
              aria-label="Explore private villas with Tara"
            >
              Private Villas
            </button>
            <button
              type="button"
              className="conversational-chip"
              onClick={openAssistant}
              aria-label="Explore prime Pune locations with Tara"
            >
              Prime Pune Locations
            </button>
          </div>
        </div>

        <div className="conversational-entry-action">
          <button
            type="button"
            className="entry-launch-assistant-btn"
            onClick={openAssistant}
            aria-label="Explore properties with Tara"
          >
            ✦ Explore with Tara →
          </button>
        </div>
      </div>
    </section>
  );
}
