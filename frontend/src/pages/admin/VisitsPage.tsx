/*
 * PURPOSE:
 * Dedicated Administrative Property Visits Workspace (/admin/visits).
 *
 * FLOW:
 * Admin Route: /admin/visits -> VisitsPage -> getVisits() -> GET /api/admin/visits.
 *
 * RESPONSIBILITY:
 * Real-time operational triage for scheduled customer property visits.
 * Provides:
 * 1. Manual visit creation (+ Add Visit)
 * 2. Operational views: Today, Upcoming, and Past visits
 * 3. Inline visit editing (date, time, status, context, notes)
 * 4. Safe visit cancellation / permanent deletion with confirmation
 * 5. Instant Call, WhatsApp, and Lead Manager deep-linking
 */

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { cancelVisitSchedule, deleteVisit, getVisits } from "../../api/admin-leads";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { CancelVisitModal } from "../../components/admin/CancelVisitModal";
import { LeadActions } from "../../components/admin/LeadActions";
import { VisitModal } from "../../components/admin/VisitModal";
import type { AdminLead } from "../../types/admin-lead";

type VisitTab = "ALL" | "TODAY" | "UPCOMING" | "PAST";

function errorMessage(error: unknown): string {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (error.status === null) return "Unable to reach the server. Please check your connection.";
  return "Unable to load visits. Please try again.";
}

function statusLabel(status: AdminLead["status"]): string {
  return status === "IN_PROGRESS" ? "Ongoing" : status;
}

function creatorLabel(lead: AdminLead): string {
  const name = lead.createdBy?.name?.trim() || lead.createdBy?.email;
  return name ? `Created by ${name}` : "Created Organically";
}

function formatShortDate(dateStr: string): { day: number; month: string; year: string } {
  if (!dateStr || !dateStr.includes("-")) {
    return { day: 0, month: "—", year: "" };
  }
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const monthNames = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  const monthIdx = Number(monthStr) - 1;
  const month = monthNames[monthIdx] || monthStr;
  return { day: Number(dayStr), month, year: yearStr };
}

function formatFullDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes("-")) return dateStr || "—";
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthIdx = Number(monthStr) - 1;
  const month = monthNames[monthIdx] || monthStr;
  return `${Number(dayStr)} ${month} ${yearStr}`;
}

