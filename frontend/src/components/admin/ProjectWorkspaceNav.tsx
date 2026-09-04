/*
 * PURPOSE:
 * Provides contextual navigation for the admin workspace of one project.
 *
 * FLOW:
 * Project-scoped admin pages pass the current project identity and active section;
 * this component renders links to the existing project, media, configuration,
 * in-page authoring, and public preview routes.
 *
 * RESPONSIBILITY:
 * Keep project administration visibly grouped without changing persistence or routing.
 */

import { Link } from "react-router-dom";

type ProjectWorkspaceNavProps = {
  projectId: string;
  projectName: string;
  active: "overview" | "media" | "configurations" | "highlights";
  previewHref?: string;
};

export function ProjectWorkspaceNav({
  projectId,
  projectName,
  active,
  previewHref,
}: ProjectWorkspaceNavProps) {
  const sections = [
    { key: "overview", label: "Overview", to: `/admin/projects/${projectId}` },
    { key: "media", label: "Media", to: `/admin/projects/${projectId}/media` },
    {
      key: "configurations",
      label: "Configurations",
      to: `/admin/projects/${projectId}/configurations`,
    },
    { key: "highlights", label: "Highlights & Amenities", to: `/admin/projects/${projectId}#highlights` },
  ] as const;

  return (
    <section className="admin-project-workspace" aria-label={`Project workspace for ${projectName}`}>
      <div className="admin-project-workspace-heading">
        <p>Project workspace</p>
        <h1>{projectName || "Untitled project"}</h1>
      </div>
      <nav className="admin-project-workspace-nav" aria-label="Project sections">
        {sections.map((section) => (
          <Link
            key={section.key}
            className={section.key === active ? "is-active" : undefined}
            aria-current={section.key === active ? "page" : undefined}
            to={section.to}
            onClick={(event) => {
              if (section.key === "highlights") {
                const el = document.getElementById("highlights");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              } else if (
                section.key === "overview" &&
                window.location.pathname === `/admin/projects/${projectId}`
              ) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            {section.label}
          </Link>
        ))}
        {previewHref && (
          <a className="admin-action admin-action--utility" href={previewHref} target="_blank" rel="noreferrer">
            Preview
          </a>
        )}
      </nav>
    </section>
  );
}
