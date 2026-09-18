/*
 * PURPOSE:
 * Admin rental management route definitions and authentication middleware mounting.
 *
 * FLOW:
 * Admin Rental Management Flow
 *
 * RESPONSIBILITY:
 * Mounts authenticated endpoints for managing RentalEnquiry and RentalProperty records:
 * - GET    /api/admin/rentals/enquiries
 * - GET    /api/admin/rentals/enquiries/:id
 * - PATCH  /api/admin/rentals/enquiries/:id
 * - DELETE /api/admin/rentals/enquiries/:id
 * - GET    /api/admin/rentals/properties
 * - GET    /api/admin/rentals/properties/:id
 * - PATCH  /api/admin/rentals/properties/:id
 * - DELETE /api/admin/rentals/properties/:id
 */

import express, { Router } from "express";
import {
  createAdminRentalEnquiryController,
  createAdminRentalPropertyController,
  deleteRentalEnquiryController,
  deleteRentalPropertyController,
  getRelevantAvailablePropertiesController,
  getRentalEnquiryController,
  getRentalPropertyController,
  listRentalEnquiriesController,
  listRentalPropertiesController,
  updateRentalEnquiryController,
  updateRentalPropertyController,
} from "../../controllers/admin/rental.controller.js";
import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";
import {
  validateAdminRentalEnquiryCreate,
  validateAdminRentalEnquiryUpdate,
  validateAdminRentalPropertyCreate,
  validateAdminRentalPropertyUpdate,
  validateListRentalEnquiriesQuery,
  validateListRentalPropertiesQuery,
  validateRentalId,
} from "../../validators/rental.validator.js";

const router = Router();

router.use(requireAdminAuthentication);
router.use(express.json());

/*
 * -------------------------------------------------------------
 * RENTAL ENQUIRIES (Demand / Seekers)
 * -------------------------------------------------------------
 */
router.post(
  "/enquiries",
  validateAdminRentalEnquiryCreate,
  createAdminRentalEnquiryController,
);

router.get(
  "/enquiries",
  validateListRentalEnquiriesQuery,
  listRentalEnquiriesController,
);

router.get(
  "/enquiries/:id/available-properties",
  validateRentalId,
  getRelevantAvailablePropertiesController,
);

router.get(
  "/enquiries/:id",
  validateRentalId,
  getRentalEnquiryController,
);

router.patch(
  "/enquiries/:id",
  validateRentalId,
  validateAdminRentalEnquiryUpdate,
  updateRentalEnquiryController,
);

router.delete(
  "/enquiries/:id",
  validateRentalId,
  deleteRentalEnquiryController,
);

/*
 * -------------------------------------------------------------
 * RENTAL PROPERTIES (Supply / Landlords)
 * -------------------------------------------------------------
 */
router.post(
  "/properties",
  validateAdminRentalPropertyCreate,
  createAdminRentalPropertyController,
);

router.get(
  "/properties",
  validateListRentalPropertiesQuery,
  listRentalPropertiesController,
);

router.get(
  "/properties/:id",
  validateRentalId,
  getRentalPropertyController,
);

router.patch(
  "/properties/:id",
  validateRentalId,
  validateAdminRentalPropertyUpdate,
  updateRentalPropertyController,
);

router.delete(
  "/properties/:id",
  validateRentalId,
  deleteRentalPropertyController,
);

export default router;
