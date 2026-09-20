/*
 * PURPOSE:
 * Rental domain data access repository.
 *
 * FLOW:
 * Rental Enquiry & Owner Property Persistence Flow
 *
 * RESPONSIBILITY:
 * Executes Prisma queries for RentalEnquiry and RentalProperty models:
 * create, findMany (with search/filters/pagination), findById, update, and delete.
 */

import { prisma } from "../lib/prisma.js";
import type {
  RentalEnquiryStatus,
  RentalPropertyStatus,
} from "../../generated/prisma/enums.js";

const rentalEnquirySelect = {
  id: true,
  name: true,
  phone: true,
  configuration: true,
  location: true,
  areaLocality: true,
  budget: true,
  furnishing: true,
  moveInTimeframe: true,
  whoIsFor: true,
  notes: true,
  status: true,
  internalNotes: true,
  createdById: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} as const;

const rentalPropertySelect = {
  id: true,
  ownerName: true,
  phone: true,
  flatType: true,
  approxSizeSqFt: true,
  location: true,
  areaLocality: true,
  societyDeveloper: true,
  additionalDetails: true,
  status: true,
  internalNotes: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type RentalEnquiryFindManyOptions = {
  page?: number;
  limit?: number;
  search?: string;
  status?: RentalEnquiryStatus;
};

export type RentalEnquiryCreateData = {
  name: string;
  phone: string;
  configuration: string;
  location?: string | null;
  areaLocality?: string | null;
  budget?: string | null;
  furnishing?: string | null;
  moveInTimeframe?: string | null;
  whoIsFor?: string | null;
  notes?: string | null;
  status?: RentalEnquiryStatus;
  internalNotes?: string | null;
  createdById?: string | null;
};

export type RentalEnquiryUpdateData = {
  name?: string;
  phone?: string;
  configuration?: string;
  location?: string | null;
  areaLocality?: string | null;
  budget?: string | null;
  furnishing?: string | null;
  moveInTimeframe?: string | null;
  whoIsFor?: string | null;
  notes?: string | null;
  status?: RentalEnquiryStatus;
  internalNotes?: string | null;
};

export type RentalPropertyFindManyOptions = {
  page?: number;
  limit?: number;
  search?: string;
  status?: RentalPropertyStatus;
};

export type RentalPropertyCreateData = {
  ownerName: string;
  phone: string;
  flatType: string;
  approxSizeSqFt?: number | null;
  location?: string | null;
  areaLocality?: string | null;
  societyDeveloper?: string | null;
  additionalDetails?: string | null;
  status?: RentalPropertyStatus;
  internalNotes?: string | null;
};

export type RentalPropertyUpdateData = {
  ownerName?: string;
  phone?: string;
  flatType?: string;
  approxSizeSqFt?: number | null;
  location?: string | null;
  areaLocality?: string | null;
  societyDeveloper?: string | null;
  additionalDetails?: string | null;
  status?: RentalPropertyStatus;
  internalNotes?: string | null;
};

export class RentalRepository {
  /*
   * -------------------------------------------------------------
   * RENTAL ENQUIRIES (Demands / Seekers)
   * -------------------------------------------------------------
   */
  createEnquiry(data: RentalEnquiryCreateData) {
    return prisma.rentalEnquiry.create({
      data: {
        name: data.name,
        phone: data.phone,
        configuration: data.configuration,
        location: data.location ?? null,
        areaLocality: data.areaLocality ?? null,
        budget: data.budget ?? null,
        furnishing: data.furnishing ?? null,
        moveInTimeframe: data.moveInTimeframe ?? null,
        whoIsFor: data.whoIsFor ?? null,
        notes: data.notes ?? null,
        status: data.status ?? "NEW",
        internalNotes: data.internalNotes ?? null,
        createdById: data.createdById ?? null,
      },
      select: rentalEnquirySelect,
    });
  }

  async findManyEnquiries(options?: RentalEnquiryFindManyOptions) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.search && options.search.trim() !== "") {
      const tokens = options.search.trim().split(/\s+/).filter(Boolean);
      if (tokens.length > 0) {
        where.AND = tokens.map((token) => ({
          OR: [
            { name: { contains: token, mode: "insensitive" } },
            { phone: { contains: token, mode: "insensitive" } },
            { configuration: { contains: token, mode: "insensitive" } },
            { location: { contains: token, mode: "insensitive" } },
            { areaLocality: { contains: token, mode: "insensitive" } },
            { budget: { contains: token, mode: "insensitive" } },
            { furnishing: { contains: token, mode: "insensitive" } },
            { moveInTimeframe: { contains: token, mode: "insensitive" } },
            { whoIsFor: { contains: token, mode: "insensitive" } },
            { notes: { contains: token, mode: "insensitive" } },
            { internalNotes: { contains: token, mode: "insensitive" } },
          ],
        }));
      }
    }

    const [total, enquiries] = await prisma.$transaction([
      prisma.rentalEnquiry.count({ where }),
      prisma.rentalEnquiry.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip,
        take: limit,
        select: rentalEnquirySelect,
      }),
    ]);

    return {
      enquiries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  findEnquiryById(id: string) {
    return prisma.rentalEnquiry.findUnique({
      where: { id },
      select: rentalEnquirySelect,
    });
  }

  updateEnquiry(id: string, data: RentalEnquiryUpdateData) {
    return prisma.rentalEnquiry.update({
      where: { id },
      data,
      select: rentalEnquirySelect,
    });
  }

  deleteEnquiry(id: string) {
    return prisma.rentalEnquiry.delete({
      where: { id },
      select: { id: true },
    });
  }

  /*
   * -------------------------------------------------------------
   * RENTAL PROPERTIES (Supplies / Landlords)
   * -------------------------------------------------------------
   */
  createProperty(data: RentalPropertyCreateData) {
    return prisma.rentalProperty.create({
      data: {
        ownerName: data.ownerName,
        phone: data.phone,
        flatType: data.flatType,
        approxSizeSqFt: data.approxSizeSqFt ?? null,
        location: data.location ?? null,
        areaLocality: data.areaLocality ?? null,
        societyDeveloper: data.societyDeveloper ?? null,
        additionalDetails: data.additionalDetails ?? null,
        status: data.status ?? "NEW",
        internalNotes: data.internalNotes ?? null,
      },
      select: rentalPropertySelect,
    });
  }

  async findManyProperties(options?: RentalPropertyFindManyOptions) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.search && options.search.trim() !== "") {
      const tokens = options.search.trim().split(/\s+/).filter(Boolean);
      if (tokens.length > 0) {
        where.AND = tokens.map((token) => {
          const num = Number.parseInt(token, 10);
          const isInt = !Number.isNaN(num) && String(num) === token;

          const orConditions: Record<string, unknown>[] = [
            { ownerName: { contains: token, mode: "insensitive" } },
            { phone: { contains: token, mode: "insensitive" } },
            { flatType: { contains: token, mode: "insensitive" } },
            { location: { contains: token, mode: "insensitive" } },
            { areaLocality: { contains: token, mode: "insensitive" } },
            { societyDeveloper: { contains: token, mode: "insensitive" } },
            { additionalDetails: { contains: token, mode: "insensitive" } },
            { internalNotes: { contains: token, mode: "insensitive" } },
          ];

          if (isInt) {
            orConditions.push({ approxSizeSqFt: { equals: num } });
          }

          return { OR: orConditions };
        });
      }
    }

    const [total, properties] = await prisma.$transaction([
      prisma.rentalProperty.count({ where }),
      prisma.rentalProperty.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip,
        take: limit,
        select: rentalPropertySelect,
      }),
    ]);

    return {
      properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  findPropertyById(id: string) {
    return prisma.rentalProperty.findUnique({
      where: { id },
      select: rentalPropertySelect,
    });
  }

  updateProperty(id: string, data: RentalPropertyUpdateData) {
    return prisma.rentalProperty.update({
      where: { id },
      data,
      select: rentalPropertySelect,
    });
  }

  deleteProperty(id: string) {
    return prisma.rentalProperty.delete({
      where: { id },
      select: { id: true },
    });
  }

  /*
   * -------------------------------------------------------------
   * RELEVANT AVAILABLE PROPERTIES FOR ENQUIRIES (Deterministic)
   * -------------------------------------------------------------
   */
  async findRelevantAvailableProperties(criteria: {
    configuration: string;
    location?: string | null;
    areaLocality?: string | null;
    limit?: number;
  }) {
    const limit = Math.min(20, Math.max(1, criteria.limit ?? 6));
    const config = (criteria.configuration || "").trim();
    const location = (criteria.location || "").trim();
    const area = (criteria.areaLocality || "").trim();

    // Extract locality terms (specific neighborhood/sector)
    const localityTerms = area
      .split(/[,\s/]+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2);

    // Extract city/region terms
    const cityTerms = location
      .split(/[,\s/]+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2);

    const allLocationTerms = [...localityTerms, ...cityTerms];

    const orClauses: Record<string, unknown>[] = [];

    if (config) {
      orClauses.push({ flatType: { contains: config, mode: "insensitive" } });
      const compactConfig = config.replace(/\s+/g, "");
      if (compactConfig !== config) {
        orClauses.push({ flatType: { contains: compactConfig, mode: "insensitive" } });
      }
    }

    for (const term of allLocationTerms) {
      orClauses.push(
        { location: { contains: term, mode: "insensitive" } },
        { areaLocality: { contains: term, mode: "insensitive" } },
        { societyDeveloper: { contains: term, mode: "insensitive" } },
      );
    }

    const where: Record<string, unknown> = {
      status: "AVAILABLE",
    };

    if (orClauses.length > 0) {
      where.OR = orClauses;
    }

    // Retrieve available candidate properties
    const candidates = await prisma.rentalProperty.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 50,
      select: rentalPropertySelect,
    });

    const targetConfig = config.toLowerCase();
    const compactTargetConfig = targetConfig.replace(/\s+/g, "");

    const ranked = candidates
      .map((prop) => {
        let priority = 0;
        const propFlat = (prop.flatType || "").toLowerCase();
        const compactPropFlat = propFlat.replace(/\s+/g, "");
        const propArea = `${prop.areaLocality || ""} ${prop.societyDeveloper || ""}`.toLowerCase();
        const propCity = `${prop.location || ""}`.toLowerCase();

        const matchesConfig =
          Boolean(targetConfig) &&
          (propFlat.includes(targetConfig) ||
            targetConfig.includes(propFlat) ||
            compactPropFlat.includes(compactTargetConfig) ||
            compactTargetConfig.includes(compactPropFlat));

        const matchesLocality =
          localityTerms.length > 0 &&
          localityTerms.some((term) => propArea.includes(term.toLowerCase()));

        const matchesCity =
          cityTerms.length > 0 &&
          cityTerms.some((term) => propCity.includes(term.toLowerCase()) || propArea.includes(term.toLowerCase()));

        if (localityTerms.length > 0) {
          if (matchesConfig && matchesLocality) {
            priority = 4; // Exact configuration + exact locality match
          } else if (matchesLocality) {
            priority = 3; // Locality match in same area
          } else if (matchesConfig && matchesCity) {
            priority = 2; // Config match in same city
          } else {
            priority = 0; // Exclude unrelated properties
          }
        } else {
          // No specific locality was requested, only city or general config
          if (matchesConfig && matchesCity) {
            priority = 3;
          } else if (matchesConfig) {
            priority = 2;
          } else if (matchesCity) {
            priority = 1;
          } else {
            priority = 0;
          }
        }

        return { prop, priority };
      })
      .filter((item) => item.priority > 0);

    ranked.sort((a, b) => b.priority - a.priority);

    return ranked.slice(0, limit).map((item) => item.prop);
  }
}

export const rentalRepository = new RentalRepository();

