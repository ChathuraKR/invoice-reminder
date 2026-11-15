import * as cron from "node-cron";
import { runReminders } from "./reminder";

const g = globalThis as unknown as { schedulerStarted?: boolean };

const SEND_HOUR = 11; // 11:00 local time

export function startScheduler() {
  if (g.schedulerStarted) return;
  g.schedulerStarted = true;

  const run = () =>
    runReminders().catch((e) => console.error("reminder run failed", e));

  // every day at 11:00 (your PC's local time)
  cron.schedule(`0 ${SEND_HOUR} * * *`, run);

  // catch-up after startup: only after 11:00, so a restart at 08:00
  // doesn't send the email early
  setTimeout(() => {
    if (new Date().getHours() >= SEND_HOUR) run();
  }, 10_000);

  console.log(`[scheduler] started (daily at ${SEND_HOUR}:00)`);
}