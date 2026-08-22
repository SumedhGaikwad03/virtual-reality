import type { FormEvent } from "react";
import { useState } from "react";
import { AdminApiError } from "../../api/admin-client";
import { analyzeImport } from "../../api/admin-import";
import { createDeveloper } from "../../api/admin-developers";
import { createProject } from "../../api/admin-projects";
import { createConfiguration } from "../../api/admin-configurations";
import { AdminLayout } from "../../components/admin/AdminLayout";
import type { ImportDraft } from "../../types/admin-import";
import type { AdminDeveloperInput } from "../../types/admin-developer";
import type { AdminProjectInput } from "../../types/admin-project";
import type { AdminConfigurationInput } from "../../types/admin-configuration";

function requestErrorMessage(error: unknown, analyzing: boolean) {
  if (!(error instanceof AdminApiError)) return analyzing ? "Unable to analyze this page." : "Unable to complete the import.";
  if (error.status === 400) return analyzing ? "Please enter a valid website URL." : "Please complete the required import fields.";
  if (error.status === 409) return "A developer or project with this slug already exists.";
  if (error.status === 404) return "A required developer or project was not found.";
  if (error.status === null) return "Unable to reach the server. Please try again.";
  return analyzing ? "Unable to analyze this page." : "Unable to complete the import.";
}

function setDraftField<K extends keyof ImportDraft["developer"]>(draft: ImportDraft, field: K, value: string) {
  return { ...draft, developer: { ...draft.developer, [field]: value || null } };
}

function positiveInteger(value: number | null): value is number {
  return value !== null && Number.isSafeInteger(value) && value > 0;
}

