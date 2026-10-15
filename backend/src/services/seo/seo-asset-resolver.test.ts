import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidAssetPath,
  extractAssetsFromHtml,
  scanFilesystemAssets,
  resolveProductionAssets,
  resetAssetCacheForTesting,
  setDisableFilesystemScanForTesting,
} from "./seo-renderer.service.js";

// Ensure DATABASE_URL is defined so prisma module initialization doesn't throw during tests
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";

test("isValidAssetPath correctly validates and rejects asset paths", () => {
  // Valid hashed paths
  assert.equal(isValidAssetPath("/assets/index-CjEbs4Oj.js", ".js"), true);
  assert.equal(isValidAssetPath("/assets/index-DExHupIu.css", ".css"), true);
  assert.equal(isValidAssetPath("https://cdn.example.com/assets/app-987.js", ".js"), true);

  // Strictly reject obsolete unhashed fallback paths
  assert.equal(isValidAssetPath("/assets/index.js", ".js"), false);
  assert.equal(isValidAssetPath("/assets/index.css", ".css"), false);

  // Reject extension mismatches
  assert.equal(isValidAssetPath("/assets/index-DExHupIu.css", ".js"), false);
  assert.equal(isValidAssetPath("/assets/index-CjEbs4Oj.js", ".css"), false);

  // Reject malformed or injected paths
  assert.equal(isValidAssetPath("/assets/<script>", ".js"), false);
  assert.equal(isValidAssetPath("/assets/test .js", ".js"), false);
  assert.equal(isValidAssetPath("", ".js"), false);
});

test("extractAssetsFromHtml parses valid Vite entrypoints and rejects unhashed assets", () => {
  const validHtml = `
    <!doctype html>
    <html>
      <head>
        <link rel="stylesheet" crossorigin href="/assets/index-DExHupIu.css">
        <script type="module" crossorigin src="/assets/index-CjEbs4Oj.js"></script>
      </head>
      <body><div id="root"></div></body>
    </html>
  `;

  const extracted = extractAssetsFromHtml(validHtml);
  assert.ok(extracted);
  assert.equal(extracted.scriptSrc, "/assets/index-CjEbs4Oj.js");
  assert.equal(extracted.styleHref, "/assets/index-DExHupIu.css");

  // Rejects HTML containing unhashed legacy placeholder paths
  const invalidHtml = `
    <!doctype html>
    <html>
      <head>
        <link rel="stylesheet" crossorigin href="/assets/index.css">
        <script type="module" crossorigin src="/assets/index.js"></script>
      </head>
    </html>
  `;
  assert.equal(extractAssetsFromHtml(invalidHtml), null);

  // Rejects HTML missing one of the asset types
  const partialHtml = `
    <!doctype html>
    <html>
      <head>
        <script type="module" crossorigin src="/assets/index-CjEbs4Oj.js"></script>
      </head>
    </html>
  `;
  assert.equal(extractAssetsFromHtml(partialHtml), null);
});

test("scanFilesystemAssets detects local build output if present", () => {
  resetAssetCacheForTesting();
  const local = scanFilesystemAssets();
  // If local frontend/dist is built, it should extract valid hashed assets
  if (local) {
    assert.ok(local.scriptSrc.startsWith("/assets/"));
    assert.ok(local.scriptSrc.endsWith(".js"));
    assert.ok(local.styleHref.startsWith("/assets/"));
    assert.ok(local.styleHref.endsWith(".css"));
    assert.notEqual(local.scriptSrc, "/assets/index.js");
    assert.notEqual(local.styleHref, "/assets/index.css");
  }
});

