/*
 * PURPOSE:
 * Property Discovery Assistant entry trigger card on the public homepage.
 *
 * FLOW:
 * Homepage Content Flow: HomePage -> ConversationalSearchEntry -> openAssistant().
 *
 * RESPONSIBILITY:
 * Presents an invitation to launch the property discovery assistant overlay.
 */

import { useAssistant } from "../../context/AssistantContext";

export function ConversationalSearchEntry() {
  const { openAssistant } = useAssistant();

  return (
    <section className="conversational-search-entry" aria-labelledby="assistant-entry-heading">
      <div className="conversational-search-card">
        <span className="section-eyebrow">ASK THE ASSISTANT</span>
        <h2 id="assistant-entry-heading" className="conversational-search-title">
          Find a home that fits you.
        </h2>
        <p className="conversational-search-subtitle">
          Answer a few quick questions with our rule-based property discovery assistant to find available homes.
        </p>

        <div className="conversational-entry-action">
          <button
            type="button"
            className="entry-launch-assistant-btn"
            onClick={openAssistant}
          >
            ✦ Launch Assistant →
          </button>
        </div>
      </div>
    </section>
  );
}
