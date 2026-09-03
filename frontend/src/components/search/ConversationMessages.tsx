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
import { TaraAvatar } from "./TaraAvatar";

type ConversationMessagesProps = {
  messages: SearchChatMessage[];
};

export function ConversationMessages({ messages }: ConversationMessagesProps) {
  return (
    <div className="conversation-thread" aria-live="polite">
      {messages.map((message, index) => {
        const isFirstInAssistantGroup =
          message.role === "assistant" &&
          (index === 0 || messages[index - 1]?.role !== "assistant");

        return (
          <div
            key={message.id}
            className={`conversation-bubble-wrapper ${message.role}`}
          >
            {message.role === "assistant" && (
              <div className="assistant-avatar-slot">
                {isFirstInAssistantGroup ? (
                  <TaraAvatar size="sm" />
                ) : (
                  <div className="tara-avatar-placeholder" aria-hidden="true" />
                )}
              </div>
            )}
            <div className={`conversation-bubble ${message.role}`}>
              {message.text.split("\n\n").map((para, idx) => (
                <p key={idx} className={idx > 0 ? "bubble-paragraph-spaced" : ""}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
