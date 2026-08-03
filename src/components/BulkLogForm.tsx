"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { logActivityBulk } from "@/app/actions";
import { ACTIVITY_LABELS } from "@/lib/care-shared";
import type { ActivityType } from "@/generated/prisma/client";

export type BulkPlant = {
  id: string;
  label: string;
  location: string | null;
  emoji: string;
  /** Activities this plant is actually scheduled for. */
  scheduledFor: ActivityType[];
  /** Activities currently due or overdue for this plant. */
  dueFor: ActivityType[];
};

/** Offered in the picker, in the order they're most likely used. */
const OPTIONS: ActivityType[] = [
  "WATERING",
  "FERTILIZING",
  "PRUNING",
  "HARVESTING",
  "REPOTTING",
];

export default function BulkLogForm({
  plants,
  initialActivity,
}: {
  plants: BulkPlant[];
  initialActivity: ActivityType;
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [activity, setActivity] = useState<ActivityType>(initialActivity);
  const [date, setDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  // Plants the chosen activity is actually due for — the sensible default
  // selection, recomputed whenever the activity changes.
  const dueIds = useMemo(
    () =>
      new Set(
        plants.filter((p) => p.dueFor.includes(activity)).map((p) => p.id),
      ),
    [plants, activity],
  );

  const [manual, setManual] = useState<Record<string, boolean>>({});

  // A plant is checked if the user explicitly toggled it, otherwise if it's due.
  const isChecked = (id: string) => manual[id] ?? dueIds.has(id);
  const selectedIds = plants.filter((p) => isChecked(p.id)).map((p) => p.id);

  function chooseActivity(next: ActivityType) {
    setActivity(next);
    setManual({}); // fall back to "what's due" for the new activity
    setDone(null);
  }

  async function submit() {
    if (selectedIds.length === 0) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("activityType", activity);
      fd.set("loggedAt", date);
      for (const id of selectedIds) fd.append("plantIds", id);

      const result = await logActivityBulk(fd);
      setDone(result.count);
      setManual({});
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium">Wat heb je gedaan?</p>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => chooseActivity(a)}
              className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${
                activity === a
                  ? "border-accent bg-accent text-white"
                  : "border-border-soft bg-surface text-foreground"
              }`}
            >
              {ACTIVITY_LABELS[a]}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Wanneer</span>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="min-h-12 rounded-lg border border-border-soft bg-surface px-3"
        />
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">
            Bij welke planten?{" "}
            <span className="font-normal text-muted">
              ({selectedIds.length} geselecteerd)
            </span>
          </p>
          <div className="flex gap-3 text-sm">
            <button
              type="button"
              className="text-accent underline underline-offset-2"
              onClick={() =>
                setManual(Object.fromEntries(plants.map((p) => [p.id, true])))
              }
            >
              Alles
            </button>
            <button
              type="button"
              className="text-muted underline underline-offset-2"
              onClick={() =>
                setManual(Object.fromEntries(plants.map((p) => [p.id, false])))
              }
            >
              Niets
            </button>
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {plants.map((p) => {
            const scheduled = p.scheduledFor.includes(activity);
            const due = p.dueFor.includes(activity);
            const checked = isChecked(p.id);

            return (
              <li key={p.id}>
                <label
                  className={`flex items-center gap-3 rounded-xl border p-3 ${
                    checked
                      ? "border-accent bg-accent-soft"
                      : "border-border-soft bg-surface"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setManual((m) => ({ ...m, [p.id]: e.target.checked }))
                    }
                    className="size-5 shrink-0 accent-[var(--accent)]"
                  />
                  <span aria-hidden className="text-2xl leading-none">
                    {p.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{p.label}</span>
                    <span className="block text-sm text-muted">
                      {due
                        ? "staat vandaag op het lijstje"
                        : scheduled
                          ? "nog niet nodig"
                          : `geen ${ACTIVITY_LABELS[activity].toLowerCase()} in het schema`}
                      {p.location ? ` · ${p.location}` : ""}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {done !== null && (
        <p className="rounded-lg bg-accent-soft p-3 text-sm">
          {done === 1
            ? "1 plant genoteerd."
            : `${done} planten genoteerd.`}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={saving || selectedIds.length === 0}
        className="min-h-12 rounded-lg bg-accent px-4 font-semibold text-white disabled:opacity-50"
      >
        {saving
          ? "Bezig…"
          : `${ACTIVITY_LABELS[activity]} noteren voor ${selectedIds.length} ${
              selectedIds.length === 1 ? "plant" : "planten"
            }`}
      </button>
    </div>
  );
}
