/*
 * PURPOSE:
 * Admin developer domain type definitions.
 *
 * FLOW:
 * Admin Developer Management Flow
 *
 * RESPONSIBILITY:
 * Defines TypeScript types for admin developer records, create/update inputs, and API responses.
 */

export type PublishStatus = "DRAFT" | "PUBLISHED";

export type AdminDeveloper = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  publishStatus: PublishStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminDeveloperInput = {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  publishStatus?: PublishStatus;
};

export type AdminDeveloperResponse = {
  data: AdminDeveloper;
};

export type AdminDevelopersResponse = {
  data: AdminDeveloper[];
};