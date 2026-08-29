/*
 * PURPOSE:
 * Admin developer create and edit form page.
 *
 * FLOW:
 * Admin Developer Management Flow
 *
 * RESPONSIBILITY:
 * Manages the form lifecycle for creating a new developer or editing an existing developer,
 * including validation, slug conflict error handling, and publication status controls.
 */

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import {
  createDeveloper,
  getDeveloper,
  updateDeveloper,
} from "../../api/admin-developers";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DeveloperMediaSection } from "../../components/admin/DeveloperMediaSection";
import type {
  AdminDeveloper,
  AdminDeveloperInput,
  PublishStatus,
} from "../../types/admin-developer";

type FormState = {
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  publishStatus: PublishStatus;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  logoUrl: "",
  websiteUrl: "",
  publishStatus: "DRAFT",
};

function errorMessage(error: unknown) {
  if (!(error instanceof AdminApiError)) {
    return "Something went wrong. Please try again.";
  }

  if (error.status === 400) {
    return "Please check the developer details and try again.";
  }

  if (error.status === 404) {
    return "Developer not found.";
  }

  if (error.status === 409) {
    return "That developer slug is already in use.";
  }

  if (error.status === null) {
    return "Unable to reach the server. Please try again.";
  }

  return "The server could not complete that request. Please try again.";
}

function toForm(developer: AdminDeveloper): FormState {
  return {
    name: developer.name,
    slug: developer.slug,
    description: developer.description ?? "",
    logoUrl: developer.logoUrl ?? "",
    websiteUrl: developer.websiteUrl ?? "",
    publishStatus: developer.publishStatus,
  };
}

function cleanPayload(form: FormState): AdminDeveloperInput {
  const payload: AdminDeveloperInput = {
    name: form.name.trim(),
    slug: form.slug.trim(),
    publishStatus: form.publishStatus,
  };

  if (form.description.trim()) {
    payload.description = form.description.trim();
  }

  if (form.logoUrl.trim()) {
    payload.logoUrl = form.logoUrl.trim();
  }

  if (form.websiteUrl.trim()) {
    payload.websiteUrl = form.websiteUrl.trim();
  }

  return payload;
}

export function DeveloperFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let active = true;

    getDeveloper(id)
      .then((response) => {
        if (active) {
          setForm(toForm(response.data));
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(errorMessage(requestError));
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
  }, [id]);

  function setField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const payload = cleanPayload(form);

    if (!payload.name || !payload.slug) {
      setError("Name and slug are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && id) {
        await updateDeveloper(id, payload);
      } else {
        await createDeveloper(payload);
      }

      navigate("/admin/developers", {
        replace: true,
      });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <p>Loading developer...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <p>
        <Link to="/admin/developers">
          ← Developers
        </Link>
      </p>

      <h1>{isEditing ? "Edit Developer" : "Add Developer"}</h1>

      {error && <p role="alert">{error}</p>}

      <form
        className="admin-developer-form"
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
          Slug
          <input
            required
            value={form.slug}
            onChange={(event) =>
              setField("slug", event.target.value)
            }
          />
        </label>

        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) =>
              setField("description", event.target.value)
            }
          />
        </label>

        <label>
          Logo URL
          <input
            type="url"
            value={form.logoUrl}
            onChange={(event) =>
              setField("logoUrl", event.target.value)
            }
          />
        </label>

        <label>
          Website URL
          <input
            type="url"
            value={form.websiteUrl}
            onChange={(event) =>
              setField("websiteUrl", event.target.value)
            }
          />
        </label>

        <label>
          Publish status
          <select
            value={form.publishStatus}
            onChange={(event) =>
              setField(
                "publishStatus",
                event.target.value as PublishStatus,
              )
            }
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <small>
            {form.publishStatus === "PUBLISHED"
              ? "Available on the public website."
              : "Not visible on the public website."}
          </small>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Developer"}
        </button>
      </form>

      {isEditing && id && (
        <DeveloperMediaSection developerId={id} />
      )}
    </AdminLayout>
  );
}
