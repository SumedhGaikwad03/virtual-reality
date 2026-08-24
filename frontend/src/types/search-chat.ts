export type SearchChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

export type SearchChatState = {
  messages: SearchChatMessage[];
};