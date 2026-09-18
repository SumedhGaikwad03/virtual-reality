/*
 * PURPOSE:
 * Public rental submission route definitions and rate-limiting middleware mounting.
 *
 * FLOW:
 * Public Rental Submissions Flow
 *
 * RESPONSIBILITY:
 * Mounts rate-limited POST /api/rentals/enquiries and POST /api/rentals/properties endpoints
 * with input validation and controller handlers.
 */

import express, { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createRentalEnquiryController,
  createRentalPropertyController,
} from "../../controllers/public/rental.controller.js";
import {
  validatePublicRentalEnquiry,
  validatePublicRentalProperty,
} from "../../validators/rental.validator.js";

const rentalSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: {
      code: "RENTAL_RATE_LIMITED",
      message: "Too many rental submissions. Please try again later.",
    },
  },
});

const router = Router();
router.use(express.json());

router.post(
  "/enquiries",
  rentalSubmissionLimiter,
  validatePublicRentalEnquiry,
  createRentalEnquiryController,
);

router.post(
  "/properties",
  rentalSubmissionLimiter,
  validatePublicRentalProperty,
  createRentalPropertyController,
);

export default router;
