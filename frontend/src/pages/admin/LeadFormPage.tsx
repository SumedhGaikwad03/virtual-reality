/*
 * PURPOSE:
 * Admin lead create and edit form page.
 *
 * FLOW:
 * Admin Leads -> LeadFormPage -> createLead / updateLead API.
 *
 * RESPONSIBILITY:
 * Provides validated form inputs for manual lead creation and full lead editing,
 * including name, phone, email, developer/project association, message, status, and internal triage notes.
 */

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { getDevelopers } from "../../api/admin-developers";
import { createLead, getLead, updateLead } from "../../api/admin-leads";
import { getProjects } from "../../api/admin-projects";
import { AdminLayout } from "../../components/admin/AdminLayout";
import type { AdminDeveloper } from "../../types/admin-developer";
import type { AdminLead, LeadStatus } from "../../types/admin-lead";
import type { AdminProject } from "../../types/admin-project";

type FormState = {
  name: string;
  phone: string;
  email: string;
  developerId: string;
  projectId: string;
  message: string;
  status: LeadStatus;
  notes: string;
};

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  developerId: "",
  projectId: "",
  message: "",
  status: "NEW",
  notes: "",
};

const statuses: Array<{ value: LeadStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "Ongoing" },
  { value: "DONE", label: "Done" },
];

function errorMessage(error: unknown, isEdit: boolean) {
  if (!(error instanceof AdminApiError)) {
    return "Something went wrong. Please try again.";
  }
  if (error.status === 400) {
    return "Please check the lead details (name and a valid phone number are required).";
  }
  if (error.status === 404) {
    return "Lead not found.";
  }
  if (error.status === null) {
    return "Unable to reach the server. Please try again.";
  }
  return isEdit ? "Unable to update the lead." : "Unable to create the lead.";
}

export function LeadFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [developers, setDevelopers] = useState<AdminDeveloper[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const [devRes, projRes] = await Promise.all([
          getDevelopers(),
          getProjects(),
        ]);

        if (!active) return;
        setDevelopers(devRes.data);
        setProjects(projRes.data);

        if (id) {
          const leadRes = await getLead(id);
          if (!active) return;
          const lead: AdminLead = leadRes.data;
          setForm({
            name: lead.name,
            phone: lead.phone,
            email: lead.email ?? "",
            developerId: lead.developer?.id ?? "",
            projectId: lead.project?.id ?? "",
            message: lead.message ?? "",
            status: lead.status,
            notes: lead.notes ?? "",
          });
        }
      } catch (loadError) {
        if (active) setError(errorMessage(loadError, isEdit));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [id, isEdit]);

  // Filter projects by selected developer if one is chosen
  const filteredProjects = form.developerId
    ? projects.filter((p) => p.developerId === form.developerId)
    : projects;

  function handleDeveloperChange(devId: string) {
    setForm((prev) => {
      // If the current project does not belong to the newly selected developer, clear it
      const currentProject = projects.find((p) => p.id === prev.projectId);
      const keepProject = currentProject && (!devId || currentProject.developerId === devId);
      return {
        ...prev,
        developerId: devId,
        projectId: keepProject ? prev.projectId : "",
      };
    });
  }

  function handleProjectChange(projId: string) {
    setForm((prev) => {
      // If a project is selected and no developer was selected, auto-select its developer
      if (projId) {
        const selectedProject = projects.find((p) => p.id === projId);
        return {
          ...prev,
          projectId: projId,
          developerId: selectedProject ? selectedProject.developerId : prev.developerId,
        };
      }
      return { ...prev, projectId: projId };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      developerId: form.developerId || null,
      projectId: form.projectId || null,
      message: form.message.trim() || null,
      status: form.status,
      notes: form.notes.trim() || null,
    };

    try {
      if (isEdit && id) {
        await updateLead(id, payload);
        navigate(`/admin/leads/${id}`);
      } else {
        const res = await createLead(payload);
        navigate(`/admin/leads/${res.data.id}`);
      }
    } catch (submitError) {
      setError(errorMessage(submitError, isEdit));
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <p>Loading lead form...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-top-bar">
        <Link
          className="admin-action admin-action--secondary"
          to={isEdit && id ? `/admin/leads/${id}` : "/admin/leads"}
        >
          ← Back
        </Link>
      </div>

      <div className="admin-page-heading">
        <div>
          <h1>{isEdit ? "Edit Lead" : "Add Lead"}</h1>
          <p>
            {isEdit
              ? "Update contact information, project assignment, or lead notes."
              : "Manually record a new client enquiry."}
          </p>
        </div>
      </div>

      {error && <p className="admin-alert-banner admin-alert-banner--error" role="alert">{error}</p>}

      <form className="admin-card admin-lead-update-form" onSubmit={handleSubmit}>
        <label>
          Full Name <span aria-hidden="true">*</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Rahul Sharma"
          />
        </label>

        <label>
          Phone Number <span aria-hidden="true">*</span>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. +91 98765 43210"
          />
        </label>

        <label>
          Email Address
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="e.g. rahul@example.com"
          />
        </label>

        <label>
          Associated Developer
          <select
            value={form.developerId}
            onChange={(e) => handleDeveloperChange(e.target.value)}
          >
            <option value="">None / General Enquiry</option>
            {developers.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Associated Project
          <select
            value={form.projectId}
            onChange={(e) => handleProjectChange(e.target.value)}
          >
            <option value="">None / General Enquiry</option>
            {filteredProjects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name} ({proj.developer.name})
              </option>
            ))}
          </select>
        </label>

        <label>
          Client Message / Requirement
          <textarea
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Enquiry message or initial requirement..."
          />
        </label>

        <label>
          Lead Status
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
          >
            {statuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Internal Notes & Triage
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Add internal followup notes or customer preferences..."
          />
        </label>

        <div className="admin-lead-actions" style={{ marginTop: "1rem" }}>
          <button
            className="admin-action admin-action--primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Lead"}
          </button>
          <Link
            className="admin-action admin-action--secondary"
            to={isEdit && id ? `/admin/leads/${id}` : "/admin/leads"}
          >
            Cancel
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
