import { monthInRange, MONTHS_NL_SHORT } from "@/lib/format";

/**
 * A twelve-cell year strip with the given window highlighted, and the current
 * month outlined. Much faster to read at a glance than "april – juni".
 */
export default function MonthBar({
  from,
  to,
  currentMonth,
}: {
  from: number | null;
  to: number | null;
  currentMonth: number;
}) {
  return (
    <ol className="mt-1 flex gap-px" aria-hidden>
      {MONTHS_NL_SHORT.map((label, i) => {
        const month = i + 1;
        const inWindow = monthInRange(month, from, to);
        const isNow = month === currentMonth;

        return (
          <li
            key={label}
            className={`flex-1 rounded-sm py-1 text-center text-[10px] leading-none ${
              inWindow ? "bg-accent text-white" : "bg-border-soft text-muted"
            } ${isNow ? "ring-2 ring-foreground/40" : ""}`}
          >
            {label.charAt(0)}
          </li>
        );
      })}
    </ol>
  );
}
