import "server-only";

import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import type { DueTask } from "@/lib/care-shared";
import { ACTIVITY_LABELS } from "@/lib/care-shared";

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT must all be set to send push notifications.",
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

function buildNotification(tasks: DueTask[]) {
  const overdueCount = tasks.filter((t) => t.daysOverdue > 0).length;

  const title =
    tasks.length === 1
      ? `🌱 ${ACTIVITY_LABELS[tasks[0].activityType]} — ${tasks[0].plantLabel}`
      : `🌱 ${tasks.length} taken in de tuin`;

  const body =
    tasks.length === 1
      ? tasks[0].instructions
      : overdueCount > 0
        ? `${overdueCount} te laat. Tik voor het overzicht.`
        : "Tik voor het overzicht van vandaag.";

  return {
    title,
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    url: "/",
  };
}

/**
 * Pushes to every registered device. Subscriptions the browser has revoked
 * (410 Gone / 404 Not Found) are pruned as they're discovered, so a phone
 * that uninstalled the app doesn't cause silent failures forever.
 */
export async function sendPushToAll(tasks: DueTask[]) {
  if (tasks.length === 0) return { sent: 0, pruned: 0 };

  configureWebPush();

  const subscriptions = await prisma.pushSubscription.findMany();
  if (subscriptions.length === 0) return { sent: 0, pruned: 0 };

  const payload = JSON.stringify(buildNotification(tasks));

  let sent = 0;
  const staleIds: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          staleIds.push(sub.id);
        } else {
          console.error(`Push naar ${sub.id} mislukt:`, err);
        }
      }
    }),
  );

  if (staleIds.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: staleIds } } });
  }

  return { sent, pruned: staleIds.length };
}