export function ImportPage() {
  const [url, setUrl] = useState("");
  const [draft, setDraft] = useState<ImportDraft | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    try {
      const parsed = new URL(url.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    } catch {
      setError("Please enter a valid website URL.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const response = await analyzeImport(url.trim());
      setDraft(response.data);
    } catch (requestError) {
      setError(requestErrorMessage(requestError, true));
    } finally {
      setIsAnalyzing(false);
    }
  }

  function updateDeveloper(field: keyof ImportDraft["developer"], value: string) {
    setDraft((current) => current ? setDraftField(current, field, value) : current);
  }

  function updateProject(field: keyof ImportDraft["project"], value: string | boolean) {
    setDraft((current) => current ? { ...current, project: { ...current.project, [field]: value || null } } : current);
  }

  function updateConfiguration(index: number, field: string, value: string) {
    setDraft((current) => {
      if (!current) return current;
      const configurations = current.configurations.map((configuration, configurationIndex) => {
        if (configurationIndex !== index) return configuration;
        if (["bhk", "carpetArea", "builtUpArea", "superBuiltUpArea"].includes(field)) {
          return { ...configuration, [field]: value === "" ? null : Number(value) };
        }
        return { ...configuration, [field]: value || null };
      });
      return { ...current, configurations };
    });
  }

  async function handleApprove() {
    if (!draft) return;
    setError(null);
    setResult(null);
    if (!draft.developer.name || !draft.developer.slug || !draft.project.name || !draft.project.slug ||
      !draft.project.locationName || !draft.project.locationSlug || !draft.project.address || !draft.project.status) {
      setError("Complete the required developer and project fields before importing.");
      return;
    }
    setIsImporting(true);
    try {
      const developerPayload: AdminDeveloperInput = {
        name: draft.developer.name,
        slug: draft.developer.slug,
        ...(draft.developer.description ? { description: draft.developer.description } : {}),
        ...(draft.developer.logoUrl ? { logoUrl: draft.developer.logoUrl } : {}),
        ...(draft.developer.websiteUrl ? { websiteUrl: draft.developer.websiteUrl } : {}),
      };
      const developerResponse = await createDeveloper(developerPayload);
      const projectPayload: AdminProjectInput = {
        developerId: developerResponse.data.id,
        name: draft.project.name,
        slug: draft.project.slug,
        locationName: draft.project.locationName,
        locationSlug: draft.project.locationSlug,
        address: draft.project.address,
        status: draft.project.status,
        ...(draft.project.description ? { description: draft.project.description } : {}),
        ...(draft.project.mapsUrl ? { mapsUrl: draft.project.mapsUrl } : {}),
        ...(draft.project.featured !== null ? { featured: draft.project.featured } : {}),
      };
      const projectResponse = await createProject(projectPayload);
      const failures: string[] = [];
      for (const [index, configuration] of draft.configurations.entries()) {
        if (!configuration.name || !positiveInteger(configuration.bhk) || !positiveInteger(configuration.carpetArea) ||
          !configuration.priceFrom || !/^\d+$/.test(configuration.priceFrom) || !configuration.availabilityStatus) {
          failures.push(`Configuration ${index + 1} is incomplete`);
          continue;
        }
        const configurationPayload: AdminConfigurationInput = {
          name: configuration.name,
          bhk: configuration.bhk,
          carpetArea: configuration.carpetArea,
          priceFrom: configuration.priceFrom,
          availabilityStatus: configuration.availabilityStatus,
          ...(positiveInteger(configuration.builtUpArea) ? { builtUpArea: configuration.builtUpArea } : {}),
          ...(positiveInteger(configuration.superBuiltUpArea) ? { superBuiltUpArea: configuration.superBuiltUpArea } : {}),
        };
        try {
          await createConfiguration(projectResponse.data.id, configurationPayload);
        } catch {
          failures.push(`Configuration ${index + 1} could not be imported`);
        }
      }
      setResult(failures.length ? `Import partially completed. ${failures.join("; ")}.` : "Import completed successfully. Media remains preview-only.");
    } catch (requestError) {
      setError(requestErrorMessage(requestError, false));
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <AdminLayout>
      <h1>Import Preview</h1>
      <p>Analyze one developer or project page, review the extracted data, then approve it through the existing admin APIs.</p>
      <form className="admin-import-url-form" onSubmit={handleAnalyze}>
        <label>Developer / Project URL<input required type="url" placeholder="https://developer.com/project/example" value={url} onChange={(event) => setUrl(event.target.value)} /></label>
        <button type="submit" disabled={isAnalyzing}>{isAnalyzing ? "Analyzing..." : "Analyze"}</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {result && <p role="status">{result}</p>}
      {draft && (
        <div className="admin-import-preview">
          <section className="admin-card"><h2>Developer</h2>
            {(["name", "slug", "description", "logoUrl", "websiteUrl"] as const).map((field) => <label key={field}>{field}<input value={draft.developer[field] ?? ""} onChange={(event) => updateDeveloper(field, event.target.value)} /></label>)}
          </section>
          <section className="admin-card"><h2>Project</h2>
            {(["name", "slug", "description", "locationName", "locationSlug", "address", "mapsUrl"] as const).map((field) => <label key={field}>{field}<input value={draft.project[field] ?? ""} onChange={(event) => updateProject(field, event.target.value)} /></label>)}
            <label>Status<select value={draft.project.status ?? ""} onChange={(event) => updateProject("status", event.target.value)}><option value="">Unknown</option>{["UPCOMING", "ONGOING", "READY_TO_MOVE", "COMPLETED", "SOLD_OUT"].map((status) => <option key={status}>{status}</option>)}</select></label>
            <label className="admin-checkbox"><input type="checkbox" checked={draft.project.featured === true} onChange={(event) => updateProject("featured", event.target.checked)} /> Featured</label>
          </section>
          <section className="admin-card"><h2>Configurations</h2>
            {draft.configurations.length === 0 && <p>No configurations extracted.</p>}
            {draft.configurations.map((configuration, index) => <div className="admin-import-configuration" key={`${configuration.name ?? "configuration"}-${index}`}>
              <h3>Configuration {index + 1}</h3>
              {(["name", "bhk", "carpetArea", "builtUpArea", "superBuiltUpArea", "priceFrom", "availabilityStatus"] as const).map((field) => <label key={field}>{field}{field === "availabilityStatus" ? <select value={configuration[field] ?? ""} onChange={(event) => updateConfiguration(index, field, event.target.value)}><option value="">Unknown</option>{["AVAILABLE", "LIMITED", "SOLD_OUT"].map((status) => <option key={status}>{status}</option>)}</select> : <input type={["bhk", "carpetArea", "builtUpArea", "superBuiltUpArea"].includes(field) ? "number" : "text"} value={configuration[field] ?? ""} onChange={(event) => updateConfiguration(index, field, event.target.value)} />}</label>)}
              {configuration.priceFromRaw && <p>Extracted price: {configuration.priceFromRaw}</p>}
            </div>)}
          </section>
          <section className="admin-card"><h2>Media preview</h2><p>{draft.media.length} media candidates extracted. Media is not uploaded by this workflow.</p>{draft.media.map((media) => <p key={media.url}><a href={media.url} target="_blank" rel="noreferrer">{media.type}: {media.url}</a></p>)}</section>
          <button type="button" disabled={isImporting} onClick={handleApprove}>{isImporting ? "Importing..." : "Approve & Import"}</button>
        </div>
      )}
    </AdminLayout>
  );
}
