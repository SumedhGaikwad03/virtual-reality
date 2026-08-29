/*
 * PURPOSE:
 * Header contextual state provider for public developer identity attribution.
 *
 * FLOW:
 * Application Root -> HeaderProvider -> HeaderContext.
 *
 * RESPONSIBILITY:
 * Provides contextual developerName state allowing DeveloperPage and ProjectPage to dynamically
 * communicate developer identity in the shared GlobalHeader without header duplication or extra API calls.
 */

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type HeaderContextType = {
  developerName: string | null;
  setDeveloperName: (name: string | null) => void;
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [developerName, setDeveloperName] = useState<string | null>(null);

  return (
    <HeaderContext.Provider value={{ developerName, setDeveloperName }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
}
