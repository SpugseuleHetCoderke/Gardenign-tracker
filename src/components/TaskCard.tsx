"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { logActivity } from "@/app/actions";
import { ACTIVITY_LABELS, dueLabel, type DueTask } from "@/lib/care-shared";

export default function TaskCard({
  task,
  tone,
}: {
  task: DueTask;
  tone: "overdue" | "today" | "upcoming";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function markDone() {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("plantId", task.plantId);
      fd.set("activityType", task.activityType);
      await logActivity(fd);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const accent =
    tone === "overdue"
      ? "border-overdue/40 bg-overdue-soft"
      : "border-border-soft bg-surface";

  return (
    <li className={`rounded-xl border ${accent} p-3`}>
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-2xl leading-none">
          {task.emoji}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {ACTIVITY_LABELS[task.activityType]} ·{" "}
            <Link
              href={`/planten/${task.plantId}`}
              className="underline decoration-border-soft underline-offset-2"
            >
              {task.plantLabel}
            </Link>
          </p>
          <p
            className={`text-sm ${
              tone === "overdue" ? "font-medium text-overdue" : "text-muted"
            }`}
          >
            {dueLabel(task)}
            {task.location ? ` · ${task.location}` : ""}
          </p>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-1 text-sm text-accent underline underline-offset-2"
            aria-expanded={open}
          >
            {open ? "Verbergen" : "Hoe?"}
          </button>

          {open && (
            <p className="mt-2 rounded-lg bg-accent-soft p-3 text-sm leading-relaxed">
              {task.instructions}
            </p>
          )}
        </div>

        {tone !== "upcoming" && (
          <button
            type="button"
            onClick={markDone}
            disabled={saving}
            className="min-h-11 shrink-0 rounded-lg bg-accent px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "…" : "Klaar"}
          </button>
        )}
      </div>
    </li>
  );
}
