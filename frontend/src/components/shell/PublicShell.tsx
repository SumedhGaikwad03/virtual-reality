/*
 * PURPOSE:
 * Public Site Shell layout component.
 *
 * FLOW:
 * AppRouter -> PublicShell (Layout Route) -> Outlet (Page Content).
 *
 * RESPONSIBILITY:
 * Shared public shell component rendering the global header, page content outlet,
 * global assistant overlay, global floating assistant CTA, scroll restoration, and smooth page transition wrapper.
 */

import { Outlet } from "react-router-dom";
import { GlobalHeader } from "./GlobalHeader";
import { PropertyAssistantOverlay } from "../search/PropertyAssistantOverlay";
import { FloatingSearchControl } from "../home/FloatingSearchControl";
import { ScrollToTop } from "../common/ScrollToTop";

export function PublicShell() {
  return (
    <div className="public-shell-container">
      <ScrollToTop />
      <GlobalHeader />
      <div className="public-shell-content">
        <div className="page-transition-wrapper">
          <Outlet />
        </div>
      </div>
      <FloatingSearchControl />
      <PropertyAssistantOverlay />
    </div>
  );
}
