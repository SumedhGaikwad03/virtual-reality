/*
 * PURPOSE:
 * Reusable modal dialog for creating and editing property visits.
 *
 * FLOW:
 * VisitsPage -> VisitModal -> createVisit / updateVisit API.
 *
 * RESPONSIBILITY:
 * Provides validated form inputs for:
 * - Customer contact (Name, Phone, Email)
 * - Scheduled visit date (YYYY-MM-DD) and time slot (Morning, Afternoon, Evening)
 * - Cascading property context (Developer -> Project -> Configuration)
 * - Client requirements, lead status, and internal notes
 */

import { useEffect, useState, type FormEvent } from "react";
import { AdminApiError } from "../../api/admin-client";
import { getConfigurations } from "../../api/admin-configurations";
import { getDevelopers } from "../../api/admin-developers";
import { createVisit, updateVisit } from "../../api/admin-leads";
import { getProjects } from "../../api/admin-projects";
import type { AdminConfiguration } from "../../types/admin-configuration";
import type { AdminDeveloper } from "../../types/admin-developer";
import type { AdminLead, LeadStatus } from "../../types/admin-lead";
import type { AdminProject } from "../../types/admin-project";

type VisitModalProps = {
  isOpen: boolean;
  visit: AdminLead | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  visitDate: string;
  visitTime: string;
  developerId: string;
  projectId: string;
  configurationId: string;
  message: string;
  status: LeadStatus;
  notes: string;
};

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  visitDate: "",
  visitTime: "",
  developerId: "",
  projectId: "",
  configurationId: "",
  message: "",
  status: "NEW",
  notes: "",
};

const statuses: Array<{ value: LeadStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "Ongoing" },
  { value: "DONE", label: "Done" },
];

