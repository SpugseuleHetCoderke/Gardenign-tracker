import Link from "next/link";
import { ACTIVITY_LABELS } from "@/lib/care-shared";
import { longDateFmt } from "@/lib/format";
import { Callout, CalloutList, Phone, Pin } from "./mockup";

// Shows today's weekday/date in the Vandaag mockup, so the example never looks stale.
export const dynamic = "force-dynamic";

const SECTIONS = [
  { href: "#vandaag", icon: "☀️", label: "Vandaag" },
  { href: "#noteren", icon: "✅", label: "Noteren" },
  { href: "#planten", icon: "🪴", label: "Mijn planten" },
  { href: "#plant", icon: "🍅", label: "Eén plant" },
  { href: "#naslag", icon: "📖", label: "Naslag" },
  { href: "#toevoegen", icon: "➕", label: "Soort toevoegen" },
  { href: "#soort", icon: "📄", label: "Soort-pagina" },
  { href: "#instellingen", icon: "⚙️", label: "Instellingen" },
];

function Card({
  children,
  tone = "normal",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "normal" | "overdue" | "dim";
  className?: string;
}) {
  const toneClass =
    tone === "overdue"
      ? "border-overdue/40 bg-overdue-soft"
      : tone === "dim"
        ? "border-border-soft bg-surface opacity-50"
        : "border-border-soft bg-surface";
  return (
    <div className={`rounded-xl border p-3 ${toneClass} ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({
  n,
  title,
  intro,
}: {
  n: string;
  title: string;
  intro: React.ReactNode;
}) {
  return (
    <header className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Stap {n}
      </p>
      <h2 className="mt-0.5 text-xl font-bold">{title}</h2>
      <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
        {intro}
      </p>
    </header>
  );
}

export default function HandleidingPage() {
  const today = longDateFmt.format(new Date());

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Handleiding</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Elk scherm van de app, met uitleg bij wat je erop kan doen. Deze
          pagina is een gids — de schermen die je hieronder ziet zijn
          voorbeelden, geen live gegevens.
        </p>
      </header>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-border-soft bg-accent-soft p-3">
        <span aria-hidden className="text-2xl leading-none">
          📲
        </span>
        <div className="text-sm leading-relaxed">
          <p className="font-semibold">Eerst op je startscherm zetten</p>
          <ol className="mt-1 list-decimal pl-4 text-muted">
            <li>Open de app-link in Chrome op je telefoon.</li>
            <li>Tik op het menu (⋮) rechtsboven.</li>
            <li>Kies &quot;Toevoegen aan startscherm&quot;.</li>
          </ol>
        </div>
      </div>

      <nav
        aria-label="Snel naar een scherm"
        className="mb-8 flex flex-wrap gap-2"
      >
        {SECTIONS.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="min-h-9 rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-medium"
          >
            {s.icon} {s.label}
          </a>
        ))}
      </nav>

      {/* 1. Vandaag */}
      <section id="vandaag" className="mb-10 scroll-mt-4">
        <SectionHeader
          n="1"
          title="Vandaag — je startscherm"
          intro="Wat er te laat, vandaag en binnenkort te doen is, met één tik om iets af te vinken. Niets hiervan ligt vast — het wordt telkens herberekend vanaf de laatste keer dat je iets noteerde."
        />
        <Phone active="vandaag">
          <div className="mb-3">
            <h1 className="text-lg font-bold">Vandaag</h1>
            <p className="text-xs text-muted">{today}</p>
          </div>

          <Card className="relative mb-3 flex items-center gap-2">
            <span aria-hidden>🔔</span>
            <p className="text-xs text-muted">
              Zet meldingen aan om een seintje te krijgen als er iets te doen
              is.
            </p>
            <Pin n={1} />
          </Card>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Alles in één keer
          </p>
          <div className="relative mb-3 inline-block">
            <span className="rounded-lg border border-accent bg-accent-soft px-2.5 py-1.5 text-xs font-semibold text-accent">
              {ACTIVITY_LABELS.WATERING} · 3 planten
            </span>
            <Pin n={2} />
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Te laat
          </p>
          <div className="relative mb-3">
            <Card tone="overdue">
              <div className="flex items-start gap-2">
                <span aria-hidden className="text-lg leading-none">
                  🍅
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {ACTIVITY_LABELS.WATERING} ·{" "}
                    <span className="underline">Tomaat</span>
                  </p>
                  <p className="text-xs font-medium text-overdue">
                    3 dagen te laat · buiten
                  </p>
                  <p className="mt-1 text-xs text-accent underline">Hoe?</p>
                </div>
                <span className="min-h-9 shrink-0 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white">
                  Klaar
                </span>
              </div>
            </Card>
            <Pin n={3} />
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Vandaag
          </p>
          <Card className="relative mb-3">
            <div className="flex items-start gap-2">
              <span aria-hidden className="text-lg leading-none">
                🌿
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {ACTIVITY_LABELS.WATERING} ·{" "}
                  <span className="underline">Tijm</span>
                </p>
                <p className="text-xs text-muted">vandaag</p>
                <span className="relative mt-1 inline-block text-xs text-accent underline">
                  Hoe?
                  <Pin n={4} />
                </span>
              </div>
              <span className="min-h-9 shrink-0 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white">
                Klaar
              </span>
            </div>
          </Card>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Binnenkort
          </p>
          <Card className="mb-2">
            <div className="flex items-start gap-2">
              <span aria-hidden className="text-lg leading-none">
                🍃
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {ACTIVITY_LABELS.WATERING} ·{" "}
                  <span className="underline">Basilicum</span>
                </p>
                <p className="text-xs text-muted">over 2 dagen</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start gap-2">
              <span aria-hidden className="text-lg leading-none">
                🍃
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {ACTIVITY_LABELS.HARVESTING} ·{" "}
                  <span className="underline">Basilicum</span>
                </p>
                <p className="text-xs text-muted">over 7 dagen</p>
              </div>
            </div>
          </Card>
        </Phone>

        <CalloutList>
          <Callout n={1}>
            Eén keer per toestel aanzetten — daarna krijg je vanzelf een
            melding zodra er iets moet gebeuren.
          </Callout>
          <Callout n={2}>
            Moeten meerdere planten vandaag hetzelfde krijgen? Dan verschijnt
            hier een snelkoppeling naar <em>Noteren</em>, al voorgeselecteerd.
          </Callout>
          <Callout n={3}>
            <strong className="text-foreground">Te laat</strong> staat in het
            rood. Eén tik op <strong className="text-foreground">Klaar</strong>{" "}
            logt het meteen — geen formulier, geen datum kiezen.
          </Callout>
          <Callout n={4}>
            <strong className="text-foreground">Hoe?</strong> klapt de
            verzorgingsinstructie open, rechtstreeks uit de naslag van die
            plant. Nooit meer onthouden hoeveel water tijm nodig heeft.
          </Callout>
          <Callout n={5}>
            <strong className="text-foreground">Binnenkort</strong>{" "}
            heeft bewust geen &quot;Klaar&quot;-knop — dat is nog niet aan de
            orde, het is er om je te laten vooruitkijken.
          </Callout>
        </CalloutList>
      </section>

      {/* 2. Noteren */}
      <section id="noteren" className="mb-10 scroll-mt-4">
        <SectionHeader
          n="2"
          title="Noteren — meerdere planten tegelijk"
          intro="Heb je net alles water gegeven? Eén actie, één datum, dan alle planten die het nodig hadden in één tik — in plaats van plant voor plant."
        />
        <Phone active="noteren">
          <div className="mb-3">
            <h1 className="text-lg font-bold">Noteren</h1>
            <p className="text-xs text-muted">
              Vink af wat je gedaan hebt — voor meerdere planten tegelijk.
            </p>
          </div>

          <p className="mb-2 text-xs font-medium">Wat heb je gedaan?</p>
          <div className="relative mb-3 flex flex-wrap gap-1.5">
            <span className="rounded-lg border border-accent bg-accent px-2 py-1 text-xs font-medium text-white">
              {ACTIVITY_LABELS.WATERING}
            </span>
            <span className="rounded-lg border border-border-soft bg-surface px-2 py-1 text-xs font-medium">
              {ACTIVITY_LABELS.FERTILIZING}
            </span>
            <span className="rounded-lg border border-border-soft bg-surface px-2 py-1 text-xs font-medium">
              {ACTIVITY_LABELS.PRUNING}
            </span>
            <span className="rounded-lg border border-border-soft bg-surface px-2 py-1 text-xs font-medium">
              {ACTIVITY_LABELS.HARVESTING}
            </span>
            <Pin n={1} />
          </div>

          <p className="mb-1 text-xs font-medium">Wanneer</p>
          <div className="relative mb-3">
            <div className="rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-xs">
              {today}
            </div>
            <Pin n={2} />
          </div>

          <div className="relative mb-2 flex items-center justify-between">
            <p className="text-xs font-medium">
              Bij welke planten?{" "}
              <span className="font-normal text-muted">(2 geselecteerd)</span>
            </p>
            <div className="flex gap-2 text-xs">
              <span className="text-accent underline">Alles</span>
              <span className="text-muted underline">Niets</span>
            </div>
            <Pin n={3} />
          </div>

          <div className="mb-1.5 flex items-center gap-2 rounded-xl border border-accent bg-accent-soft p-2">
            <span className="flex size-4 items-center justify-center rounded border border-accent bg-accent text-[9px] text-white">
              ✓
            </span>
            <span aria-hidden>🍅</span>
            <div>
              <p className="text-xs font-medium">Tomaat</p>
              <p className="text-[11px] text-muted">
                staat vandaag op het lijstje · buiten
              </p>
            </div>
          </div>
          <div className="mb-1.5 flex items-center gap-2 rounded-xl border border-border-soft bg-surface p-2">
            <span className="flex size-4 items-center justify-center rounded border border-border-soft text-[9px]" />
            <span aria-hidden>🍃</span>
            <div>
              <p className="text-xs font-medium">Basilicum</p>
              <p className="text-[11px] text-muted">nog niet nodig</p>
            </div>
          </div>

          <div className="relative mt-3">
            <div className="rounded-lg bg-accent px-3 py-2 text-center text-xs font-semibold text-white">
              {ACTIVITY_LABELS.WATERING} noteren voor 1 plant
            </div>
            <Pin n={4} />
          </div>
        </Phone>

        <CalloutList>
          <Callout n={1}>
            Kies eerst wat je gedaan hebt — de rest van het scherm past zich
            daarop aan, inclusief welke planten al aangevinkt staan.
          </Callout>
          <Callout n={2}>
            Standaard vandaag, maar kies gerust een andere datum als je iets
            vergeten bent te noteren.
          </Callout>
          <Callout n={3}>
            Planten die het al nodig hadden staan automatisch aan.{" "}
            <strong className="text-foreground">Alles</strong> of{" "}
            <strong className="text-foreground">Niets</strong> past dat in één
            keer aan.
          </Callout>
          <Callout n={4}>
            Eén tik noteert de actie voor alle aangevinkte planten tegelijk —
            dit is de snelste manier om te loggen voor iedereen in één keer.
          </Callout>
        </CalloutList>
      </section>

      {/* 3. Mijn planten */}
      <section id="planten" className="mb-10 scroll-mt-4">
        <SectionHeader
          n="3"
          title="Mijn planten — wat er staat"
          intro="Alle planten die je effectief kweekt, met in één oogopslag welke ergens op wachten."
        />
        <Phone active="planten">
          <div className="relative mb-3 flex items-center justify-between gap-2">
            <h1 className="text-lg font-bold">Mijn planten</h1>
            <span className="rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white">
              Toevoegen
            </span>
            <Pin n={1} />
          </div>

          <div className="relative mb-2">
            <Card className="flex items-center gap-2">
              <span aria-hidden className="text-lg leading-none">
                🍅
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Tomaat</p>
                <p className="text-xs text-muted">Tomaat · buiten</p>
              </div>
              <span className="shrink-0 rounded-full bg-overdue-soft px-2 py-0.5 text-[10px] font-semibold text-overdue">
                1 te doen
              </span>
            </Card>
            <Pin n={2} />
          </div>
          <Card className="mb-2 flex items-center gap-2">
            <span aria-hidden className="text-lg leading-none">
              🍃
            </span>
            <div>
              <p className="text-sm font-semibold">Basilicum</p>
              <p className="text-xs text-muted">Basilicum</p>
            </div>
          </Card>
          <Card className="mb-3 flex items-center gap-2">
            <span aria-hidden className="text-lg leading-none">
              🌿
            </span>
            <div>
              <p className="text-sm font-semibold">Tijm</p>
              <p className="text-xs text-muted">Tijm</p>
            </div>
          </Card>

          <p className="relative mb-2 inline-block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Gearchiveerd
            <Pin n={3} />
          </p>
          <Card tone="dim" className="flex items-center gap-2">
            <span aria-hidden className="text-lg leading-none">
              🌻
            </span>
            <div>
              <p className="text-sm font-semibold">Zonnebloem</p>
              <p className="text-xs text-muted">Zonnebloem</p>
            </div>
          </Card>
        </Phone>

        <CalloutList>
          <Callout n={1}>
            &quot;Toevoegen&quot; hier is voor een plant die je al in de naslag
            hebt — je koppelt gewoon soort, plek en plantdatum. Nieuwe soorten
            voeg je toe via Naslag (stap 6).
          </Callout>
          <Callout n={2}>
            Een rood bolletje toont meteen hoeveel taken openstaan, zonder dat
            je hoeft door te klikken.
          </Callout>
          <Callout n={3}>
            Een plant archiveren (bv. na het seizoen) houdt de geschiedenis
            bij, maar haalt hem van &quot;Vandaag&quot; af.
          </Callout>
        </CalloutList>
      </section>

      {/* 4. Eén plant */}
      <section id="plant" className="mb-10 scroll-mt-4">
        <SectionHeader
          n="4"
          title="Eén plant — schema, info en geschiedenis"
          intro="Tik op een plant in de lijst en je krijgt alles voor precies dat exemplaar: wanneer het weer iets nodig heeft, hoe je dat doet, en wat er al mee gebeurd is."
        />
        <Phone active="planten">
          <p className="mb-2 text-xs text-muted">← Mijn planten</p>
          <div className="mb-3 flex items-start gap-2">
            <span aria-hidden className="text-2xl leading-none">
              🍅
            </span>
            <div>
              <h1 className="text-lg font-bold">Tomaat</h1>
              <p className="text-xs text-muted">
                <span className="underline">Tomaat</span> · buiten · geplant
                12 mei 2026
              </p>
            </div>
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Schema
          </p>
          <Card className="mb-3">
            <p className="text-sm font-semibold">
              {ACTIVITY_LABELS.WATERING}{" "}
              <span className="font-medium text-overdue">
                · 3 dagen te laat
              </span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Diep water geven bij de voet, blad droog houden om schimmel te
              vermijden.
            </p>
            <p className="mt-1 text-[11px] text-muted">
              Elke 2 dagen · laatst gedaan 30 jul. 2026
            </p>
          </Card>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Iets noteren
          </p>
          <div className="relative mb-3">
            <Card>
              <p className="text-xs font-medium">Wat heb je gedaan?</p>
              <div className="my-1.5 rounded-lg border border-border-soft bg-background px-2 py-1 text-xs">
                {ACTIVITY_LABELS.WATERING}
              </div>
              <p className="text-xs font-medium">Notities (optioneel)</p>
              <div className="my-1.5 rounded-lg border border-border-soft bg-background px-2 py-2 text-xs text-muted">
                Iets dat je wil onthouden
              </div>
              <div className="rounded-lg bg-accent px-3 py-1.5 text-center text-xs font-semibold text-white">
                Opslaan
              </div>
            </Card>
            <Pin n={1} />
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Geschiedenis
          </p>
          <Card className="flex items-center justify-between">
            <span className="text-xs">
              <span className="font-medium">{ACTIVITY_LABELS.WATERING}</span>{" "}
              <span className="text-muted">· 30 jul. 2026</span>
            </span>
            <span className="text-[11px] text-muted underline">Wissen</span>
          </Card>
        </Phone>

        <CalloutList>
          <Callout n={1}>
            Elk plant heeft dit korte formulier: activiteit, datum, een
            optioneel briefje. Bewaar hier iets als &quot;eerste keer
            bloesem&quot; — dat wordt de geschiedenis eronder.
          </Callout>
        </CalloutList>
      </section>

      {/* 5. Naslag */}
      <section id="naslag" className="mb-10 scroll-mt-4">
        <SectionHeader
          n="5"
          title="Naslag — je plantenencyclopedie"
          intro="Alle soorten die je ooit hebt toegevoegd, gegroepeerd per categorie — los van hoeveel exemplaren je er nu van hebt staan."
        />
        <Phone active="naslag">
          <div className="relative mb-3 flex items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-bold">Naslag</h1>
              <p className="text-xs text-muted">
                Alles wat we weten over onze planten.
              </p>
            </div>
            <span className="shrink-0 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white">
              Toevoegen
            </span>
            <Pin n={1} />
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Groenten
          </p>
          <div className="relative mb-3">
            <Card className="flex items-center gap-2">
              <span aria-hidden className="text-lg leading-none">
                🍅
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Tomaat</p>
                <p className="text-xs text-muted">1 in de tuin</p>
              </div>
              <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                nu oogsten
              </span>
            </Card>
            <Pin n={2} />
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Bloemen
          </p>
          <Card className="flex items-center gap-2">
            <span aria-hidden className="text-lg leading-none">
              🌻
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Zonnebloem</p>
              <p className="text-xs text-muted">nog niet geplant</p>
            </div>
            <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
              nu zaaien
            </span>
          </Card>
        </Phone>

        <CalloutList>
          <Callout n={1}>
            Dit is de knop voor nieuwe planten die je gekocht hebt — hij
            brengt je naar de plantenlijst van stap 6, het hart van de app.
          </Callout>
          <Callout n={2}>
            &quot;nu oogsten&quot; en &quot;nu zaaien&quot; zijn
            seizoensbadges — ze verschijnen automatisch op basis van de
            huidige maand, ook voor soorten die je nog niet geplant hebt.
          </Callout>
        </CalloutList>
      </section>

      {/* 6. Soort toevoegen */}
      <section id="toevoegen" className="mb-10 scroll-mt-4">
        <SectionHeader
          n="6"
          title="Een soort toevoegen — het hele punt van de app"
          intro={
            <>
              Zoek wat je gekocht hebt in de ingebouwde plantenlijst van{" "}
              <strong className="text-foreground">144 soorten</strong> en tik
              hem aan. Zon, water, grond, kalender, verzorgingsschema met
              instructies, problemen, buren — alles staat er meteen bij,
              zonder dat je iets hoeft over te typen.
            </>
          }
        />
        <Phone active="naslag">
          <h1 className="mb-3 text-lg font-bold">Naslag</h1>

          <div className="relative mb-3 flex items-center gap-2 rounded-lg border border-border-soft bg-surface px-2.5 py-2 text-xs text-muted">
            <span aria-hidden>🔍</span>
            <span>pioen</span>
            <Pin n={1} />
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Bloemen
          </p>
          <div className="relative mb-3 flex items-center gap-2 rounded-xl border border-accent bg-accent-soft p-2.5">
            <span className="flex size-4 items-center justify-center rounded border border-accent bg-accent text-[9px] text-white">
              ✓
            </span>
            <span aria-hidden>🌺</span>
            <div>
              <p className="text-xs font-medium">Pioenroos</p>
              <p className="text-[11px] text-muted">
                Vaste plant · bloei mei – juni
              </p>
            </div>
            <Pin n={2} />
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Kruiden
          </p>
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-border-soft bg-surface p-2.5 opacity-50">
            <span className="flex size-4 items-center justify-center rounded border border-border-soft text-[9px]" />
            <span aria-hidden>🌿</span>
            <div>
              <p className="text-xs font-medium">
                Tijm{" "}
                <span className="font-normal text-muted">
                  staat er al in
                </span>
              </p>
              <p className="text-[11px] text-muted">
                Vaste plant · oogst april – oktober
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg bg-accent px-3 py-2 text-center text-xs font-semibold text-white">
              1 soort toevoegen
            </div>
            <Pin n={3} />
          </div>
        </Phone>

        <CalloutList>
          <Callout n={1}>
            Typ gewoon wat er op het etiket of het zaadzakje staat —
            Nederlandse naam volstaat, hoofdletters en accenten maken niet
            uit.
          </Callout>
          <Callout n={2}>
            Vink aan wat je gekocht hebt, meerdere tegelijk mag. Iets dat je al
            hebt staat gedimd met &quot;staat er al in&quot; en kan niet
            dubbel toegevoegd worden.
          </Callout>
          <Callout n={3}>
            Eén tik en de volledige soort-pagina (kalender, verzorging,
            problemen, buren) staat klaar in je naslag.
          </Callout>
        </CalloutList>

        <p className="mt-4 rounded-xl border border-dashed border-border-soft p-3 text-sm leading-relaxed text-muted">
          <strong className="text-foreground">
            Staat een plant er niet tussen?
          </strong>{" "}
          Onderaan de zoekresultaten staat een link om hem zelf toe te voegen
          met een kort formulier — de plantenlijst blijft intussen groeien.
        </p>
      </section>

      {/* 7. Soort-pagina */}
      <section id="soort" className="mb-10 scroll-mt-4">
        <SectionHeader
          n="7"
          title="Een soort-pagina — alles wat we weten"
          intro="Dit staat er automatisch, zodra je een soort uit de lijst hebt toegevoegd. Je kan het achteraf altijd aanpassen aan jullie eigen tuin."
        />
        <Phone active="naslag">
          <p className="mb-2 text-xs text-muted">← Naslag</p>
          <div className="mb-3 flex items-start gap-2">
            <span aria-hidden className="text-2xl leading-none">
              🍅
            </span>
            <div>
              <h1 className="text-lg font-bold">Tomaat</h1>
              <p className="text-xs text-muted">
                Groente · Eenjarig · Solanum lycopersicum
              </p>
            </div>
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            In het kort
          </p>
          <Card className="mb-3 space-y-1.5 text-xs leading-relaxed">
            <p>
              <strong>Zon:</strong> volle zon, minstens 6 uur
            </p>
            <p>
              <strong>Water:</strong> regelmatig, blad droog houden
            </p>
            <p>
              <strong>Grond:</strong> voedzaam, goed drainerend
            </p>
          </Card>

          <p className="relative mb-2 inline-block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Verzorging
            <Pin n={1} />
          </p>
          <Card className="mb-2">
            <p className="text-xs">
              <strong>{ACTIVITY_LABELS.WATERING}</strong>{" "}
              <span className="text-muted">· elke 2 dagen</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Diep water geven bij de voet, blad droog houden om schimmel te
              vermijden.
            </p>
          </Card>

          <p className="relative mb-2 inline-block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Goed om te weten
            <Pin n={2} />
          </p>
          <Card>
            <p className="mb-1 text-xs font-semibold">
              Veelvoorkomende problemen
            </p>
            <p className="text-xs leading-relaxed text-muted">
              Bladvlekkenziekte bij te vochtig blad; bladluis in juni-juli.
            </p>
          </Card>
        </Phone>

        <CalloutList>
          <Callout n={1}>
            Dit zijn dezelfde regels die het schema op &quot;Vandaag&quot;
            aandrijven. Pas je hier het interval aan, dan verschuift elke
            herinnering voor die soort onmiddellijk mee.
          </Callout>
          <Callout n={2}>
            Problemen en buren staan er niet om achteraf te troosten — lees ze
            vooraf, dan weet je waar je op moet letten.
          </Callout>
        </CalloutList>
      </section>

      {/* 8. Instellingen */}
      <section id="instellingen" className="mb-10 scroll-mt-4">
        <SectionHeader
          n="8"
          title="Instellingen — meldingen naar wie"
          intro="Bepaal of en naar welk e-mailadres de dagelijkse herinnering gaat. Losstaand van push-meldingen, die per toestel aan- of uitstaan."
        />
        <Phone active="instellingen">
          <h1 className="mb-3 text-lg font-bold">Instellingen</h1>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Meldingen per e-mail
          </p>
          <div className="relative mb-3">
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold">Dagelijkse e-mail</span>
                <span className="relative inline-block h-4 w-8 rounded-full bg-accent">
                  <span className="absolute right-0.5 top-0.5 size-3 rounded-full bg-white" />
                </span>
              </div>
              <p className="text-xs font-medium">E-mailadres</p>
              <div className="mt-1 rounded-lg border border-border-soft bg-background px-2 py-1 text-xs">
                jouw@adres.be
              </div>
            </Card>
            <Pin n={1} />
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Meldingen op dit toestel
          </p>
          <Card>
            <p className="text-xs leading-relaxed text-muted">
              Push-meldingen zet je aan of uit via de melding bovenaan
              &quot;Vandaag&quot; — dat staat per toestel, niet hier.
            </p>
          </Card>
        </Phone>

        <CalloutList>
          <Callout n={1}>
            Zet e-mail helemaal uit, of vul het adres in waar de dagelijkse
            samenvatting naartoe moet — handig voor een gedeeld tuin-adres in
            plaats van een persoonlijk adres.
          </Callout>
        </CalloutList>

        <p className="mt-4 rounded-xl border border-dashed border-border-soft p-3 text-sm leading-relaxed text-muted">
          <strong className="text-foreground">Onderscheid:</strong>{" "}
          push-meldingen zijn per toestel — jullie zetten dat elk apart aan.
          E-mail is per huishouden — één instelling hier, voor iedereen die
          het adres leest.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          De onderste balk
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ["☀️", "Vandaag", "wat er nu te doen is"],
            ["✅", "Noteren", "meerdere planten tegelijk afvinken"],
            ["🪴", "Planten", "jullie eigen planten"],
            ["📖", "Naslag", "de encyclopedie van elke soort"],
            ["⚙️", "Instellingen", "e-mailherinneringen"],
          ].map(([icon, label, desc]) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-xl border border-border-soft bg-surface p-2.5"
            >
              <span aria-hidden className="text-xl leading-none">
                {icon}
              </span>
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-muted">{desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 border-t border-border-soft pt-4 text-xs leading-relaxed text-muted">
        De schermen hierboven zijn opgebouwd met de echte teksten, kleuren en
        indeling van de app. Sommige voorbeeldgegevens (zoals de tomaat die te
        laat water nodig heeft) zijn illustratief, om elke toestand van het
        schema te kunnen tonen.
      </p>

      <Link
        href="/instellingen"
        className="mt-6 flex min-h-11 items-center justify-center rounded-lg border border-border-soft px-4 text-sm font-medium"
      >
        ← Terug naar instellingen
      </Link>
    </>
  );
}
