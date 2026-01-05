/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/cron/ensureJob.ts
import { cron } from "@/lib/cron";

type AnyJob = any;

export function ensureScheduleJob(
  name: string,
  rule: any,
  handler: () => Promise<void> | void,
): AnyJob {
  const scheduledJobs = (cron as any).scheduledJobs as
    | Record<string, AnyJob>
    | undefined;

  const existing = scheduledJobs?.[name];
  if (existing) return existing;

  return cron.scheduleJob(name, rule, handler);
}
