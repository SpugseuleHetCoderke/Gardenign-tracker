import { MONTHS_NL } from "@/lib/format";
import { ACTIVITY_LABELS } from "@/lib/care-shared";
import { CATEGORY_LABELS, LIFECYCLE_LABELS } from "@/lib/species-labels";
import type {
  ActivityType,
  Lifecycle,
  PlantCategory,
} from "@/generated/prisma/client";

/** Everything the form can prefill. Empty object = a blank "add" form. */
export type SpeciesFormValues = {
  id?: string;
  name?: string;
  emoji?: string;
  category?: PlantCategory;
  latinName?: string | null;
  lifecycle?: Lifecycle | null;
  sunlight?: string;
  soil?: string | null;
  waterNeeds?: string | null;
  spacing?: string | null;
  height?: string | null;
  sowIndoorsFromMonth?: number | null;
  sowIndoorsToMonth?: number | null;
  sowOutdoorsFromMonth?: number | null;
  sowOutdoorsToMonth?: number | null;
  plantOutFromMonth?: number | null;
  plantOutToMonth?: number | null;
  harvestFromMonth?: number | null;
  harvestToMonth?: number | null;
  generalNotes?: string | null;
  commonProblems?: string | null;
  companionPlants?: string | null;
  careRules?: {
    activityType: ActivityType;
    intervalDays: number;
    instructions: string;
  }[];
};

/** Care activities that can go on a schedule — NOTE is log-only. */
const SCHEDULABLE: ActivityType[] = [
  "WATERING",
  "FERTILIZING",
  "PRUNING",
  "HARVESTING",
  "REPOTTING",
];

const FIELD =
  "min-h-12 rounded-lg border border-border-soft bg-surface px-3 w-full";

function MonthSelect({
  name,
  defaultValue,
  label,
}: {
  name: string;
  defaultValue?: number | null;
  label: string;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className={FIELD}
        aria-label={label}
      >
        <option value="">—</option>
        {MONTHS_NL.map((m, i) => (
          <option key={m} value={i + 1}>
            {m}
          </option>
        ))}
      </select>
    </label>
  );
}

function MonthWindow({
  legend,
  hint,
  fromName,
  toName,
  fromValue,
  toValue,
}: {
  legend: string;
  hint?: string;
  fromName: string;
  toName: string;
  fromValue?: number | null;
  toValue?: number | null;
}) {
  return (
    <fieldset className="rounded-lg border border-border-soft p-3">
      <legend className="px-1 text-sm font-medium">{legend}</legend>
      {hint && <p className="mb-2 text-xs text-muted">{hint}</p>}
      <div className="flex gap-2">
        <MonthSelect name={fromName} defaultValue={fromValue} label="van" />
        <MonthSelect name={toName} defaultValue={toValue} label="tot en met" />
      </div>
    </fieldset>
  );
}

/**
 * Shared by the add and edit screens. A plain server-rendered form posting to
 * a server action — no client JS needed, which keeps it fast on a phone.
 */