export function VisitsPage() {
  const [todayVisits, setTodayVisits] = useState<AdminLead[]>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<AdminLead[]>([]);
  const [pastVisits, setPastVisits] = useState<AdminLead[]>([]);
  const [activeTab, setActiveTab] = useState<VisitTab>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<AdminLead | null>(null);
  const [cancellingVisit, setCancellingVisit] = useState<AdminLead | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getVisits();
      setTodayVisits(response.data.today || []);
      setUpcomingVisits(response.data.upcoming || []);
      setPastVisits(response.data.past || []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVisits();
  }, [fetchVisits]);

  function handleOpenCreate() {
    setEditingVisit(null);
    setIsVisitModalOpen(true);
  }

  function handleOpenEdit(visit: AdminLead) {
    setEditingVisit(visit);
    setIsVisitModalOpen(true);
  }

  async function handleConfirmCancelSchedule() {
    if (!cancellingVisit) return;
    setIsProcessingAction(true);
    setActionError(null);

    try {
      await cancelVisitSchedule(cancellingVisit.id);
      setCancellingVisit(null);
      void fetchVisits();
    } catch (err) {
      setActionError(err instanceof AdminApiError ? err.message : "Failed to cancel visit schedule.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleConfirmDeletePermanently() {
    if (!cancellingVisit) return;
    setIsProcessingAction(true);
    setActionError(null);

    try {
      await deleteVisit(cancellingVisit.id);
      setCancellingVisit(null);
      void fetchVisits();
    } catch (err) {
      setActionError(err instanceof AdminApiError ? err.message : "Failed to delete lead permanently.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  const renderVisitCard = (visit: AdminLead, isPastSection = false) => {
    const dateInfo = formatShortDate(visit.visitDate || "");
    return (
      <article
        key={visit.id}
        className={`admin-card admin-visit-card ${visit.status === "NEW" ? "is-new" : ""} ${isPastSection ? "is-past" : ""}`}
      >
        <div className="admin-visit-header">
          {visit.visitDate && (
            <div className="admin-visit-date-badge">
              <span className="admin-visit-date-day">{dateInfo.day}</span>
              <span className="admin-visit-date-month">{dateInfo.month}</span>
            </div>
          )}
          <div className="admin-visit-status-wrapper">
            <span
              className={`admin-visit-slot-badge ${!visit.visitTime ? "admin-visit-slot-badge--unspecified" : ""}`}
            >
              {visit.visitTime ? visit.visitTime : "Time not specified"}
            </span>
            <span className={`admin-lead-status status-${visit.status.toLowerCase()}`}>
              {statusLabel(visit.status)}
            </span>
            {visit.status === "NEW" && (
              <span className="admin-new-badge" aria-label="New enquiry">
                NEW
              </span>
            )}
          </div>
        </div>

        <div className="admin-visit-body">
          <h3 className="admin-visit-name">{visit.name}</h3>
          <p className="admin-visit-contact">
            <a href={`tel:${visit.phone}`} className="admin-contact-link">
              {visit.phone}
            </a>
            {visit.email && <span className="admin-contact-email"> · {visit.email}</span>}
          </p>
          <p className="admin-visit-full-date">
            {formatFullDate(visit.visitDate || "")}
          </p>
          <div className="admin-lead-creator">
            <span className="admin-lead-creator-tag">
              {creatorLabel(visit)}
            </span>
          </div>

          <div className="admin-visit-requirement">
            {visit.project ? (
              <div className="admin-visit-project-info">
                <strong className="admin-visit-project-name">{visit.project.name}</strong>
                {[visit.developer?.name, visit.configuration?.name]
                  .filter(Boolean)
                  .join(" · ") && (
                  <span className="admin-visit-project-meta">
                    {[visit.developer?.name, visit.configuration?.name]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
              </div>
            ) : (
              <div className="admin-visit-project-info">
                <strong className="admin-visit-project-name">General Enquiry</strong>
              </div>
            )}

            {visit.message && (
              <p className="admin-visit-notes-preview">{visit.message}</p>
            )}
            {visit.notes && (
              <p className="admin-visit-internal-notes" style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", fontStyle: "italic", marginTop: "0.25rem" }}>
                Note: {visit.notes}
              </p>
            )}
          </div>
        </div>

        <div className="admin-visit-actions" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            className="admin-action admin-action--secondary"
            onClick={() => handleOpenEdit(visit)}
          >
            Edit
          </button>
          <button
            type="button"
            className="admin-action admin-action--utility admin-action--danger"
            onClick={() => setCancellingVisit(visit)}
          >
            Cancel / Delete
          </button>
          <Link
            to={`/admin/leads/${visit.id}`}
            className="admin-action admin-action--secondary"
          >
            View Lead
          </Link>
          <LeadActions lead={visit} />
        </div>
      </article>
    );
  };

  const showToday = activeTab === "ALL" || activeTab === "TODAY";
  const showUpcoming = activeTab === "ALL" || activeTab === "UPCOMING";
  const showPast = activeTab === "ALL" || activeTab === "PAST";

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <h1>Property Visits</h1>
          <p>
            Operational schedule for today, upcoming, and past customer visits
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="admin-action admin-action--primary"
            onClick={handleOpenCreate}
          >
            + Add Visit
          </button>
          <button
            type="button"
            className="admin-action admin-action--secondary"
            onClick={() => void fetchVisits()}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="admin-tab-bar" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className={`admin-tab ${activeTab === "ALL" ? "is-active" : ""}`}
          onClick={() => setActiveTab("ALL")}
        >
          All ({todayVisits.length + upcomingVisits.length + pastVisits.length})
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === "TODAY" ? "is-active" : ""}`}
          onClick={() => setActiveTab("TODAY")}
        >
          Today ({todayVisits.length})
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === "UPCOMING" ? "is-active" : ""}`}
          onClick={() => setActiveTab("UPCOMING")}
        >
          Upcoming ({upcomingVisits.length})
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === "PAST" ? "is-active" : ""}`}
          onClick={() => setActiveTab("PAST")}
        >
          Past ({pastVisits.length})
        </button>
      </div>

      {error && (
        <div className="admin-banner admin-banner--error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="admin-link-button"
            onClick={() => void fetchVisits()}
            style={{ marginTop: "0.5rem", textDecoration: "underline", cursor: "pointer", background: "none", border: "none", color: "inherit", font: "inherit", padding: 0 }}
          >
            Retry
          </button>
        </div>
      )}

      {isLoading && (
        <div className="admin-loading-state" aria-live="polite">
          <p>Loading scheduled visits...</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="admin-visits-container">
          {/* SECTION 1: TODAY */}
          {showToday && (
            <section className="admin-visits-section" aria-labelledby="heading-today-visits">
              <div className="admin-visits-section-header">
                <h2 id="heading-today-visits" className="admin-visits-section-title">
                  Today
                  <span className="admin-count-pill">{todayVisits.length}</span>
                </h2>
              </div>

              {todayVisits.length === 0 ? (
                <div className="admin-card admin-empty-state">
                  <p>No visits scheduled for today.</p>
                </div>
              ) : (
                <div className="admin-visits-list">
                  {todayVisits.map((visit) => renderVisitCard(visit))}
                </div>
              )}
            </section>
          )}

          {/* SECTION 2: UPCOMING */}
          {showUpcoming && (
            <section className="admin-visits-section" aria-labelledby="heading-upcoming-visits">
              <div className="admin-visits-section-header">
                <h2 id="heading-upcoming-visits" className="admin-visits-section-title">
                  Upcoming
                  <span className="admin-count-pill">{upcomingVisits.length}</span>
                </h2>
              </div>

              {upcomingVisits.length === 0 ? (
                <div className="admin-card admin-empty-state">
                  <p>No upcoming visits scheduled.</p>
                </div>
              ) : (
                <div className="admin-visits-list">
                  {upcomingVisits.map((visit) => renderVisitCard(visit))}
                </div>
              )}
            </section>
          )}

          {/* SECTION 3: PAST */}
          {showPast && (
            <section className="admin-visits-section" aria-labelledby="heading-past-visits">
              <div className="admin-visits-section-header">
                <h2 id="heading-past-visits" className="admin-visits-section-title">
                  Past Visits
                  <span className="admin-count-pill">{pastVisits.length}</span>
                </h2>
              </div>

              {pastVisits.length === 0 ? (
                <div className="admin-card admin-empty-state">
                  <p>No past visits recorded.</p>
                </div>
              ) : (
                <div className="admin-visits-list">
                  {pastVisits.map((visit) => renderVisitCard(visit, true))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Create / Edit Visit Modal */}
      <VisitModal
        isOpen={isVisitModalOpen}
        visit={editingVisit}
        onClose={() => setIsVisitModalOpen(false)}
        onSaved={() => void fetchVisits()}
      />

      {/* Cancel / Delete Confirmation Modal */}
      <CancelVisitModal
        visit={cancellingVisit}
        isProcessing={isProcessingAction}
        errorMessage={actionError}
        onCancelSchedule={handleConfirmCancelSchedule}
        onDeletePermanently={handleConfirmDeletePermanently}
        onClose={() => {
          setCancellingVisit(null);
          setActionError(null);
        }}
      />
    </AdminLayout>
  );
}
