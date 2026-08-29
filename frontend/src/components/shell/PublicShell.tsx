/*
 * PURPOSE:
 * Public Site Shell layout component.
 *
 * FLOW:
 * AppRouter -> PublicShell (Layout Route) -> Outlet (Page Content).
 *
 * RESPONSIBILITY:
 * Shared public shell component rendering the global header, page content outlet,
 * global assistant overlay, and site-wide footer.
 */

import { Outlet } from "react-router-dom";
import { GlobalHeader } from "./GlobalHeader";
import { PropertyAssistantOverlay } from "../search/PropertyAssistantOverlay";

export function PublicShell() {
  return (
    <div className="public-shell-container">
      <GlobalHeader />
      <div className="public-shell-content">
        <Outlet />
      </div>
      <PropertyAssistantOverlay />
    </div>
  );
}
