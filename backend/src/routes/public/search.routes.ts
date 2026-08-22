import { Router } from "express";
import { searchController } from "../../controllers/public/search.controller.js";
import { validateSearchQuery } from "../../validators/search.validator.js";

const router = Router();
router.get("/", validateSearchQuery, searchController);

export default router;
