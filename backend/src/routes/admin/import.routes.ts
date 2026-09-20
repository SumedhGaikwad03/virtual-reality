import express, { Router } from "express";
import { analyzeImportController } from "../../controllers/admin/import.controller.js";
import { requireFounderAuthentication } from "../../middleware/auth.middleware.js";
import { validateAnalyzeImport } from "../../validators/import.validator.js";

const router = Router();
router.use(requireFounderAuthentication);
router.use(express.json({ limit: "10kb" }));
router.post("/analyze", validateAnalyzeImport, analyzeImportController);

export default router;
