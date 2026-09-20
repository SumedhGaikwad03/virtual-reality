/*
 * PURPOSE:
 * Founder-only operational page displaying the latest known location snapshots of active team members.
 *
 * FLOW:
 * AdminLayout -> FounderRoute -> AdminLocationsPage -> getAdminLocations (GET /api/admin/locations).
 *
 * RESPONSIBILITY:
 * - Displays one card per active team member.
 * - Shows Name, Role badge, Email, Last known location timestamp, Coordinates (if available), and Location status.
 * - Provides "View on Map" link (Google Maps search URL) in a new tab when coordinates are present.
 * - Shows "Location not available" when no coordinates have been recorded.
 * - Does not embed maps or track location history.
 */

import { useEffect, useState } from "react";
import { getAdminLocations, type AdminLocationItem } from "../../api/admin-location";
import { AdminApiError } from "../../api/admin-client";
import { AdminLayout } from "../../components/admin/AdminLayout";

function formatLocationTimestamp(dateString: string | null): string {
  if (!dateString) return "Location not available";
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Location not available";
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "Location not available";
  }
}

function googleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}`;
}

export function AdminLocationsPage() {
  const [locations, setLocations] = useState<AdminLocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadLocations() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAdminLocations();
      setLocations(response.data);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 403) {
        setError("Founder privileges required to view employee locations.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load employee locations.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadLocations();
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <h1>Employee Locations</h1>
          <p>View the latest known location reported by each active team member.</p>
        </div>
        <button
          type="button"
          className="admin-action admin-action--secondary"
          onClick={() => void loadLocations()}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="admin-notification-feedback admin-notification-feedback--error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <p>Loading employee locations...</p>
      ) : locations.length === 0 ? (
        <section className="admin-card">
          <p>No active team members found.</p>
        </section>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {locations.map((member) => {
            const hasLocation =
              member.latitude !== null &&
              member.longitude !== null &&
              typeof member.latitude === "number" &&
              typeof member.longitude === "number";

            return (
              <article
                key={member.id}
                className="admin-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1.25rem",
                  padding: "1.5rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--admin-text)",
                      }}
                    >
                      {member.name?.trim() || "Team Member"}
                    </h2>
                    <span
                      className={`admin-badge ${
                        member.role === "FOUNDER" ? "admin-badge--primary" : "admin-badge--neutral"
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: "0 0 1rem 0",
                      fontSize: "0.85rem",
                      color: "var(--admin-text-muted)",
                    }}
                  >
                    {member.email}
                  </p>

                  <div
                    style={{
                      padding: "0.85rem 1rem",
                      background: hasLocation
                        ? "var(--admin-surface-subtle, #F4EFE6)"
                        : "rgba(0, 0, 0, 0.03)",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--admin-border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "var(--admin-text-muted)",
                        }}
                      >
                        Status
                      </span>
                      <span
                        className={`admin-badge ${
                          hasLocation ? "admin-badge--success" : "admin-badge--neutral"
                        }`}
                        style={{ fontSize: "0.7rem", padding: "0.1rem 0.45rem" }}
                      >
                        {hasLocation ? "Location updated" : "Location not available"}
                      </span>
                    </div>

                    <div style={{ marginTop: "0.25rem" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "var(--admin-text-muted)",
                          display: "block",
                        }}
                      >
                        Last Known Location
                      </span>
                      <span
                        style={{
                          fontSize: "0.88rem",
                          color: "var(--admin-text)",
                          fontWeight: hasLocation ? 600 : 400,
                        }}
                      >
                        {formatLocationTimestamp(member.lastLocationAt)}
                      </span>
                    </div>

                    {hasLocation && (
                      <div style={{ marginTop: "0.15rem" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--admin-text-subtle)",
                            fontFamily: "monospace",
                          }}
                        >
                          {member.latitude?.toFixed(4)}, {member.longitude?.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {hasLocation ? (
                    <a
                      href={googleMapsUrl(member.latitude!, member.longitude!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-action admin-action--primary"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        textDecoration: "none",
                      }}
                    >
                      View on Map ↗
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="admin-action admin-action--secondary"
                      disabled
                      style={{
                        width: "100%",
                        opacity: 0.6,
                        cursor: "not-allowed",
                      }}
                    >
                      No location available
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
