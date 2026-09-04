/*
 * PURPOSE:
 * Admin account creation page component.
 *
 * FLOW:
 * Admin Navigation -> CreateAdminPage -> createAdminAccount API -> Backend /api/admin/auth/admins.
 *
 * RESPONSIBILITY:
 * Provides an administrative interface allowing authenticated administrators to provision
 * new administrator accounts safely without exposing public registration.
 */

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  createAdminAccount,
  AdminAuthApiError,
  type CreatedAdminAccountResponse,
} from "../../api/admin-auth";

export function CreateAdminPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdAdmin, setCreatedAdmin] = useState<CreatedAdminAccountResponse["data"] | null>(null);

  function handleChange(field: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    const email = formData.email.trim();
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!firstName) {
      setErrorMessage("First name is required.");
      return;
    }

    if (!lastName) {
      setErrorMessage("Last name is required.");
      return;
    }

    if (!email) {
      setErrorMessage("Email address is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createAdminAccount({
        email,
        password,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
      });

      setCreatedAdmin(res.data);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      if (err instanceof AdminAuthApiError && err.status === 409) {
        setErrorMessage("An administrator account with this email address already exists.");
      } else if (err instanceof AdminAuthApiError) {
        setErrorMessage(err.message || "Failed to create administrator account.");
      } else {
        setErrorMessage("Unable to create account. Please verify your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCreateAnother() {
    setCreatedAdmin(null);
    setErrorMessage(null);
  }

  return (
    <AdminLayout>
      <div className="admin-top-bar">
        <Link className="admin-action admin-action--secondary" to="/admin/accounts">
          ← Back to Accounts
        </Link>
      </div>

      <div className="admin-page-heading">
        <div>
          <p>Access control & team provisioning</p>
          <h1>Create Administrator Account</h1>
          <p>
            Provision a new internal administrator account with full platform management privileges.
          </p>
        </div>
      </div>

      <div className="admin-account-create-container">
        {createdAdmin ? (
          <div className="admin-card admin-account-success-card" role="status">
            <div className="admin-success-icon" aria-hidden="true">
              ✓
            </div>
            <h2>Administrator Account Created</h2>
            <p className="admin-success-desc">
              The administrator account has been successfully provisioned and can now sign in at the
              administrative portal.
            </p>

            <div className="admin-created-details-box">
              <div className="admin-detail-row">
                <span className="admin-detail-label">Name:</span>
                <span className="admin-detail-value">{createdAdmin.name || "—"}</span>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Email:</span>
                <span className="admin-detail-value">{createdAdmin.email}</span>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Assigned Role:</span>
                <span className="admin-detail-value admin-badge-admin">Administrator</span>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Status:</span>
                <span className="admin-detail-value admin-badge-active">Active</span>
              </div>
            </div>

            <div className="admin-success-actions">
              <button
                type="button"
                onClick={handleCreateAnother}
                className="admin-action admin-action--primary"
              >
                Create Another Administrator
              </button>
              <Link to="/admin/accounts" className="admin-action admin-action--secondary">
                View All Accounts
              </Link>
              <Link to="/admin" className="admin-action admin-action--secondary">
                Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="admin-card admin-account-form-card">
            <div className="admin-account-card-header">
              <h2>Account Details</h2>
              <p>All fields are required. The role is assigned automatically as Administrator.</p>
            </div>

            {errorMessage && (
              <div className="admin-alert-banner admin-alert-banner--error" role="alert">
                ⚠ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-row">
                <label>
                  First Name
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="e.g. Rahul"
                    disabled={isSubmitting}
                    autoComplete="given-name"
                  />
                </label>

                <label>
                  Last Name
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="e.g. Sharma"
                    disabled={isSubmitting}
                    autoComplete="family-name"
                  />
                </label>
              </div>

              <label>
                Email Address
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="e.g. rahul.sharma@virtual2reality.in"
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </label>

              <label>
                Password
                <div className="admin-password-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Minimum 8 characters"
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="admin-password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <label>
                Confirm Password
                <div className="admin-password-input-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    placeholder="Re-enter password"
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="admin-password-toggle-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <div className="admin-security-note">
                <span className="admin-security-icon">🔒</span>
                <span>
                  Passwords are encrypted using salted bcrypt hashing and cannot be retrieved in plaintext.
                </span>
              </div>

              <div className="admin-form-actions">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="admin-action admin-action--primary"
                >
                  {isSubmitting ? "Creating Account..." : "Create Admin Account"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  disabled={isSubmitting}
                  className="admin-action admin-action--secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