export default function SpeciesForm({
  action,
  values = {},
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  values?: SpeciesFormValues;
  submitLabel: string;
}) {
  const ruleFor = (a: ActivityType) =>
    values.careRules?.find((r) => r.activityType === a);

  return (
    <form action={action} className="flex flex-col gap-6">
      {values.id && <input type="hidden" name="speciesId" value={values.id} />}

      <section className="flex flex-col gap-3">
        <div className="flex gap-2">
          <label className="flex w-20 flex-col gap-1">
            <span className="text-sm font-medium">Icoon</span>
            <input
              name="emoji"
              defaultValue={values.emoji ?? ""}
              placeholder="🌱"
              maxLength={4}
              className={`${FIELD} text-center text-xl`}
            />
          </label>

          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium">Naam *</span>
            <input
              name="name"
              required
              defaultValue={values.name ?? ""}
              placeholder="bv. Courgette"
              className={FIELD}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            Latijnse naam{" "}
            <span className="font-normal text-muted">(optioneel)</span>
          </span>
          <input
            name="latinName"
            defaultValue={values.latinName ?? ""}
            placeholder="bv. Cucurbita pepo"
            className={FIELD}
          />
        </label>

        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium">Categorie</span>
            <select
              name="category"
              defaultValue={values.category ?? "VEGETABLE"}
              className={FIELD}
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium">Levensduur</span>
            <select
              name="lifecycle"
              defaultValue={values.lifecycle ?? ""}
              className={FIELD}
            >
              <option value="">Onbekend</option>
              {Object.entries(LIFECYCLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Standplaats
        </h2>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Hoeveel zon? *</span>
          <input
            name="sunlight"
            required
            defaultValue={values.sunlight ?? ""}
            placeholder="bv. Volle zon — minstens 6 uur per dag"
            className={FIELD}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Hoeveel water?</span>
          <input
            name="waterNeeds"
            defaultValue={values.waterNeeds ?? ""}
            placeholder="bv. Veel, en vooral regelmatig"
            className={FIELD}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Grond</span>
          <input
            name="soil"
            defaultValue={values.soil ?? ""}
            placeholder="bv. Rijke, goed doorlatende grond"
            className={FIELD}
          />
        </label>

        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium">Plantafstand</span>
            <input
              name="spacing"
              defaultValue={values.spacing ?? ""}
              placeholder="bv. 40 cm"
              className={FIELD}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium">Hoogte</span>
            <input
              name="height"
              defaultValue={values.height ?? ""}
              placeholder="bv. 60 cm"
              className={FIELD}
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Kalender
        </h2>
        <p className="-mt-2 text-xs text-muted">
          Laat leeg wat niet van toepassing is.
        </p>

        <MonthWindow
          legend="Binnen voorzaaien"
          fromName="sowIndoorsFromMonth"
          toName="sowIndoorsToMonth"
          fromValue={values.sowIndoorsFromMonth}
          toValue={values.sowIndoorsToMonth}
        />
        <MonthWindow
          legend="Buiten zaaien"
          fromName="sowOutdoorsFromMonth"
          toName="sowOutdoorsToMonth"
          fromValue={values.sowOutdoorsFromMonth}
          toValue={values.sowOutdoorsToMonth}
        />
        <MonthWindow
          legend="Buiten uitplanten"
          fromName="plantOutFromMonth"
          toName="plantOutToMonth"
          fromValue={values.plantOutFromMonth}
          toValue={values.plantOutToMonth}
        />
        <MonthWindow
          legend="Oogsten"
          fromName="harvestFromMonth"
          toName="harvestToMonth"
          fromValue={values.harvestFromMonth}
          toValue={values.harvestToMonth}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Verzorgingsschema
        </h2>
        <p className="-mt-2 text-xs text-muted">
          Vul een aantal dagen in om die taak op het schema te zetten. Leeg of 0
          betekent: geen herinnering.
        </p>

        {SCHEDULABLE.map((activity) => {
          const rule = ruleFor(activity);
          return (
            <fieldset
              key={activity}
              className="rounded-lg border border-border-soft p-3"
            >
              <legend className="px-1 text-sm font-medium">
                {ACTIVITY_LABELS[activity]}
              </legend>

              <label className="flex items-center gap-2">
                <span className="text-xs text-muted">elke</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={365}
                  name={`interval_${activity}`}
                  defaultValue={rule?.intervalDays ?? ""}
                  placeholder="—"
                  aria-label={`${ACTIVITY_LABELS[activity]}: aantal dagen`}
                  className="min-h-12 w-24 rounded-lg border border-border-soft bg-surface px-3"
                />
                <span className="text-xs text-muted">dagen</span>
              </label>

              <label className="mt-2 flex flex-col gap-1">
                <span className="text-xs text-muted">
                  Hoe pak je het aan? Dit verschijnt op het takenlijstje en in
                  de herinneringsmail.
                </span>
                <textarea
                  name={`instructions_${activity}`}
                  rows={2}
                  defaultValue={rule?.instructions ?? ""}
                  placeholder="bv. Water geven aan de voet, nooit over het blad."
                  className="w-full rounded-lg border border-border-soft bg-surface p-3"
                />
              </label>
            </fieldset>
          );
        })}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Goed om te weten
        </h2>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Algemene notities</span>
          <textarea
            name="generalNotes"
            rows={3}
            defaultValue={values.generalNotes ?? ""}
            className="w-full rounded-lg border border-border-soft bg-surface p-3"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Veelvoorkomende problemen</span>
          <textarea
            name="commonProblems"
            rows={3}
            defaultValue={values.commonProblems ?? ""}
            placeholder="bv. Slakken, meeldauw…"
            className="w-full rounded-lg border border-border-soft bg-surface p-3"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Buren</span>
          <textarea
            name="companionPlants"
            rows={2}
            defaultValue={values.companionPlants ?? ""}
            placeholder="Welke planten staan hier graag naast — en welke niet?"
            className="w-full rounded-lg border border-border-soft bg-surface p-3"
          />
        </label>
      </section>

      <button
        type="submit"
        className="min-h-12 rounded-lg bg-accent px-4 font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
