/*
 * PURPOSE:
 * Delivery-time image optimization utility for Cloudinary media assets.
 *
 * FLOW:
 * Cloudinary Media Delivery Flow
 *
 * RESPONSIBILITY:
 * Injects automatic format and quality parameters (f_auto,q_auto) into Cloudinary
 * image delivery URLs at display time without altering database records or origin assets.
 * Safely ignores non-Cloudinary URLs, SVG vector assets, documents, videos, and already-optimized URLs.
 */

export type ImageOptimizationOptions = {
  width?: number;
};

export function getOptimizedImageUrl(
  url?: string | null,
  options?: ImageOptimizationOptions,
): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  // 1. Only transform Cloudinary image delivery URLs
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  // 2. Preserve SVG vectors untouched (avoid lossy rasterization)
  if (url.toLowerCase().endsWith(".svg")) {
    return url;
  }

  // 3. Prevent duplicate transformations if already present
  if (url.includes("/image/upload/f_auto") || url.includes("/image/upload/q_auto")) {
    return url;
  }

  // 4. Construct transformation segment (with optional c_limit width constraint)
  const transform =
    options?.width && options.width > 0
      ? `f_auto,q_auto,w_${options.width},c_limit`
      : "f_auto,q_auto";

  // 5. Inject transformation segment immediately following /image/upload/
  return url.replace("/image/upload/", `/image/upload/${transform}/`);
}
