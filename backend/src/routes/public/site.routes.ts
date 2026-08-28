/*
 * PURPOSE:
 * Registers public site HTTP routes.
 *
 * FLOW:
 * Homepage Content Flow
 *
 * RESPONSIBILITY:
 * Mounts GET / endpoint and routes incoming requests to getSiteController.
 */

import { Router } from "express";
import { getSiteController } from "../../controllers/public/site.controller.js";

const router = Router();
router.get("/", getSiteController);

export default router;
