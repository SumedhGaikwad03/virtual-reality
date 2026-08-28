/*
 * PURPOSE:
 * Admin configuration create and edit form page.
 *
 * FLOW:
 * Admin Configuration Management Flow
 *
 * RESPONSIBILITY:
 * Manages configuration create and edit form state, input validation (positive integers for areas/BHK,
 * numeric string for paise price), parent project resolution, and submission to the backend API.
 */

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import {
  createConfiguration,
  getConfiguration,
  updateConfiguration,
} from "../../api/admin-configurations";
import { getProject } from "../../api/admin-projects";
import { AdminLayout } from "../../components/admin/AdminLayout";
import type { AdminProject } from "../../types/admin-project";
import type {
  AdminConfiguration,
  AdminConfigurationInput,
  AvailabilityStatus,
} from "../../types/admin-configuration";

type FormState = {
  name: string;
  bhk: string;
  carpetArea: string;
  builtUpArea: string;
  superBuiltUpArea: string;
  priceFrom: string;
  availabilityStatus: AvailabilityStatus;
};

const availabilityStatuses: AvailabilityStatus[] = [
  "AVAILABLE",
  "LIMITED",
  "SOLD_OUT",
];

const emptyForm: FormState = {
  name: "",
  bhk: "",
  carpetArea: "",
  builtUpArea: "",
  superBuiltUpArea: "",
  priceFrom: "",
  availabilityStatus: "AVAILABLE",
};

function errorMessage(error: unknown, context: "load" | "save") {
  if (!(error instanceof AdminApiError)) {
    return "Something went wrong. Please try again.";
  }

  if (error.status === 400) {
    return "Please check the configuration details.";
  }

  if (error.status === 404) {
    return context === "load"
      ? "Configuration or project not found."
      : "Configuration not found.";
  }

  if (error.status === null) {
    return "Unable to reach the server. Please try again.";
  }

  return context === "save"
    ? "Unable to save configuration. Please try again."
    : "Unable to load configuration. Please try again.";
}

function toForm(configuration: AdminConfiguration): FormState {
  return {
    name: configuration.name,
    bhk: String(configuration.bhk),
    carpetArea: String(configuration.carpetArea),
    builtUpArea:
      configuration.builtUpArea === null
        ? ""
        : String(configuration.builtUpArea),
    superBuiltUpArea:
      configuration.superBuiltUpArea === null
        ? ""
        : String(configuration.superBuiltUpArea),
    // priceFrom is retained as a numeric string in the frontend to prevent floating-point precision issues
    priceFrom: configuration.priceFrom,
    availabilityStatus: configuration.availabilityStatus,
  };
}

function positiveInteger(value: string) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function cleanPayload(
  form: FormState,
): AdminConfigurationInput | string {
  const bhk = positiveInteger(form.bhk);
  const carpetArea = positiveInteger(form.carpetArea);
  const builtUpArea = form.builtUpArea
    ? positiveInteger(form.builtUpArea)
    : undefined;
  const superBuiltUpArea = form.superBuiltUpArea
    ? positiveInteger(form.superBuiltUpArea)
    : undefined;

  // Validate required fields: name, BHK (positive integer), carpet area (positive integer), and priceFrom (whole number string in paise)
  if (
    !form.name.trim() ||
    bhk === null ||
    carpetArea === null ||
    !/^\d+$/.test(form.priceFrom)
  ) {
    return "Name, BHK, carpet area, and a whole-number price are required.";
  }

  if (
    (form.builtUpArea && builtUpArea === null) ||
    (form.superBuiltUpArea && superBuiltUpArea === null)
  ) {
    return "Optional area values must be positive whole numbers.";
  }

  return {
    name: form.name.trim(),
    bhk,
    carpetArea,
    ...(builtUpArea !== undefined && builtUpArea !== null
      ? { builtUpArea }
      : {}),
    ...(superBuiltUpArea !== undefined &&
    superBuiltUpArea !== null
      ? { superBuiltUpArea }
      : {}),
    priceFrom: form.priceFrom,
    availabilityStatus: form.availabilityStatus,
  };
}

