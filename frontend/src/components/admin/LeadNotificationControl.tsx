/*
 * PURPOSE:
 * Gives an authenticated admin an explicit, restrained way to enable, test, and manage lead push alerts.
 *
 * FLOW:
 * Leads Page -> LeadNotificationControl -> browser permission & push subscription registration / test delivery.
 *
 * RESPONSIBILITY:
 * Clearly distinguish browser permission, push subscription, and server test delivery with diagnostic state and accessible feedback.
 */

import { useEffect, useState } from "react";
import {
  disableLeadNotifications,
  enableLeadNotifications,
  getLeadNotificationState,
  sendLeadNotificationTest,
  type LeadNotificationState,
} from "../../pwa/push";

export function LeadNotificationControl() {
  const [isEnabling, setIsEnabling] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [state, setState] = useState<LeadNotificationState | null>(null);
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);

  async function refreshState() {
    try {
      const currentState = await getLeadNotificationState();
      setState(currentState);
    } catch {
      setState({
        supported: false,
        permission: "unsupported",
        registered: false,
        deviceCount: 0,
      });
    } finally {
      setIsLoadingState(false);
    }
  }

  useEffect(() => {
    void refreshState();
  }, []);

  async function handleEnable() {
    setIsEnabling(true);
    setFeedback(null);
    try {
      await enableLeadNotifications();
      await refreshState();
      setFeedback({
        type: "success",
        text: "Lead push notifications enabled on this device.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to enable notifications.",
      });
      await refreshState();
    } finally {
      setIsEnabling(false);
    }
  }

  async function handleDisable() {
    setIsDisabling(true);
    setFeedback(null);
    try {
      await disableLeadNotifications();
      await refreshState();
      setFeedback({
        type: "info",
        text: "Push notifications disabled on this device.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to disable notifications.",
      });
    } finally {
      setIsDisabling(false);
    }
  }

  async function handleTest() {
    setIsTesting(true);
    setFeedback(null);
    try {
      const response = await sendLeadNotificationTest();
      if (response.data.sent) {
        setFeedback({
          type: "success",
          text: `Test notification dispatched from server (${response.data.deviceCount} active ${response.data.deviceCount === 1 ? "device" : "devices"}). Check your OS/browser notification tray.`,
        });
      } else {
        setFeedback({
          type: "error",
          text: "Server found no active push devices for this admin account.",
        });
      }
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to send test push notification.",
      });
    } finally {
      setIsTesting(false);
    }
  }

  if (isLoadingState) {
    return (
      <div className="admin-notification-control" aria-busy="true">
        <p className="admin-notification-title">Lead Notifications</p>
        <p className="admin-notification-desc">Checking push notification capabilities...</p>
      </div>
    );
  }

  const isSupported = state?.supported ?? false;
  const permission = state?.permission ?? "unsupported";
  const isRegistered = state?.registered ?? false;

  return (
    <div className="admin-notification-control" aria-label="Lead push notification settings">
      <div className="admin-notification-header">
        <div>
          <h2 className="admin-notification-title">Push Notifications</h2>
          <p className="admin-notification-desc">
            Receive instant alerts on this device whenever a new enquiry is submitted.
          </p>
        </div>

        <div className="admin-notification-badges">
          <span
            className={`admin-badge ${
              !isSupported
                ? "admin-badge--neutral"
                : permission === "granted"
                  ? "admin-badge--success"
                  : permission === "denied"
                    ? "admin-badge--danger"
                    : "admin-badge--warning"
            }`}
          >
            Permission: {permission === "granted" ? "Allowed" : permission === "denied" ? "Blocked" : permission === "default" ? "Not Requested" : "Unsupported"}
          </span>

          {isSupported && permission === "granted" && (
            <span
              className={`admin-badge ${isRegistered ? "admin-badge--success" : "admin-badge--neutral"}`}
            >
              Subscription: {isRegistered ? `Active (${state?.deviceCount ?? 1} device)` : "Inactive"}
            </span>
          )}
        </div>
      </div>

      <div className="admin-notification-actions">
        {!isSupported ? (
          <p className="admin-notification-hint">
            Web Push is unavailable in this environment (requires HTTPS or localhost with modern browser Push API support).
          </p>
        ) : permission === "denied" ? (
          <p className="admin-notification-hint admin-notification-hint--danger">
            Notifications are blocked in browser settings. Please allow notifications in site permissions to receive lead alerts.
          </p>
        ) : !isRegistered ? (
          <button
            type="button"
            className="admin-action admin-action--primary"
            onClick={handleEnable}
            disabled={isEnabling}
          >
            {isEnabling ? "Enabling..." : "Enable on this device"}
          </button>
        ) : (
          <div className="admin-notification-btn-group">
            <button
              type="button"
              className="admin-action admin-action--primary"
              onClick={handleTest}
              disabled={isTesting || isDisabling}
            >
              {isTesting ? "Sending Test..." : "Send Test Notification"}
            </button>
            <button
              type="button"
              className="admin-action admin-action--secondary"
              onClick={handleDisable}
              disabled={isTesting || isDisabling}
            >
              {isDisabling ? "Disabling..." : "Disable on this device"}
            </button>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`admin-notification-feedback admin-notification-feedback--${feedback.type}`}
          role="status"
        >
          {feedback.text}
        </div>
      )}
    </div>
  );
}
