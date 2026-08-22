import { scrapeDeveloperProjectPage } from "./scraper.js";

export async function analyzeImportUrl(url: string) {
  return { data: await scrapeDeveloperProjectPage(url) };
}
