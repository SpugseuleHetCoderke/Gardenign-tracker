import "server-only";

import { Resend } from "resend";
import type { DueTask } from "@/lib/care-shared";
import { ACTIVITY_LABELS, dueLabel } from "@/lib/care-shared";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Builds the daily reminder email: one row per overdue/due-today task, grouped by plant. */
export function renderReminderEmail(tasks: DueTask[]): {
  subject: string;
  html: string;
  text: string;
} {
  const byPlant = new Map<string, DueTask[]>();
  for (const t of tasks) {
    byPlant.set(t.plantId, [...(byPlant.get(t.plantId) ?? []), t]);
  }

  const appUrl = process.env.APP_URL ?? "";
  const overdueCount = tasks.filter((t) => t.daysOverdue > 0).length;

  const subject =
    tasks.length === 0
      ? "Tuin: niets te doen vandaag"
      : overdueCount > 0
        ? `Tuin: ${tasks.length} taken, ${overdueCount} te laat`
        : `Tuin: ${tasks.length} ${tasks.length === 1 ? "taak" : "taken"} vandaag`;

  const rows = [...byPlant.entries()]
    .map(([, plantTasks]) => {
      const { plantLabel, location, emoji } = plantTasks[0];
      const items = plantTasks
        .map((t) => {
          const label = escapeHtml(ACTIVITY_LABELS[t.activityType]);
          const status = escapeHtml(dueLabel(t));
          const color = t.daysOverdue > 0 ? "#b3421c" : "#3f7d3a";
          return `
            <tr>
              <td style="padding:4px 0;font-size:14px;">
                <strong>${label}</strong>
                <span style="color:${color};"> · ${status}</span>
                <div style="color:#5f6b5a;font-size:13px;margin-top:2px;">${escapeHtml(t.instructions)}</div>
              </td>
            </tr>`;
        })
        .join("");

      return `
        <table role="presentation" width="100%" style="margin-bottom:16px;border:1px solid #e3e6dc;border-radius:12px;padding:12px;">
          <tr>
            <td style="font-size:16px;font-weight:600;padding-bottom:6px;">
              ${emoji} ${escapeHtml(plantLabel)}${location ? ` <span style="color:#5f6b5a;font-weight:400;">· ${escapeHtml(location)}</span>` : ""}
            </td>
          </tr>
          ${items}
        </table>`;
    })
    .join("");

  const body =
    tasks.length === 0
      ? `<p style="font-size:15px;">Niets te doen vandaag in de tuin. 🌿</p>`
      : rows;

  const html = `
    <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;color:#1b2419;">
      <h1 style="font-size:20px;margin:0 0 16px;">🌻 Tuin — vandaag</h1>
      ${body}
      ${
        appUrl
          ? `<p style="margin-top:20px;"><a href="${escapeHtml(appUrl)}" style="color:#3f7d3a;">Open de app →</a></p>`
          : ""
      }
    </div>`;

  const text =
    tasks.length === 0
      ? "Niets te doen vandaag in de tuin."
      : [...byPlant.values()]
          .map((plantTasks) => {
            const { plantLabel } = plantTasks[0];
            const lines = plantTasks
              .map(
                (t) =>
                  `  - ${ACTIVITY_LABELS[t.activityType]} (${dueLabel(t)}): ${t.instructions}`,
              )
              .join("\n");
            return `${plantLabel}\n${lines}`;
          })
          .join("\n\n");

  return { subject, html, text };
}

/** Sends the reminder email. Throws if RESEND_API_KEY / REMINDER_TO / REMINDER_FROM are missing. */
export async function sendReminderEmail(tasks: DueTask[]) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.REMINDER_TO;
  const from = process.env.REMINDER_FROM;

  if (!apiKey || !to || !from) {
    throw new Error(
      "RESEND_API_KEY, REMINDER_TO and REMINDER_FROM must all be set to send reminders.",
    );
  }

  const resend = new Resend(apiKey);
  const { subject, html, text } = renderReminderEmail(tasks);

  const result = await resend.emails.send({ from, to, subject, html, text });
  if (result.error) {
    throw new Error(`Resend weigerde de mail: ${result.error.message}`);
  }
  return result;
}
