import { addToGoogleSheet } from "./googlesheets.js";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// Enquiry route
app.post("/api/enquiry", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Save enquiry to Google Sheets
    await addToGoogleSheet({ name, email, phone, message });

    res.json({ success: true, msg: "Enquiry saved to Google Sheets!" });
  } catch (err) {
    console.error("❌ Error saving to Google Sheets:", err);
    res.status(500).json({ success: false, msg: "Failed to save enquiry" });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
