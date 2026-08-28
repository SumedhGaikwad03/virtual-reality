/*
 * PURPOSE:
 * Guided search chat UI type definitions.
 *
 * FLOW:
 * Guided Search Presentation Flow
 *
 * RESPONSIBILITY:
 * Defines TypeScript types for conversational chat messages and participant roles (user/assistant).
 */

export type SearchChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};