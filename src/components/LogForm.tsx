"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logActivity } from "@/app/actions";
import { ACTIVITY_LABELS } from "@/lib/care-shared";
import type { ActivityType } from "@/generated/prisma/client";

/** Activity types offered in the form, in the order they're most likely used. */
const OPTIONS: ActivityType[] = [
  "WATERING",
  "FERTILIZING",
  "PRUNING",
  "HARVESTING",
  "REPOTTING",
  "NOTE",
];

export default function LogForm({ plantId }: { plantId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setSaving(true);
        try {
          await logActivity(formData);
          formRef.current?.reset();
          router.refresh();
        } finally {
          setSaving(false);
        }
      }}
      className="flex flex-col gap-3 rounded-xl border border-border-soft bg-surface p-3"
    >
      <input type="hidden" name="plantId" value={plantId} />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Wat heb je gedaan?</span>
        <select
          name="activityType"
          defaultValue="WATERING"
          className="min-h-12 rounded-lg border border-border-soft bg-background px-3"
        >
          {OPTIONS.map((a) => (
            <option key={a} value={a}>
              {ACTIVITY_LABELS[a]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Wanneer</span>
        <input
          type="date"
          name="loggedAt"
          defaultValue={today}
          max={today}
          className="min-h-12 rounded-lg border border-border-soft bg-background px-3"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          Notities <span className="font-normal text-muted">(optioneel)</span>
        </span>
        <textarea
          name="notes"
          rows={2}
          placeholder="Iets dat je wil onthouden"
          className="rounded-lg border border-border-soft bg-background p-3"
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="min-h-12 rounded-lg bg-accent px-4 font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Bezig…" : "Opslaan"}
      </button>
    </form>
  );
}
