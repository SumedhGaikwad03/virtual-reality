import { Router } from "express";
import { getSiteController } from "../../controllers/public/site.controller.js";

const router = Router();
router.get("/", getSiteController);

export default router;
