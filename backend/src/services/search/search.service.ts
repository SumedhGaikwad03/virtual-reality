/*
 * PURPOSE:
 * Property search application service.
 *
 * FLOW:
 * Natural Language Search Service Flow
 *
 * RESPONSIBILITY:
 * Coordinates property search queries with the repository and transforms configuration entities
 * into public search result DTOs with BigInt prices serialized to strings.
 */

import { searchRepository } from "../../repositories/search.repository.js";
import type { PropertySearchQuery } from "./query-generator.service.js";

export async function searchProperties(query: PropertySearchQuery) {
  const properties = await searchRepository.findProperties(query);

  return {
    data: properties.map((property) => ({
      project: {
        id: property.project.id,
        name: property.project.name,
        slug: property.project.slug,
        location: {
          name: property.project.locationName,
          slug: property.project.locationSlug,
        },
        status: property.project.status,
      },
      developer: property.project.developer,
      configuration: {
        id: property.id,
        name: property.name,
        bhk: property.bhk,
        carpetArea: property.carpetArea,
        priceFrom: property.priceFrom.toString(),
        availabilityStatus: property.availabilityStatus,
      },
    })),
  };
}
