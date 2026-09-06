/*
 * PURPOSE:
 * Property Discovery Advisor entry trigger card on the public homepage.
 *
 * FLOW:
 * Homepage Content Flow: HomePage -> ConversationalSearchEntry -> openAssistant().
 *
 * RESPONSIBILITY:
 * Presents a warm, concise conversational invitation to meet Tara and launch the
 * option-based property discovery advisor overlay.
 */

import { useAssistant } from "../../context/AssistantContext";
import { TaraAvatar } from "../search/TaraAvatar";

export function ConversationalSearchEntry() {
  const { openAssistant } = useAssistant();

  return (
    <section className="conversational-search-entry" aria-labelledby="tara-entry-heading">
      <div className="conversational-search-card">
        {/* Left / Main Conversational Column */}
        <div className="conversational-search-main">
          {/* Profile Identity Bar */}
          <div className="tara-entry-profile">
            <TaraAvatar size="md" />
            <div className="tara-entry-identity">
              <span className="tara-entry-name">Tara</span>
              <span className="tara-entry-role">Property Discovery Advisor</span>
            </div>
          </div>

          {/* Conversational Greeting Message */}
          <div className="tara-entry-message-group">
            <h2 id="tara-entry-heading" className="tara-entry-speech">
              <span>Hello, I'm Tara.</span>
              <span className="tara-speech-subline">Let's look for your home.</span>
            </h2>
            <p className="tara-entry-invitation">
              What are you looking for? Select a starting preference or begin exploring.
            </p>
          </div>

          {/* Option-Based Preference Discovery Chips */}
          <div
            className="conversational-prompt-chips"
            role="group"
            aria-label="Preference discovery options with Tara"
          >
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

        {/* Action Column */}
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
