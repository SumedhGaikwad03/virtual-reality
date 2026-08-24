import { Router } from "express";
import { searchController } from "../../controllers/public/search.controller.js";
import { validateSearchQuery } from "../../validators/search.validator.js";
import { searchCatalogController } from "../../controllers/public/search-catalog.controller.js";
const router = Router();


router.get("/catalog", searchCatalogController);
router.get("/", validateSearchQuery, searchController);

export default router;
