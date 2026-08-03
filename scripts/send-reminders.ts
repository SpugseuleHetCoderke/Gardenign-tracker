/**
 * Sends today's reminders right now, from your own machine — push to any
 * registered device, plus email if that's configured. Useful to test before
 * relying on the deployed cron job:
 *
 *   npm run reminders:send
 */
import "dotenv/config";
import { getTasksDueNow } from "../src/lib/care";
import { sendPushToAll } from "../src/lib/push";
import { sendReminderEmail } from "../src/lib/email";
import { prisma } from "../src/lib/prisma";

async function main() {
  const tasks = await getTasksDueNow();
  console.log(`${tasks.length} taak/taken vandaag due.`);

  if (tasks.length === 0) {
    console.log("Niets te doen — er wordt niets verstuurd.");
    return;
  }

  const push = await sendPushToAll(tasks);
  console.log(`Push: ${push.sent} verstuurd, ${push.pruned} verlopen abonnement(en) opgeruimd.`);

  if (process.env.RESEND_API_KEY && process.env.REMINDER_TO) {
    await sendReminderEmail(tasks);
    console.log(`Mail verstuurd naar ${process.env.REMINDER_TO}.`);
  } else {
    console.log("Mail overgeslagen (RESEND_API_KEY of REMINDER_TO niet ingesteld).");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
