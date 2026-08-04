/**
 * Shared building blocks for the /handleiding mockups only — a phone-shaped
 * frame, a numbered pin, and a numbered explanation line. Not used anywhere
 * else in the app, so this stays local to the route instead of in
 * src/components/.
 */
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { key: "vandaag", label: "Vandaag", icon: "☀️" },
  { key: "noteren", label: "Noteren", icon: "✅" },
  { key: "planten", label: "Planten", icon: "🪴" },
  { key: "naslag", label: "Naslag", icon: "📖" },
  { key: "instellingen", label: "Instellingen", icon: "⚙️" },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

export function Phone({
  active,
  children,
}: {
  active: NavKey;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-[280px] rounded-[2.25rem] bg-[linear-gradient(160deg,#2f362b,#12160f)] p-3 shadow-xl">
      <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-black/40" />
      <div className="overflow-hidden rounded-[1.65rem] bg-background">
        <div className="p-3.5 text-[13px]">{children}</div>
        <div className="flex border-t border-border-soft bg-surface">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.key}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-medium ${
                item.key === active ? "text-accent" : "text-muted"
              }`}
            >
              <span aria-hidden className="text-sm leading-none">
                {item.icon}
              </span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A small numbered marker, positioned on the corner of whatever it's placed inside (parent needs `relative`). */
export function Pin({ n, side = "right" }: { n: number; side?: "left" | "right" }) {
  return (
    <span
      className={`absolute -top-2 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-background ${
        side === "right" ? "-right-2" : "-left-2"
      }`}
    >
      {n}
    </span>
  );
}

export function CalloutList({ children }: { children: ReactNode }) {
  return <ol className="mt-4 flex flex-col gap-3">{children}</ol>;
}

export function Callout({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
        {n}
      </span>
      <p className="text-sm leading-relaxed text-muted">{children}</p>
    </li>
  );
}
