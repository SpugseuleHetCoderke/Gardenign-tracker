"use client";

import { useActionState } from "react";
import { saveEmailSettings, type SaveEmailSettingsState } from "@/app/actions";

const initialState: SaveEmailSettingsState = {};

export default function EmailSettingsForm({
  emailRemindersOn,
  emailAddress,
}: {
  emailRemindersOn: boolean;
  emailAddress: string;
}) {
  const [state, formAction, pending] = useActionState(saveEmailSettings, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-border-soft bg-surface p-3"
    >
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="emailRemindersOn"
          defaultChecked={emailRemindersOn}
          className="size-5 shrink-0 accent-[var(--accent)]"
        />
        <span className="text-sm">
          Stuur ook een dagelijkse e-mail met wat er te doen is
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">E-mailadres</span>
        <input
          type="email"
          name="emailAddress"
          defaultValue={emailAddress}
          placeholder="jij@voorbeeld.be"
          className="min-h-12 rounded-lg border border-border-soft bg-background px-3"
        />
      </label>

      {state.error && (
        <p className="text-sm text-overdue" role="alert">
          {state.error}
        </p>
      )}
      {state.savedAt && !state.error && (
        <p className="text-sm text-accent">Opgeslagen.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-lg bg-accent px-4 font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Bezig…" : "Opslaan"}
      </button>
    </form>
  );
}
