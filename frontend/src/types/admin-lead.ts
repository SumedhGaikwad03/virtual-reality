export type LeadStatus = "NEW" | "IN_PROGRESS" | "DONE";
export type UnifiedLeadType = "PROPERTY" | "RENTAL";

export type AdminLead = {
  id: string;
  type?: UnifiedLeadType;
  name: string;
  phone: string;
  email: string | null;
  developer: { id: string; name: string; slug: string } | null;
  project: { id: string; name: string; slug: string } | null;
  configuration: { id: string; name: string } | null;
  createdById?: string | null;
  ownerId?: string | null;
  createdBy?: { id: string; name: string | null; email: string; role: string } | null;
  owner?: { id: string; name: string | null; email: string; role: string } | null;
  message: string | null;
  visitDate: string | null;
  visitTime: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  // Rental-specific fields (when type === "RENTAL")
  rentalConfiguration?: string | null;
  location?: string | null;
  areaLocality?: string | null;
  budget?: string | null;
  furnishing?: string | null;
  moveInTimeframe?: string | null;
  whoIsFor?: string | null;
  internalNotes?: string | null;
};

export type AdminLeadCreateInput = {
  name: string;
  phone: string;
  email?: string | null;
  developerId?: string | null;
  projectId?: string | null;
  configurationId?: string | null;
  message?: string | null;
  visitDate?: string | null;
  visitTime?: string | null;
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
  visitDate?: string | null;
  visitTime?: string | null;
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
  status?: string;
  type?: "ALL" | "PROPERTY" | "RENTAL";
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
export type AdminVisitCreateInput = {
  name: string;
  phone: string;
  visitDate: string;
  visitTime?: string | null;
  email?: string | null;
  developerId?: string | null;
  projectId?: string | null;
  configurationId?: string | null;
  message?: string | null;
  status?: LeadStatus;
  notes?: string | null;
};

export type AdminVisitUpdateInput = {
  name?: string;
  phone?: string;
  visitDate?: string | null;
  visitTime?: string | null;
  email?: string | null;
  developerId?: string | null;
  projectId?: string | null;
  configurationId?: string | null;
  message?: string | null;
  status?: LeadStatus;
  notes?: string | null;
};

export type AdminVisitsData = {
  today: AdminLead[];
  upcoming: AdminLead[];
  past: AdminLead[];
};
export type AdminVisitsResponse = { data: AdminVisitsData };
