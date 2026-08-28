/*
 * PURPOSE:
 * Public search route definitions.
 *
 * FLOW:
 * Public Search Routing Flow
 *
 * RESPONSIBILITY:
 * Mounts public endpoints for property search:
 * - GET /catalog: Retrieves published project and configuration catalog for guided search.
 * - GET /: Validates query parameter and executes natural language property text search.
 */

import { Router } from "express";
import { searchController } from "../../controllers/public/search.controller.js";
import { validateSearchQuery } from "../../validators/search.validator.js";
import { searchCatalogController } from "../../controllers/public/search-catalog.controller.js";

const router = Router();

router.get("/catalog", searchCatalogController);
router.get("/", validateSearchQuery, searchController);

export default router;
