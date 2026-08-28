/*
 * PURPOSE:
 * Public search catalog application service.
 *
 * FLOW:
 * Guided Search Catalog Service Flow
 *
 * RESPONSIBILITY:
 * Retrieves published projects and configurations from the catalog repository and formats them
 * into structured catalog response DTOs for client-side search.
 */

import { searchCatalogRepository } from "../../repositories/search-catalog.repository.js";

export async function getSearchCatalog() {
  const projects = await searchCatalogRepository.findCatalog();

  return {
    data: projects.map((project) => ({
      id: project.id,
      name: project.name,
      slug: project.slug,

      developer: project.developer,

      location: {
        name: project.locationName,
        slug: project.locationSlug,
      },

      status: project.status,

      configurations: project.configurations.map((configuration) => ({
        id: configuration.id,
        bhk: configuration.bhk,
        carpetArea: configuration.carpetArea,
        priceFrom: configuration.priceFrom.toString(),
        availabilityStatus: configuration.availabilityStatus,
      })),
    })),
  };
}