/*
 * PURPOSE:
 * Admin media API client.
 *
 * FLOW:
 * Admin Media API Flow
 *
 * RESPONSIBILITY:
 * Encapsulates HTTP client operations for admin media:
 * - Uploads files and metadata as multipart/form-data.
 * - Retrieves media filtered by context, developer, project, or configuration.
 * - Updates media metadata and toggles isActive publication status.
 */

import { adminRequest } from "./admin-client";
import type {
  AdminMediaListResponse,
  AdminMediaResponse,
  MediaMetadataInput,
  MediaUploadInput,
  MediaUrlInput,
} from "../types/admin-media";

// Uploads media using multipart/form-data to support file streams and metadata in a single request
export function uploadMedia(input: MediaUploadInput) {
  const formData = new FormData();

  formData.append("context", input.context);
  formData.append("type", input.type);
  formData.append("category", input.category);

  if (input.developerId) {
    formData.append("developerId", input.developerId);
  }

  if (input.projectId) {
    formData.append("projectId", input.projectId);
  }

  if (input.configurationId) {
    formData.append("configurationId", input.configurationId);
  }

  if (input.slot) {
    formData.append("slot", input.slot);
  }

  if (input.title) {
    formData.append("title", input.title);
  }

  if (input.altText) {
    formData.append("altText", input.altText);
  }

  if (input.sortOrder !== undefined) {
    formData.append("sortOrder", String(input.sortOrder));
  }

  if (input.isPrimary !== undefined) {
    formData.append("isPrimary", String(input.isPrimary));
  }

  // Appending file last guarantees Multer populates all body fields prior to validation middleware
  formData.append("file", input.file);

  return adminRequest<AdminMediaResponse>(
    "/admin/media",
    {
      method: "POST",
      body: formData,
    },
  );
}

export function createMediaFromUrl(input: MediaUrlInput) {
  return adminRequest<AdminMediaResponse>(
    "/admin/media/url",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

export function getHomeMedia(slot?: string) {
  const query = slot
    ? `?context=HOME&slot=${encodeURIComponent(slot)}`
    : "?context=HOME";

  return adminRequest<AdminMediaListResponse>(
    `/admin/media${query}`,
  );
}

export function getDeveloperMedia(
  developerId: string,
) {
  return adminRequest<AdminMediaListResponse>(
    `/admin/media/developer/${developerId}`,
  );
}

export function getProjectMedia(
  projectId: string,
) {
  return adminRequest<AdminMediaListResponse>(
    `/admin/media/project/${projectId}`,
  );
}

export function getConfigurationMedia(
  configurationId: string,
) {
  return adminRequest<AdminMediaListResponse>(
    `/admin/media/configuration/${configurationId}`,
  );
}

export function getMedia(id: string) {
  return adminRequest<AdminMediaResponse>(
    `/admin/media/${id}`,
  );
}

export function updateMedia(
  id: string,
  payload: MediaMetadataInput,
) {
  return adminRequest<AdminMediaResponse>(
    `/admin/media/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export function deleteMedia(id: string) {
  return adminRequest<AdminMediaResponse>(
    `/admin/media/${id}`,
    {
      method: "DELETE",
    },
  );
}