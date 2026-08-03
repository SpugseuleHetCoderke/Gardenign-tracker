import { NextRequest, NextResponse } from "next/server";
import { getTasksDueNow } from "@/lib/care";
import { sendPushToAll } from "@/lib/push";
import { sendReminderEmail } from "@/lib/email";

/**
 * Triggered daily by Vercel Cron (see vercel.json) or by a manual request.
 * Vercel signs its own cron requests with this same secret automatically, so
 * this also blocks anyone else from spamming your reminders.
 *
 * Push is the primary channel (set up on her phone); email only fires when
 * RESEND_API_KEY/REMINDER_TO/REMINDER_FROM are configured, so it's an
 * optional backup rather than a second thing to maintain.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await getTasksDueNow();
  if (tasks.length === 0) {
    return NextResponse.json({ taskCount: 0, push: null, email: null });
  }

  const push = await sendPushToAll(tasks).catch((err) => {
    console.error("Push versturen mislukt:", err);
    return null;
  });

  let email: { sent: boolean } | null = null;
  if (process.env.RESEND_API_KEY && process.env.REMINDER_TO) {
    email = await sendReminderEmail(tasks)
      .then(() => ({ sent: true }))
      .catch((err) => {
        console.error("Mail versturen mislukt:", err);
        return { sent: false };
      });
  }

  return NextResponse.json({ taskCount: tasks.length, push, email });
}
