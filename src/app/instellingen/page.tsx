import EmailSettingsForm from "@/components/EmailSettingsForm";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  const emailConfigured = Boolean(process.env.RESEND_API_KEY);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Instellingen</h1>
      </header>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Meldingen per e-mail
        </h2>

        {!emailConfigured ? (
          <p className="rounded-xl border border-border-soft bg-surface p-3 text-sm text-muted">
            E-mail is nog niet ingesteld voor deze app (er ontbreekt een
            serverconfiguratie). Push-meldingen op het toestel blijven wel
            gewoon werken.
          </p>
        ) : (
          <EmailSettingsForm
            emailRemindersOn={settings.emailRemindersOn}
            emailAddress={settings.emailAddress ?? ""}
          />
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Meldingen op dit toestel
        </h2>
        <p className="rounded-xl border border-border-soft bg-surface p-3 text-sm text-muted">
          Push-meldingen zet je aan of uit via de melding bovenaan de
          &quot;Vandaag&quot;-pagina — dat staat per toestel, niet hier.
        </p>
      </section>
    </>
  );
}
