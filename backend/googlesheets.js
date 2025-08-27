import { google } from "googleapis";
import fs from "fs";

// Load credentials
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json", // path to your service account key
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export const addToGoogleSheet = async (data) => {
  const spreadsheetId = "170XIQcL6Fxat2J71ZVpce2C9qlvp2YoRyH-TdDHb1vQ"; // replace with your actual sheet ID
  const range = "Enquiries!A:D"; // adjust if your sheet/tab name is different

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: {
      values: [[data.name, data.email, data.phone, data.message]],
    },
  });
  const meta = await sheets.spreadsheets.get({
  spreadsheetId: "170XIQcL6Fxat2J71ZVpce2C9qlvp2YoRyH-TdDHb1vQ",
});
console.log(meta.data.sheets.map(s => s.properties.title));
};