const timeSlots = ["Morning", "Afternoon", "Evening"];

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function VisitModal({
  isOpen,
  visit,
  onClose,
  onSaved,
}: VisitModalProps) {
  const isEdit = Boolean(visit);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [developers, setDevelopers] = useState<AdminDeveloper[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [configurations, setConfigurations] = useState<AdminConfiguration[]>([]);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form and load reference data
  useEffect(() => {
    if (!isOpen) return;

    setIsSubmitting(false);

    let active = true;

    async function loadReferenceData() {
      setIsLoadingContext(true);
      setError(null);

      try {
        const [devRes, projRes] = await Promise.all([
          getDevelopers().catch(() => ({ data: [] })),
          getProjects().catch(() => ({ data: [] })),
        ]);

        if (!active) return;
        setDevelopers(devRes.data);
        setProjects(projRes.data);

        if (visit) {
          setForm({
            name: visit.name || "",
            phone: visit.phone || "",
            email: visit.email || "",
            visitDate: visit.visitDate || "",
            visitTime: visit.visitTime || "",
            developerId: visit.developer?.id || "",
            projectId: visit.project?.id || "",
            configurationId: visit.configuration?.id || "",
            message: visit.message || "",
            status: visit.status || "NEW",
            notes: visit.notes || "",
          });

          if (visit.project?.id) {
            try {
              const configRes = await getConfigurations(visit.project.id);
              if (active) {
                setConfigurations(configRes.data);
              }
            } catch {
              // Configurations fetch error is non-fatal
            }
          }
        } else {
          setForm({
            ...emptyForm,
            visitDate: getTodayString(),
          });
          setConfigurations([]);
        }
      } catch {
        if (active) setError("Unable to load developers and projects. Please retry.");
      } finally {
        if (active) setIsLoadingContext(false);
      }
    }

    void loadReferenceData();

    return () => {
      active = false;
    };
  }, [isOpen, visit]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  // Filter projects by selected developer
  const filteredProjects = form.developerId
    ? projects.filter((p) => p.developerId === form.developerId)
    : projects;

  async function handleDeveloperChange(devId: string) {
    const currentProject = projects.find((p) => p.id === form.projectId);
    const keepProject = currentProject && (!devId || currentProject.developerId === devId);
    const nextProjectId = keepProject ? form.projectId : "";
    const nextConfigId = keepProject ? form.configurationId : "";

    setForm((prev) => ({
      ...prev,
      developerId: devId,
      projectId: nextProjectId,
      configurationId: nextConfigId,
    }));

    if (nextProjectId) {
      try {
        const configRes = await getConfigurations(nextProjectId);
        setConfigurations(configRes.data);
      } catch {
        setConfigurations([]);
      }
    } else {
      setConfigurations([]);
    }
  }

  async function handleProjectChange(projId: string) {
    if (projId) {
      const selectedProject = projects.find((p) => p.id === projId);
      setForm((prev) => ({
        ...prev,
        projectId: projId,
        developerId: selectedProject ? selectedProject.developerId : prev.developerId,
        configurationId: "",
      }));

      try {
        const configRes = await getConfigurations(projId);
        setConfigurations(configRes.data);
      } catch {
        setConfigurations([]);
      }
    } else {
      setForm((prev) => ({ ...prev, projectId: "", configurationId: "" }));
      setConfigurations([]);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      visitDate: form.visitDate.trim(),
      visitTime: form.visitTime.trim() || null,
      developerId: form.developerId || null,
      projectId: form.projectId || null,
      configurationId: form.configurationId || null,
      message: form.message.trim() || null,
      status: form.status,
      notes: form.notes.trim() || null,
    };

    try {
      if (isEdit && visit) {
        await updateVisit(visit.id, payload);
      } else {
        await createVisit(payload);
      }
      onSaved();
      onClose();
    } catch (submitError) {
      if (submitError instanceof AdminApiError) {
        if (submitError.status === 400) {
          setError("Please check visit details. Customer name, phone, and visit date are required.");
        } else {
          setError(submitError.message || "Failed to save visit.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="admin-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="visit-modal-title"
    >
      <div className="admin-card" style={{ maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 id="visit-modal-title" style={{ margin: 0, fontSize: "1.25rem", color: "var(--admin-text)" }}>
              {isEdit ? "Edit Property Visit" : "Schedule New Visit"}
            </h2>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
              {isEdit ? "Update visitor appointment details and context." : "Manually record a client property visit."}
            </p>
          </div>
          <button
            type="button"
            className="admin-action admin-action--utility"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="admin-alert-banner admin-alert-banner--error" style={{ marginBottom: "1rem" }} role="alert">
            ⚠ {error}
          </div>
        )}

        {isLoadingContext ? (
          <p style={{ padding: "1.5rem 0", textAlign: "center", color: "var(--admin-text-muted)" }}>
            Loading properties and developers...
          </p>
        ) : (
          <form className="admin-lead-update-form" onSubmit={handleSubmit}>
            {/* Customer Details */}
            <fieldset style={{ border: "1px solid var(--admin-border)", borderRadius: "6px", padding: "1rem", margin: "0 0 1rem" }}>
              <legend style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--admin-text-muted)", padding: "0 0.5rem" }}>
                Customer Contact
              </legend>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                <label>
                  Full Name <span aria-hidden="true" style={{ color: "var(--admin-danger-text)" }}>*</span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Anand Kulkarni"
                  />
                </label>

                <label>
                  Phone Number <span aria-hidden="true" style={{ color: "var(--admin-danger-text)" }}>*</span>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                  />
                </label>
              </div>

              <label style={{ marginTop: "0.75rem", display: "block" }}>
                Email Address (Optional)
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. anand@example.com"
                />
              </label>
            </fieldset>

            {/* Visit Schedule */}
            <fieldset style={{ border: "1px solid var(--admin-border)", borderRadius: "6px", padding: "1rem", margin: "0 0 1rem" }}>
              <legend style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--admin-text-muted)", padding: "0 0.5rem" }}>
                Visit Schedule (Asia/Kolkata)
              </legend>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                <label>
                  Visit Date <span aria-hidden="true" style={{ color: "var(--admin-danger-text)" }}>*</span>
                  <input
                    type="date"
                    required
                    value={form.visitDate}
                    onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                  />
                </label>

                <label>
                  Preferred Time Slot
                  <select
                    value={form.visitTime}
                    onChange={(e) => setForm({ ...form, visitTime: e.target.value })}
                  >
                    <option value="">Time Not Specified</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </fieldset>

            {/* Property Context */}
            <fieldset style={{ border: "1px solid var(--admin-border)", borderRadius: "6px", padding: "1rem", margin: "0 0 1rem" }}>
              <legend style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--admin-text-muted)", padding: "0 0.5rem" }}>
                Property Context
              </legend>
              <label>
                Developer
                <select
                  value={form.developerId}
                  onChange={(e) => void handleDeveloperChange(e.target.value)}
                >
                  <option value="">General Enquiry / Any Developer</option>
                  {developers.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ marginTop: "0.75rem", display: "block" }}>
                Project
                <select
                  value={form.projectId}
                  onChange={(e) => void handleProjectChange(e.target.value)}
                >
                  <option value="">General Enquiry / Any Project</option>
                  {filteredProjects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} ({proj.developer.name})
                    </option>
                  ))}
                </select>
              </label>

              {form.projectId && configurations.length > 0 && (
                <label style={{ marginTop: "0.75rem", display: "block" }}>
                  Configuration / Unit Type
                  <select
                    value={form.configurationId}
                    onChange={(e) => setForm({ ...form, configurationId: e.target.value })}
                  >
                    <option value="">All / Entire Project</option>
                    {configurations.map((config) => (
                      <option key={config.id} value={config.id}>
                        {config.name} ({config.bhk} BHK · {config.carpetArea} sq ft)
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </fieldset>

            {/* Requirements, Status & Notes */}
            <label>
              Customer Requirements / Message
              <textarea
                rows={2}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Specific preferences, unit requirements, or questions..."
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem", marginTop: "0.75rem" }}>
              <label>
                Operational Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
                >
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label style={{ marginTop: "0.75rem", display: "block" }}>
              Internal Follow-up Notes
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Internal agent notes or followup remarks..."
              />
            </label>

            <div className="admin-lead-actions" style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}>
              <button
                type="submit"
                className="admin-action admin-action--primary"
                disabled={isSubmitting}
                style={{ flex: 1 }}
              >
                {isSubmitting ? "Saving..." : isEdit ? "Save Visit Changes" : "Create Visit"}
              </button>
              <button
                type="button"
                className="admin-action admin-action--secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
