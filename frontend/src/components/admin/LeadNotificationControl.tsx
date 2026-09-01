/*
 * PURPOSE:
 * Gives an authenticated admin an explicit, restrained way to enable lead alerts.
 *
 * FLOW:
 * AdminLayout -> LeadNotificationControl -> browser permission and subscription registration.
 *
 * RESPONSIBILITY:
 * Present permission state and errors without requesting notification access on page load.
 */

import { useEffect, useState } from "react";
import {
  enableLeadNotifications,
  getLeadNotificationState,
  sendLeadNotificationTest,
} from "../../pwa/push";

export function LeadNotificationControl() {
  const [isEnabling, setIsEnabling] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [notificationState, setNotificationState] = useState<"checking" | "unsupported" | "denied" | "unregistered" | "registered">("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getLeadNotificationState()
      .then((state) => {
        setNotificationState(!state.supported ? "unsupported" : state.permission === "denied" ? "denied" : state.registered ? "registered" : "unregistered");
      })
      .catch(() => setNotificationState("unsupported"));
  }, []);

  async function handleEnable() {
    setIsEnabling(true);
    setMessage(null);
    try {
      await enableLeadNotifications();
      setNotificationState("registered");
      setMessage("Lead notifications enabled on this device.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to enable notifications.");
    } finally {
      setIsEnabling(false);
    }
  }

  async function handleTest() {
    setIsTesting(true);
    setMessage(null);
    try {
      const response = await sendLeadNotificationTest();
      setMessage(response.data.sent ? "Test notification sent." : "No registered device was found.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send test notification.");
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <div className="admin-notification-control">
      <p className="admin-notification-title">Lead notifications</p>
      {notificationState === "unregistered" && <button type="button" onClick={handleEnable} disabled={isEnabling}>
        {isEnabling ? "Enabling..." : "Enable"}
      </button>
      }
      {notificationState === "registered" && <>
        <span className="admin-notification-enabled">Enabled</span>
        <button type="button" onClick={handleTest} disabled={isTesting}>{isTesting ? "Sending..." : "Send test"}</button>
      </>}
      <p>{message ?? (notificationState === "checking" ? "Checking notification support..." : notificationState === "unsupported" ? "Notifications are unavailable here." : notificationState === "denied" ? "Notifications are blocked in this browser." : notificationState === "registered" ? "Enabled on this device." : "Not enabled on this device.")}</p>
    </div>
  );
}