test("resolveProductionAssets respects valid environment variable overrides", async () => {
  resetAssetCacheForTesting();

  const originalScript = process.env.VITE_ASSET_SCRIPT;
  const originalStyle = process.env.VITE_ASSET_STYLE;

  try {
    process.env.VITE_ASSET_SCRIPT = "/assets/override-123.js";
    process.env.VITE_ASSET_STYLE = "/assets/override-456.css";

    const assets = await resolveProductionAssets();
    assert.ok(assets);
    assert.equal(assets.scriptSrc, "/assets/override-123.js");
    assert.equal(assets.styleHref, "/assets/override-456.css");
  } finally {
    process.env.VITE_ASSET_SCRIPT = originalScript;
    process.env.VITE_ASSET_STYLE = originalStyle;
    resetAssetCacheForTesting();
  }
});

test("resolveProductionAssets performs upstream discovery, caches in-memory, and deduplicates concurrent calls", async () => {
  resetAssetCacheForTesting();
  setDisableFilesystemScanForTesting(true);

  const originalScript = process.env.VITE_ASSET_SCRIPT;
  const originalStyle = process.env.VITE_ASSET_STYLE;
  delete process.env.VITE_ASSET_SCRIPT;
  delete process.env.VITE_ASSET_STYLE;

  const originalFetch = globalThis.fetch;
  let fetchCallCount = 0;

  try {
    globalThis.fetch = (async (url: string | URL | Request) => {
      fetchCallCount++;
      // Simulate 50ms network delay to test concurrency single-flight
      await new Promise((r) => setTimeout(r, 50));
      return {
        ok: true,
        status: 200,
        text: async () => `
          <!doctype html>
          <html>
            <head>
              <link rel="stylesheet" crossorigin href="/assets/index-live-style.css">
              <script type="module" crossorigin src="/assets/index-live-script.js"></script>
            </head>
          </html>
        `,
      } as unknown as Response;
    }) as typeof fetch;

    // Trigger two simultaneous concurrent calls (single-flight deduplication)
    const [assetsA, assetsB] = await Promise.all([
      resolveProductionAssets(),
      resolveProductionAssets(),
    ]);

    assert.ok(assetsA);
    assert.ok(assetsB);
    assert.equal(assetsA.scriptSrc, "/assets/index-live-script.js");
    assert.equal(assetsA.styleHref, "/assets/index-live-style.css");
    assert.equal(assetsB.scriptSrc, "/assets/index-live-script.js");
    assert.equal(assetsB.styleHref, "/assets/index-live-style.css");

    // Concurrency test: Both calls must have shared exactly 1 network fetch
    assert.equal(fetchCallCount, 1);

    // Subsequent call within TTL must return cached without network fetch
    const assetsCached = await resolveProductionAssets();
    assert.ok(assetsCached);
    assert.equal(assetsCached.scriptSrc, "/assets/index-live-script.js");
    assert.equal(fetchCallCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalScript) process.env.VITE_ASSET_SCRIPT = originalScript;
    if (originalStyle) process.env.VITE_ASSET_STYLE = originalStyle;
    resetAssetCacheForTesting();
  }
});

test("resolveProductionAssets falls back to stale cache on network failure and fails deliberately when no assets exist", async () => {
  resetAssetCacheForTesting();
  setDisableFilesystemScanForTesting(true);

  const originalScript = process.env.VITE_ASSET_SCRIPT;
  const originalStyle = process.env.VITE_ASSET_STYLE;
  delete process.env.VITE_ASSET_SCRIPT;
  delete process.env.VITE_ASSET_STYLE;

  const originalFetch = globalThis.fetch;

  try {
    // 1. When network fails initially and no cache exists: returns null (deliberate failure, no unhashed fallback)
    globalThis.fetch = (async () => {
      return {
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      } as unknown as Response;
    }) as typeof fetch;

    const initialFailed = await resolveProductionAssets();
    assert.equal(initialFailed, null);

    // 2. When network succeeds once
    globalThis.fetch = (async () => {
      return {
        ok: true,
        status: 200,
        text: async () => `
          <html>
            <head>
              <link rel="stylesheet" crossorigin href="/assets/index-first.css">
              <script type="module" crossorigin src="/assets/index-first.js"></script>
            </head>
          </html>
        `,
      } as unknown as Response;
    }) as typeof fetch;

    const initialSuccess = await resolveProductionAssets();
    assert.ok(initialSuccess);
    assert.equal(initialSuccess.scriptSrc, "/assets/index-first.js");

    // 3. Now simulate network error on next fetch: stale-on-error reuses cached
    globalThis.fetch = (async () => {
      throw new Error("Network timeout");
    }) as typeof fetch;

    const staleReused = await resolveProductionAssets();
    assert.ok(staleReused);
    assert.equal(staleReused.scriptSrc, "/assets/index-first.js");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalScript) process.env.VITE_ASSET_SCRIPT = originalScript;
    if (originalStyle) process.env.VITE_ASSET_STYLE = originalStyle;
    resetAssetCacheForTesting();
  }
});

