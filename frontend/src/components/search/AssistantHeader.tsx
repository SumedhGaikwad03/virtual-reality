/*
 * PURPOSE:
 * Header component for the Conversational Property Discovery Assistant.
 *
 * FLOW:
 * Public Search Flow: SearchAssistant -> AssistantHeader.
 *
 * RESPONSIBILITY:
 * Renders the primary assistant title, description, and visual identity badge.
 */

import { TaraAvatar } from "./TaraAvatar";

export function AssistantHeader() {
  return (
    <header className="assistant-header">
      <div className="assistant-header-top">
        <div className="assistant-header-profile">
          <TaraAvatar size="sm" />
          <span className="assistant-header-eyebrow">Property Discovery Advisor</span>
        </div>
      </div>
      <div className="assistant-header-text">
        <h2 className="assistant-header-title">Tara</h2>
        <p className="assistant-header-subline">Find a home that fits what you're looking for.</p>
      </div>
    </header>
  );
}
