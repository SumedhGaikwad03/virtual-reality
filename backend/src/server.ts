import { validateEnvironment } from "./lib/env.js";

// Validate required environment variables before binding to the network port
validateEnvironment();

import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const port = Number(process.env.PORT ?? 10000);

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

let isShuttingDown = false;

async function handleShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections and finish active in-flight requests
  server.close(async (err) => {
    if (err) {
      console.error("[SHUTDOWN] Error closing HTTP server:", err);
    } else {
      console.log("[SHUTDOWN] HTTP server closed cleanly.");
    }

    try {
      await prisma.$disconnect();
      console.log("[SHUTDOWN] Prisma database client disconnected.");
    } catch (dbErr) {
      console.error("[SHUTDOWN] Error disconnecting Prisma:", dbErr);
    }

    process.exit(err ? 1 : 0);
  });

  // Force exit after timeout if connections remain hanging
  setTimeout(() => {
    console.error("[SHUTDOWN] Forced shutdown after timeout (10s).");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => void handleShutdown("SIGTERM"));
process.on("SIGINT", () => void handleShutdown("SIGINT"));
