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

export function AssistantHeader() {
  return (
    <header className="assistant-header">
      <span className="section-eyebrow">PROPERTY DISCOVERY ASSISTANT</span>
      <h1 className="assistant-title">Find a home that fits your life.</h1>
      <p className="assistant-subtitle">
        Tell us what you're looking for, or answer a few quick questions to discover matching properties.
      </p>
    </header>
  );
}
