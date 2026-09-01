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

// Converts YouTube, Vimeo, and direct video URLs into normalized embed configurations
function getEmbedConfig(rawUrl: string): VideoEmbedConfig {
  const url = rawUrl.trim();

  // YouTube Watch URL: https://www.youtube.com/watch?v=XYZ
  const ytWatchMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
  if (ytWatchMatch?.[1]) {
    return {
      kind: "iframe",
      embedUrl: `https://www.youtube.com/embed/${ytWatchMatch[1]}`,
    };
  }

  // YouTube Short URL: https://youtu.be/XYZ
  const ytShortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytShortMatch?.[1]) {
    return {
      kind: "iframe",
      embedUrl: `https://www.youtube.com/embed/${ytShortMatch[1]}`,
    };
  }

  // YouTube Embed URL already: https://www.youtube.com/embed/XYZ
  if (url.includes("youtube.com/embed/")) {
    return {
      kind: "iframe",
      embedUrl: url,
    };
  }

  // Vimeo URL: https://vimeo.com/XYZ
  const vimeoMatch = url.match(/(?:vimeo\.com\/)([0-9]+)/);
  if (vimeoMatch?.[1]) {
    return {
      kind: "iframe",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // Vimeo Player URL already: https://player.vimeo.com/video/XYZ
  if (url.includes("player.vimeo.com/video/")) {
    return {
      kind: "iframe",
      embedUrl: url,
    };
  }

  // Native MP4 / WebM video file
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
          {videoMedia.title ?? "Project Showcase Video"}
        </h2>

        <div className="project-video-embed-wrapper">
          {embedConfig.kind === "iframe" ? (
            <iframe
              src={embedConfig.embedUrl}
              title={videoMedia.title ?? "Project video tour"}
              className="project-video-iframe"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              controls
              src={embedConfig.embedUrl}
              preload="metadata"
              className="project-video-native"
              aria-label={videoMedia.title ?? "Project video tour"}
            />
          )}
        </div>
      </div>
    </section>
  );
}
