import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import { deleteLead, getLead, updateLead } from "../../api/admin-leads";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DeleteLeadModal } from "../../components/admin/DeleteLeadModal";
import { LeadActions } from "../../components/admin/LeadActions";
import type { AdminLead, LeadStatus } from "../../types/admin-lead";

const statuses: Array<{ value: LeadStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "Ongoing" },
  { value: "DONE", label: "Done" },
];

function errorMessage(error: unknown, context: "load" | "update" | "delete") {
  if (!(error instanceof AdminApiError)) return "Something went wrong. Please try again.";
  if (error.status === 400) return "Please check the lead update details.";
  if (error.status === 404) return "Lead not found.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  if (context === "delete") return "Unable to delete the lead. Please try again.";
  return context === "update"
    ? "Unable to update the lead. Please try again."
    : "Unable to load the lead. Please try again.";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<AdminLead | null>(null);
  const [status, setStatus] = useState<LeadStatus>("NEW");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getLead(id)
      .then((response) => {
        if (!active) return;
        setLead(response.data);
        setStatus(response.data.status);
        setNotes(response.data.notes ?? "");
      })
      .catch((requestError: unknown) => {
        if (active) setError(errorMessage(requestError, "load"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      const response = await updateLead(id, { status, notes });
      setLead(response.data);
      setStatus(response.data.status);
      setNotes(response.data.notes ?? "");
      setSuccess(true);
    } catch (requestError) {
      setError(errorMessage(requestError, "update"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteLead(id);
      setIsDeleteModalOpen(false);
      navigate("/admin/leads");
    } catch (requestError) {
      setDeleteError(errorMessage(requestError, "delete"));
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) return <AdminLayout><p>Loading lead...</p></AdminLayout>;
  if (!lead) {
    return (
      <AdminLayout>
        <p>
          <Link className="admin-action admin-action--secondary" to="/admin/leads">
            ← Leads
          </Link>
        </p>
        <p role="alert">{error ?? "Lead not found."}</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-top-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link className="admin-action admin-action--secondary" to="/admin/leads">
          ← Back to Leads
        </Link>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link className="admin-action admin-action--primary" to={`/admin/leads/${lead.id}/edit`}>
            Edit Lead
          </Link>
          <button
            type="button"
            className="admin-action admin-action--danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Lead
          </button>
        </div>
      </div>

      <h1>{lead.name}</h1>
      <LeadActions lead={lead} />

      {error && <p role="alert" className="admin-alert-banner admin-alert-banner--error">{error}</p>}
      {success && <p role="status" className="admin-alert-banner admin-alert-banner--success">Lead updated successfully.</p>}

      <section className="admin-card admin-lead-details">
        <h2>Contact Details</h2>
        <p><strong>Phone:</strong> {lead.phone}</p>
        <p><strong>Email:</strong> {lead.email ?? "—"}</p>
        <p><strong>Developer:</strong> {lead.developer?.name ?? "—"}</p>
        <p><strong>Project:</strong> {lead.project?.name ?? "General enquiry"}</p>
        <p><strong>Configuration:</strong> {lead.configuration?.name ?? "—"}</p>
        <p><strong>Created:</strong> {formatDate(lead.createdAt)}</p>
        <p><strong>Last Updated:</strong> {formatDate(lead.updatedAt)}</p>

        <h2>Client Message</h2>
        <p>{lead.message || "No message provided."}</p>
      </section>

      <form className="admin-card admin-lead-update-form" onSubmit={handleSubmit}>
        <h2>Lead Triage & Status</h2>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value as LeadStatus)}>
            {statuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Internal notes
          <textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        <button className="admin-action admin-action--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>

      {/* Delete Confirmation Modal */}
      <DeleteLeadModal
        lead={isDeleteModalOpen ? lead : null}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteError(null);
        }}
      />
    </AdminLayout>
  );
}
