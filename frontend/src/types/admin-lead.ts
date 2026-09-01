export type LeadStatus = "NEW" | "IN_PROGRESS" | "DONE";

export type AdminLead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  developer: { id: string; name: string; slug: string } | null;
  project: { id: string; name: string; slug: string } | null;
  configuration: { id: string; name: string } | null;
  message: string | null;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminLeadUpdateInput = {
  status?: LeadStatus;
  notes?: string | null;
};

export type AdminLeadResponse = { data: AdminLead };
export type AdminLeadsResponse = { data: AdminLead[] };
