/* eslint-disable @typescript-eslint/no-explicit-any */
import { registerTaskReminderJobs } from "@/function/cron/taskReminder";

// src/lib/cron/init.ts
let initialized = false;

export function initCronJobs() {
  // process-level guard
  if (initialized) return;
  initialized = true;

  // global guard (helps in dev/HMR scenarios)
  const g = globalThis as any;
  if (g.__coachino_cron_initialized) return;
  g.__coachino_cron_initialized = true;

  registerTaskReminderJobs();

  console.log("Cron jobs initialized");
}