export function ConfigurationFormPage() {
  const { id, projectId } = useParams<{
    id: string;
    projectId: string;
  }>();

  const navigate = useNavigate();

  const [project, setProject] =
    useState<AdminProject | null>(null);

  const [resolvedProjectId, setResolvedProjectId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [isLoading, setIsLoading] =
    useState(Boolean(id) || Boolean(projectId));

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // In edit mode (id), fetch the configuration first, then load the parent project using configuration.projectId.
    // In create mode (projectId), load the parent project directly from the URL param.
    const load = id
      ? getConfiguration(id).then((response) =>
          getProject(response.data.projectId).then(
            (projectResponse) => ({
              configuration: response.data,
              project: projectResponse.data,
            }),
          ),
        )
      : projectId
        ? getProject(projectId).then((response) => ({
            configuration: null,
            project: response.data,
          }))
        : Promise.reject(
            new Error("Missing project context"),
          );

    load
      .then((result) => {
        if (!active) {
          return;
        }

        setProject(result.project);
        setResolvedProjectId(result.project.id);

        if (result.configuration) {
          setForm(toForm(result.configuration));
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(errorMessage(requestError, "load"));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id, projectId]);

  function setField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const payload = cleanPayload(form);

    if (typeof payload === "string") {
      setError(payload);
      return;
    }

    if (!resolvedProjectId) {
      setError("Project context is missing.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (id) {
        await updateConfiguration(id, payload);
      } else {
        await createConfiguration(
          resolvedProjectId,
          payload,
        );
      }

      navigate(
        `/admin/projects/${resolvedProjectId}/configurations`,
        {
          replace: true,
        },
      );
    } catch (requestError) {
      setError(errorMessage(requestError, "save"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <p>Loading configuration...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <p>
        <Link
          to={
            project
              ? `/admin/projects/${project.id}/configurations`
              : "/admin/projects"
          }
        >
          ← Configurations
        </Link>
      </p>

      <p>
        Project: {project?.name ?? "Unknown project"}
      </p>

      <h1>
        {id ? "Edit Configuration" : "Add Configuration"}
      </h1>

      {id && (
        <p>
          <Link to={`/admin/configurations/${id}/media`}>
            Manage media
          </Link>
        </p>
      )}

      {error && <p role="alert">{error}</p>}

      <form
        className="admin-configuration-form"
        onSubmit={handleSubmit}
      >
        <label>
          Name
          <input
            required
            value={form.name}
            onChange={(event) =>
              setField("name", event.target.value)
            }
          />
        </label>

        <label>
          BHK
          <input
            required
            type="number"
            min="1"
            step="1"
            value={form.bhk}
            onChange={(event) =>
              setField("bhk", event.target.value)
            }
          />
        </label>

        <label>
          Carpet area (sq ft)
          <input
            required
            type="number"
            min="1"
            step="1"
            value={form.carpetArea}
            onChange={(event) =>
              setField(
                "carpetArea",
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Built-up area (sq ft)
          <input
            type="number"
            min="1"
            step="1"
            value={form.builtUpArea}
            onChange={(event) =>
              setField(
                "builtUpArea",
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Super built-up area (sq ft)
          <input
            type="number"
            min="1"
            step="1"
            value={form.superBuiltUpArea}
            onChange={(event) =>
              setField(
                "superBuiltUpArea",
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Price from (paise)
          <input
            required
            inputMode="numeric"
            pattern="[0-9]+"
            value={form.priceFrom}
            onChange={(event) =>
              setField(
                "priceFrom",
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Availability
          <select
            required
            value={form.availabilityStatus}
            onChange={(event) =>
              setField(
                "availabilityStatus",
                event.target.value as AvailabilityStatus,
              )
            }
          >
            {availabilityStatuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={
            isSubmitting || !project || !resolvedProjectId
          }
        >
          {isSubmitting
            ? "Saving..."
            : "Save Configuration"}
        </button>
      </form>
    </AdminLayout>
  );
}