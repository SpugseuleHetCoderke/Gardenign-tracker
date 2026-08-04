"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addSpeciesFromCatalog } from "@/app/actions";
import { CATEGORY_HEADINGS, CATEGORY_ORDER } from "@/lib/species-labels";
import type { PlantCategory } from "@/generated/prisma/client";

/**
 * Only what the picker needs to render — the full catalogue entry (with all
 * the prose) stays server-side so we're not shipping it to the browser.
 */
export type PickerItem = {
  slug: string;
  name: string;
  emoji: string;
  category: PlantCategory;
  latinName: string;
  summary: string;
  /** Already in the user's Naslag — shown but not selectable. */
  owned: boolean;
};

export default function CatalogPicker({ items }: { items: PickerItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);

  const matches = useMemo(() => {
    const q = normalize(query);
    if (!q) return items;
    return items.filter((i) =>
      [i.name, i.latinName].some((f) => normalize(f).includes(q)),
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const byCategory = new Map<PlantCategory, PickerItem[]>();
    for (const item of matches) {
      byCategory.set(item.category, [...(byCategory.get(item.category) ?? []), item]);
    }
    return CATEGORY_ORDER.filter((c) => byCategory.has(c)).map(
      (c) => [c, byCategory.get(c)!] as const,
    );
  }, [matches]);

  function toggle(slug: string) {
    setResult(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function save() {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      const fd = new FormData();
      for (const slug of selected) fd.append("slugs", slug);
      const res = await addSpeciesFromCatalog(fd);
      setResult(res);
      setSelected(new Set());
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Zoek een plant — bv. courgette, radijs, munt…"
        className="min-h-12 rounded-lg border border-border-soft bg-surface px-3"
        // Mobile keyboards default to autocorrecting plant names into nonsense.
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {result && (
        <p className="rounded-lg bg-accent-soft p-3 text-sm">
          {result.added > 0
            ? `${result.added} ${result.added === 1 ? "soort" : "soorten"} toegevoegd aan de naslag.`
            : "Niets toegevoegd."}
          {result.skipped > 0 && ` ${result.skipped} stond${result.skipped === 1 ? "" : "en"} er al in.`}
        </p>
      )}

      {matches.length === 0 && (
        <div className="rounded-xl border border-border-soft bg-surface p-6 text-center text-sm text-muted">
          <p className="mb-2">Niets gevonden voor &quot;{query}&quot;.</p>
          <p>
            Staat de plant niet in de lijst? Je kan hem altijd{" "}
            <Link href="/soorten/nieuw" className="text-accent underline underline-offset-2">
              zelf toevoegen
            </Link>
            .
          </p>
        </div>
      )}

      {grouped.map(([category, entries]) => (
        <section key={category}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            {CATEGORY_HEADINGS[category]}
          </h2>
          <ul className="flex flex-col gap-2">
            {entries.map((item) => {
              const isSelected = selected.has(item.slug);
              return (
                <li key={item.slug}>
                  <label
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      item.owned
                        ? "border-border-soft bg-surface opacity-50"
                        : isSelected
                          ? "border-accent bg-accent-soft"
                          : "border-border-soft bg-surface"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={item.owned}
                      onChange={() => toggle(item.slug)}
                      className="size-5 shrink-0 accent-[var(--accent)]"
                    />
                    <span aria-hidden className="text-2xl leading-none">
                      {item.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">
                        {item.name}
                        {item.owned && (
                          <span className="ml-2 text-xs font-normal text-muted">
                            staat er al in
                          </span>
                        )}
                      </span>
                      <span className="block text-sm text-muted">{item.summary}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {/* Sticky so the button stays reachable while scrolling a long list. */}
      {selected.size > 0 && (
        <div
          className="sticky bottom-0 -mx-4 border-t border-border-soft bg-surface px-4 py-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
        >
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="min-h-12 w-full rounded-lg bg-accent px-4 font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Bezig…"
              : `${selected.size} ${selected.size === 1 ? "soort" : "soorten"} toevoegen`}
          </button>
        </div>
      )}
    </div>
  );
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
