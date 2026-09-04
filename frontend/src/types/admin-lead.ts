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

export type AdminLeadCreateInput = {
  name: string;
  phone: string;
  email?: string | null;
  developerId?: string | null;
  projectId?: string | null;
  configurationId?: string | null;
  message?: string | null;
  status?: LeadStatus;
  notes?: string | null;
};

export type AdminLeadUpdateInput = {
  name?: string;
  phone?: string;
  email?: string | null;
  developerId?: string | null;
  projectId?: string | null;
  configurationId?: string | null;
  message?: string | null;
  status?: LeadStatus;
  notes?: string | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminLeadQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  developerId?: string;
  projectId?: string;
  configurationId?: string;
};

export type AdminLeadResponse = { data: AdminLead };
export type AdminLeadsResponse = {
  data: AdminLead[];
  pagination: PaginationMeta;
};
export type AdminLeadDeleteResponse = { data: { deleted: boolean; id: string } };
