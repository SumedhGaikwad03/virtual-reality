/*
 * PURPOSE:
 * React hook to coordinate the first authenticated location snapshot capture.
 *
 * FLOW:
 * AdminLayout mounts -> useAdminLocationInitializer() -> checks permissions / prompts modal -> POST /api/admin/location.
 *
 * RESPONSIBILITY:
 * - Runs once per authenticated browser session/app entry.
 * - Protected against React re-renders, route transitions, and StrictMode double-mounting via in-memory ref/flag.
 * - Queries navigator.permissions for geolocation if supported:
 *     - "granted": directly calls navigator.geolocation.getCurrentPosition and updates backend.
 *     - "prompt": shows LocationPermissionModal for user consent before calling browser API.
 *     - "denied": gracefully suppresses modal and allows Admin workspace to operate uninterrupted.
 * - On "Allow" click, calls getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }).
 * - On success, calls updateAdminLocation({ latitude, longitude }) and closes modal.
 * - Gracefully handles errors (PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT) without blocking the UI.
 * - Never stores coordinates in localStorage or sessionStorage.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import { updateAdminLocation } from "../api/admin-location";

// In-memory guard to prevent repeated prompts across route changes / remounts in the same session
let hasAttemptedLocationThisSession = false;

export function useAdminLocationInitializer() {
  const { isAuthenticated, isAuthReady } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const sendLocationSnapshot = useCallback(async (latitude: number, longitude: number) => {
    try {
      await updateAdminLocation({ latitude, longitude });
    } catch {
      // Backend / network error during snapshot update is non-blocking
    }
  }, []);

  const requestPositionAndUpload = useCallback(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    setIsSubmitting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await sendLocationSnapshot(latitude, longitude);
        if (isMountedRef.current) {
          setIsSubmitting(false);
          setIsModalOpen(false);
        }
      },
      () => {
        // Geolocation error (denied, timeout, unavailable) fails gracefully
        if (isMountedRef.current) {
          setIsSubmitting(false);
          setIsModalOpen(false);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [sendLocationSnapshot]);

  const handleAllow = useCallback(() => {
    requestPositionAndUpload();
  }, [requestPositionAndUpload]);

  const handleDismiss = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated) {
      // Reset session flag when unauthenticated / on logout
      hasAttemptedLocationThisSession = false;
      return;
    }

    if (hasAttemptedLocationThisSession) {
      return;
    }

    hasAttemptedLocationThisSession = true;

    if (!("geolocation" in navigator)) {
      return;
    }

    // Use Permissions API when available to avoid showing unnecessary modal if already granted or denied
    if (navigator.permissions && typeof navigator.permissions.query === "function") {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (!isMountedRef.current) return;

          if (permissionStatus.state === "granted") {
            // Already granted: directly capture snapshot without showing explanatory modal
            requestPositionAndUpload();
          } else if (permissionStatus.state === "prompt") {
            // Needs prompt: show explanatory modal first
            setIsModalOpen(true);
          } else if (permissionStatus.state === "denied") {
            // Denied: do not show modal, do not prompt
            setIsModalOpen(false);
          }
        })
        .catch(() => {
          // Fallback if permission query fails: show modal
          if (isMountedRef.current) {
            setIsModalOpen(true);
          }
        });
    } else {
      // Permissions API unavailable: show modal
      setIsModalOpen(true);
    }
  }, [isAuthReady, isAuthenticated, requestPositionAndUpload]);

  return {
    isModalOpen,
    isSubmitting,
    handleAllow,
    handleDismiss,
  };
}
