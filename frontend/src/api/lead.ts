import { API_BASE_URL } from "./config";

export type CreateLeadPayload = {
  name: string;
  phone: string;
  email?: string;
  developerId?: string;
  projectId?: string;
  configurationId?: string;
  message?: string;
};

export class LeadApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeadApiError";
  }
}

export async function createLead(payload: CreateLeadPayload) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new LeadApiError("Lead request failed");
  }

  if (!response.ok) {
    throw new LeadApiError("Lead request failed");
  }
}
