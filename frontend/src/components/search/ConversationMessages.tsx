/*
 * PURPOSE:
 * Message log thread for conversational property search.
 *
 * FLOW:
 * Public Search Flow: SearchAssistant -> ConversationMessages.
 *
 * RESPONSIBILITY:
 * Renders the assistant messages (with assistant avatar) and user answers in a natural messaging thread layout.
 */

import type { SearchChatMessage } from "../../types/search-chat";

type ConversationMessagesProps = {
  messages: SearchChatMessage[];
};

export function ConversationMessages({ messages }: ConversationMessagesProps) {
  return (
    <div className="conversation-thread" aria-live="polite">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`conversation-bubble-wrapper ${message.role}`}
        >
          {message.role === "assistant" && (
            <div className="assistant-avatar-badge" aria-hidden="true">
              ✦
            </div>
          )}
          <div className={`conversation-bubble ${message.role}`}>
            <p>{message.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
