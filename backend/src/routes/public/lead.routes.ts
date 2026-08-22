import express, { Router } from "express";
import rateLimit from "express-rate-limit";
import { createLeadController } from "../../controllers/public/lead.controller.js";
import { validatePublicLead } from "../../validators/lead.validator.js";

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: {
      code: "LEAD_RATE_LIMITED",
      message: "Too many lead submissions. Please try again later.",
    },
  },
});

const router = Router();
router.use(express.json());
router.post("/", submissionLimiter, validatePublicLead, createLeadController);

export default router;
