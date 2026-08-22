import { Router } from "express";
import { getPublicDeveloperController } from "../../controllers/public/developer.controller.js";
import { validateDeveloperParams } from "../../validators/developer.validator.js";

const router = Router();

router.get(
  "/:developerSlug",
  validateDeveloperParams,
  getPublicDeveloperController,
);

export default router;
