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
      <div className="assistant-header-profile">
        <TaraAvatar size="md" />
        <div className="assistant-header-identity">
          <span className="assistant-header-name">Tara</span>
          <span className="assistant-header-role">Property Discovery Advisor</span>
        </div>
      </div>
    </header>
  );
}
