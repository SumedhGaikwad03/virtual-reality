import assert from "node:assert/strict";
import test from "node:test";
import { normalizePriceToPaise } from "./price-normalizer.js";

test("normalizes Indian crore and lakh values to paise", () => {
  assert.equal(normalizePriceToPaise("₹1 Cr"), "1000000000");
  assert.equal(normalizePriceToPaise("₹1.25 Cr"), "1250000000");
  assert.equal(normalizePriceToPaise("₹2.5 Cr"), "2500000000");
  assert.equal(normalizePriceToPaise("₹50 Lakh"), "500000000");
  assert.equal(normalizePriceToPaise("₹75 Lac"), "750000000");
  assert.equal(normalizePriceToPaise("₹1,25,00,000"), "1250000000");
});

test("rejects ambiguous or invalid prices", () => {
  assert.equal(normalizePriceToPaise("Contact us"), null);
  assert.equal(normalizePriceToPaise("₹1.2.5 Cr"), null);
  assert.equal(normalizePriceToPaise("₹1 Cr negotiable"), null);
});
