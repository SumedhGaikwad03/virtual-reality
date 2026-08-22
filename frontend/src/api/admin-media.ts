import { adminRequest } from "./admin-client";
import type {
  AdminMediaListResponse,
  AdminMediaResponse,
  MediaMetadataInput,
  MediaUploadInput,
} from "../types/admin-media";

export function uploadMedia(input: MediaUploadInput) {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("type", input.type);
  formData.append("category", input.category);
  if (input.projectId) formData.append("projectId", input.projectId);
  if (input.configurationId) formData.append("configurationId", input.configurationId);
  if (input.title) formData.append("title", input.title);
  if (input.altText) formData.append("altText", input.altText);
  if (input.sortOrder !== undefined) formData.append("sortOrder", String(input.sortOrder));
  if (input.isPrimary !== undefined) formData.append("isPrimary", String(input.isPrimary));
  return adminRequest<AdminMediaResponse>("/admin/media", {
    method: "POST",
    body: formData,
  });
}

export function getProjectMedia(projectId: string) {
  return adminRequest<AdminMediaListResponse>(`/admin/media/project/${projectId}`);
}

export function getConfigurationMedia(configurationId: string) {
  return adminRequest<AdminMediaListResponse>(`/admin/media/configuration/${configurationId}`);
}

export function getMedia(id: string) {
  return adminRequest<AdminMediaResponse>(`/admin/media/${id}`);
}

export function updateMedia(id: string, payload: MediaMetadataInput) {
  return adminRequest<AdminMediaResponse>(`/admin/media/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
