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
  closeAssistant: () => void;
  toggleAssistant: () => void;
  searchChat: ReturnType<typeof useSearchChat>;
};

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const searchChat = useSearchChat();

  const openAssistant = () => setIsOpen(true);
  const closeAssistant = () => setIsOpen(false);
  const toggleAssistant = () => setIsOpen((prev) => !prev);

  // Close assistant on Escape key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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
