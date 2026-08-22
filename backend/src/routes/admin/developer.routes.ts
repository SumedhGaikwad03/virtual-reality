import express, { Router } from "express";
import {
  createDeveloperController,
  getDeveloperController,
  listDevelopersController,
  updateDeveloperController,
} from "../../controllers/admin/developer.controller.js";
import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";
import {
  validateAdminCreateDeveloper,
  validateAdminDeveloperId,
  validateAdminUpdateDeveloper,
} from "../../validators/developer.validator.js";

const router = Router();

router.use(requireAdminAuthentication);
router.use(express.json());

router.post("/", validateAdminCreateDeveloper, createDeveloperController);
router.get("/", listDevelopersController);
router.get("/:id", validateAdminDeveloperId, getDeveloperController);
router.patch(
  "/:id",
  validateAdminDeveloperId,
  validateAdminUpdateDeveloper,
  updateDeveloperController,
);

export default router;
