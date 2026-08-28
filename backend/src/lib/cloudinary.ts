/*
 * PURPOSE:
 * External Cloudinary media storage adapter.
 *
 * FLOW:
 * Cloudinary Media Storage Flow
 *
 * RESPONSIBILITY:
 * Encapsulates communication with Cloudinary API:
 * - Lazy configuration using server-side environment variables.
 * - Streaming upload buffers directly to Cloudinary folder destinations.
 * - Destroying assets by public ID with CDN invalidation on rollback or deletion.
 */

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export class CloudinaryConfigurationError extends Error {
  readonly code = "MEDIA_STORAGE_NOT_CONFIGURED";
  readonly statusCode = 500;

  constructor() {
    super("Cloudinary is not configured");
    this.name = "CloudinaryConfigurationError";
  }
}

export class CloudinaryUploadError extends Error {
  readonly code = "MEDIA_STORAGE_ERROR";
  readonly statusCode = 502;

  constructor() {
    super("Cloudinary upload failed");
    this.name = "CloudinaryUploadError";
  }
}

let isConfigured = false;

// Initializes Cloudinary client lazily on first access using server-side environment credentials
function getClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new CloudinaryConfigurationError();
  }

  if (!isConfigured) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    isConfigured = true;
  }

  return cloudinary;
}

// Uploads a file buffer stream to Cloudinary in the designated folder and resource type
export function uploadMediaBuffer(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "raw",
) {
  const client = getClient();

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error || !result) {
          reject(new CloudinaryUploadError());
          return;
        }
        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

// Destroys an uploaded asset on Cloudinary and invalidates CDN cache
export async function deleteUploadedAsset(
  publicId: string,
  resourceType: "image" | "video" | "raw",
) {
  const client = getClient();
  await client.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
}
