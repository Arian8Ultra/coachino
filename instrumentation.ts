import { initCronJobs } from "./lib/cron/init";

// src/instrumentation.ts
export async function register() {
  // Only run on Node.js runtime
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") return;

  initCronJobs();
}
