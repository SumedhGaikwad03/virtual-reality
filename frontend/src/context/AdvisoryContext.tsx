/*
 * PURPOSE:
 * Global application context and state provider for the human Advisory consultation popup.
 *
 * FLOW:
 * PublicShell -> AdvisoryProvider -> AdvisoryContext -> GlobalHeader / AdvisoryPopupModal / Public Pages.
 *
 * RESPONSIBILITY:
 * Manages the open/closed state of the AdvisoryPopupModal across the public site, providing
 * openAdvisory and closeAdvisory methods for the 5-second automatic timer and manual header CTAs.
 */

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type AdvisoryContextType = {
  isAdvisoryOpen: boolean;
  openAdvisory: () => void;
  closeAdvisory: () => void;
};

const AdvisoryContext = createContext<AdvisoryContextType | undefined>(undefined);

export function AdvisoryProvider({ children }: { children: ReactNode }) {
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState(false);

  const openAdvisory = () => setIsAdvisoryOpen(true);
  const closeAdvisory = () => setIsAdvisoryOpen(false);

  return (
    <AdvisoryContext.Provider
      value={{
        isAdvisoryOpen,
        openAdvisory,
        closeAdvisory,
      }}
    >
      {children}
    </AdvisoryContext.Provider>
  );
}

export function useAdvisory() {
  const context = useContext(AdvisoryContext);
  if (!context) {
    throw new Error("useAdvisory must be used within an AdvisoryProvider");
  }
  return context;
}
