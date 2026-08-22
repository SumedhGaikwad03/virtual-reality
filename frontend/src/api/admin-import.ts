import { adminRequest } from "./admin-client";
import type { ImportAnalyzeResponse } from "../types/admin-import";

export function analyzeImport(url: string) {
  return adminRequest<ImportAnalyzeResponse>("/admin/import/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}
