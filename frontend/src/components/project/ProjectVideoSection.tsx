/*
 * PURPOSE:
 * Optional Project Video section component for the public Project page.
 *
 * FLOW:
 * Public Project Media Narrative: ProjectPage -> ProjectVideoSection.
 *
 * RESPONSIBILITY:
 * Normalizes YouTube, Vimeo, and direct video file URLs into a responsive 16:9 lazy-loaded player embed.
 * Omitted gracefully if no project video exists.
 */

import type { Media } from "../../types/project";

type ProjectVideoSectionProps = {
  media: Media[];
};

type VideoEmbedConfig = {
  kind: "iframe" | "native";
  embedUrl: string;
};

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

function extractYouTubeVideoId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

    // 1. youtu.be shortlinks: https://youtu.be/VIDEO_ID
    if (hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0]?.split("?")[0];
      if (id && YOUTUBE_ID_REGEX.test(id)) {
        return id;
      }
    }

    // 2. youtube.com & youtube-nocookie.com (including m.youtube.com, etc.)
    if (
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com") ||
      hostname === "youtube-nocookie.com" ||
      hostname.endsWith(".youtube-nocookie.com")
    ) {
      // /watch?v=VIDEO_ID (or any query param order: /watch?feature=shared&v=VIDEO_ID)
      if (parsed.pathname === "/watch") {
        const v = parsed.searchParams.get("v");
        if (v && YOUTUBE_ID_REGEX.test(v)) {
          return v;
        }
      }

      // /embed/VIDEO_ID, /shorts/VIDEO_ID, /live/VIDEO_ID, /v/VIDEO_ID
      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      if (
        pathSegments.length >= 2 &&
        ["embed", "shorts", "live", "v"].includes(pathSegments[0])
      ) {
        const id = pathSegments[1];
        if (id && YOUTUBE_ID_REGEX.test(id)) {
          return id;
        }
      }
    }
  } catch {
    // Non-standard URL string fallback regex
    const regexFallback =
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const match = rawUrl.match(regexFallback);
    if (match?.[1] && YOUTUBE_ID_REGEX.test(match[1])) {
      return match[1];
    }
  }

  return null;
}

function extractVimeoVideoId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (hostname === "vimeo.com" || hostname === "player.vimeo.com") {
      const match = parsed.pathname.match(/\/(?:video\/)?([0-9]+)/);
      if (match?.[1]) {
        return match[1];
      }
    }
  } catch {
    const match = rawUrl.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

// Converts YouTube, Vimeo, and direct video URLs into normalized embed configurations
function getEmbedConfig(rawUrl: string): VideoEmbedConfig {
  const url = rawUrl.trim();

  // 1. YouTube video (normalized to privacy-enhanced youtube-nocookie embed)
  const ytId = extractYouTubeVideoId(url);
  if (ytId) {
    return {
      kind: "iframe",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}`,
    };
  }

  // 2. Vimeo video
  const vimeoId = extractVimeoVideoId(url);
  if (vimeoId) {
    return {
      kind: "iframe",
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
    };
  }

  // 3. Native MP4 / WebM video file
  return {
    kind: "native",
    embedUrl: url,
  };
}

export function ProjectVideoSection({ media }: ProjectVideoSectionProps) {
  // Find project video asset: category === "PROJECT_VIDEO" or type === "VIDEO"
  const videoMedia =
    media.find((item) => item.category === "PROJECT_VIDEO") ??
    media.find((item) => item.type === "VIDEO");

  if (!videoMedia || !videoMedia.url) {
    return null;
  }

  const embedConfig = getEmbedConfig(videoMedia.url);

  return (
    <section className="project-video-section" aria-labelledby="project-video-heading">
      <div className="project-video-container">
        <span className="section-eyebrow">CINEMATIC TOUR</span>
        <h2 id="project-video-heading" className="project-video-title">
          {videoMedia.altText ?? "Project Showcase Video"}
        </h2>

        <div className="project-video-embed-wrapper">
          {embedConfig.kind === "iframe" ? (
            <iframe
              src={embedConfig.embedUrl}
              title={videoMedia.altText ?? "Project video tour"}
              className="project-video-iframe"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              controls
              src={embedConfig.embedUrl}
              preload="metadata"
              className="project-video-native"
              aria-label={videoMedia.altText ?? "Project video tour"}
            />
          )}
        </div>
      </div>
    </section>
  );
}
