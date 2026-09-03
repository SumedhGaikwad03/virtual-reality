/*
 * PURPOSE:
 * Global application context and state provider for the Property Discovery Assistant.
 *
 * FLOW:
 * Application Root Layout -> AssistantProvider -> AssistantContext.
 *
 * RESPONSIBILITY:
 * Holds the single shared instance of useSearchChat(), tracks assistant open/closed state,
 * handles Escape key listener and body scroll lock, and provides openAssistant/closeAssistant actions to triggers.
 */

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSearchChat } from "../hooks/useSearchChat";

type AssistantContextType = {
  isOpen: boolean;
  openAssistant: () => void;
  closeAssistant: (options?: { reset?: boolean }) => void;
  toggleAssistant: () => void;
  searchChat: ReturnType<typeof useSearchChat>;
};

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const searchChat = useSearchChat();

  const openAssistant = () => {
    searchChat.reset();
    setIsOpen(true);
  };
  const closeAssistant = (options: { reset?: boolean } = { reset: true }) => {
    setIsOpen(false);
    if (options.reset !== false) {
      searchChat.reset();
    }
  };
  const toggleAssistant = () => {
    setIsOpen((prev) => {
      searchChat.reset();
      return !prev;
    });
  };

  // Close assistant and reset session on Escape key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        searchChat.reset();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, searchChat]);

  // Lock body scroll on mobile when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        openAssistant,
        closeAssistant,
        toggleAssistant,
        searchChat,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistant must be used within an AssistantProvider");
  }
  return context;
}