test("fetchUpstreamAssets explicitly queries /index.html and handles target URL correctly", async () => {
  resetAssetCacheForTesting();
  setDisableFilesystemScanForTesting(true);

  const originalFetch = globalThis.fetch;
  let fetchedUrl = "";

  try {
    globalThis.fetch = (async (url: string | URL | Request) => {
      fetchedUrl = String(url);
      return {
        ok: true,
        status: 200,
        text: async () => `
          <html>
            <head>
              <link rel="stylesheet" crossorigin href="/assets/index-target.css">
              <script type="module" crossorigin src="/assets/index-target.js"></script>
            </head>
          </html>
        `,
      } as unknown as Response;
    }) as typeof fetch;

    const assets = await resolveProductionAssets();
    assert.ok(assets);
    assert.ok(fetchedUrl.endsWith("/index.html"), `Expected ${fetchedUrl} to end with /index.html`);
  } finally {
    globalThis.fetch = originalFetch;
    resetAssetCacheForTesting();
  }
});

test("generate404Html integrates with resolveProductionAssets end-to-end", async () => {
  resetAssetCacheForTesting();
  setDisableFilesystemScanForTesting(true);

  const originalScript = process.env.PRODUCTION_ASSET_SCRIPT;
  const originalStyle = process.env.PRODUCTION_ASSET_STYLE;

  try {
    // 1. With valid production assets
    process.env.PRODUCTION_ASSET_SCRIPT = "/assets/index-e2e123.js";
    process.env.PRODUCTION_ASSET_STYLE = "/assets/index-e2e123.css";

    const { generate404Html } = await import("./seo-renderer.service.js");
    const htmlWithAssets = await generate404Html("Test message");

    assert.ok(htmlWithAssets.includes('<script type="module" crossorigin src="/assets/index-e2e123.js"></script>'));
    assert.ok(htmlWithAssets.includes('<link rel="stylesheet" crossorigin href="/assets/index-e2e123.css">'));
    assert.equal(htmlWithAssets.includes("/assets/index.js"), false);
    assert.equal(htmlWithAssets.includes("/assets/index.css"), false);

    // 2. When asset resolution fails deliberately: emits NO broken unhashed tags
    delete process.env.PRODUCTION_ASSET_SCRIPT;
    delete process.env.PRODUCTION_ASSET_STYLE;
    resetAssetCacheForTesting();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => ({ ok: false, status: 500 } as unknown as Response)) as typeof fetch;

    try {
      const htmlWithoutAssets = await generate404Html("Test message");
      assert.equal(htmlWithoutAssets.includes("/assets/index.js"), false);
      assert.equal(htmlWithoutAssets.includes("/assets/index.css"), false);
      assert.ok(htmlWithoutAssets.includes("<title>"));
      assert.ok(htmlWithoutAssets.includes("</head>"));
    } finally {
      globalThis.fetch = originalFetch;
    }
  } finally {
    if (originalScript) process.env.PRODUCTION_ASSET_SCRIPT = originalScript;
    if (originalStyle) process.env.PRODUCTION_ASSET_STYLE = originalStyle;
    resetAssetCacheForTesting();
  }
});
