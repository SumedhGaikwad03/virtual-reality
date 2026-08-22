import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminApiError } from "../../api/admin-client";
import {
  createDeveloper,
  getDeveloper,
  getDevelopers,
  updateDeveloper,
} from "../../api/admin-developers";
import { AdminLayout } from "../../components/admin/AdminLayout";
import type {
  AdminDeveloper,
  AdminDeveloperInput,
} from "../../types/admin-developer";

type FormState = {
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  logoUrl: "",
  websiteUrl: "",
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
  };
}

function cleanPayload(form: FormState): AdminDeveloperInput {
  const payload: AdminDeveloperInput = {
    name: form.name.trim(),
    slug: form.slug.trim(),
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

export function DevelopersPage() {
  const navigate = useNavigate();

  return (
    <DeveloperListPage
      onAdd={() => navigate("/admin/developers/new")}
    />
  );
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

  function setField(field: keyof FormState, value: string) {
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

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Developer"}
        </button>
      </form>
    </AdminLayout>
  );
}

function DeveloperListPage({
  onAdd,
}: {
  onAdd: () => void;
}) {
  const [developers, setDevelopers] = useState<AdminDeveloper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getDevelopers()
      .then((response) => {
        if (active) {
          setDevelopers(response.data);
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
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page-heading">
        <div>
          <h1>Developers</h1>
          <p>
            Manage the developers shown on the public site.
          </p>
        </div>

        <button type="button" onClick={onAdd}>
          Add Developer
        </button>
      </div>

      {isLoading && <p>Loading developers...</p>}

      {error && <p role="alert">{error}</p>}

      {!isLoading &&
        !error &&
        developers.length === 0 && (
          <section className="admin-card">
            <p>No developers have been added yet.</p>
          </section>
        )}

      {!isLoading &&
        !error &&
        developers.length > 0 && (
          <div className="admin-card admin-developer-list">
            {developers.map((developer) => (
              <article
                className="admin-developer-row"
                key={developer.id}
              >
                {developer.logoUrl ? (
                  <img
                    src={developer.logoUrl}
                    alt=""
                    className="admin-developer-logo"
                  />
                ) : (
                  <div className="admin-developer-logo admin-developer-logo-fallback">
                    {developer.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <h2>{developer.name}</h2>
                  <p>{developer.slug}</p>
                </div>

                <Link
                  to={`/admin/developers/${developer.id}`}
                >
                  View / Edit
                </Link>
              </article>
            ))}
          </div>
        )}
    </AdminLayout>
  );
}