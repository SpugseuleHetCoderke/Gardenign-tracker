/**
 * Sends today's reminders right now, from your own machine — push to any
 * registered device, plus email if that's turned on under /instellingen.
 * Useful to test before relying on the deployed cron job:
 *
 *   npm run reminders:send
 *
 * Must run with `tsx --conditions=react-server` (already set in
 * package.json): care.ts/email.ts/push.ts/prisma.ts all import "server-only"
 * to stop client components from accidentally pulling in the database
 * driver. Next.js resolves that package correctly via its own "react-server"
 * export condition; plain tsx doesn't set one by default and the package
 * throws — the flag tells it to use the same condition Next.js does.
 */
import "dotenv/config";
import { getTasksDueNow } from "../src/lib/care";
import { sendPushToAll } from "../src/lib/push";
import { sendReminderEmail } from "../src/lib/email";
import { getSettings } from "../src/lib/settings";
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

  const settings = await getSettings();
  if (settings.emailRemindersOn && settings.emailAddress && process.env.RESEND_API_KEY) {
    await sendReminderEmail(tasks, settings.emailAddress);
    console.log(`Mail verstuurd naar ${settings.emailAddress}.`);
  } else {
    console.log("Mail overgeslagen (uitgeschakeld onder Instellingen, of RESEND_API_KEY ontbreekt).");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
