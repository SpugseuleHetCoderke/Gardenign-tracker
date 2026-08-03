/** Shared Dutch/Belgian formatting, so dates look the same on every screen. */

export const dateFmt = new Intl.DateTimeFormat("nl-BE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const longDateFmt = new Intl.DateTimeFormat("nl-BE", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export const MONTHS_NL = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

export const MONTHS_NL_SHORT = [
  "jan",
  "feb",
  "mrt",
  "apr",
  "mei",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "dec",
];

/**
 * "april – juni", or "november – februari" for a window that wraps the new
 * year. Returns null when the window isn't filled in.
 */
export function monthRange(
  from: number | null | undefined,
  to: number | null | undefined,
): string | null {
  if (!from && !to) return null;
  if (from && !to) return `vanaf ${MONTHS_NL[from - 1]}`;
  if (!from && to) return `tot ${MONTHS_NL[to - 1]}`;
  if (from === to) return MONTHS_NL[from! - 1];
  return `${MONTHS_NL[from! - 1]} – ${MONTHS_NL[to! - 1]}`;
}

/** True when `month` (1-12) falls inside the window, handling year wrap. */
export function monthInRange(
  month: number,
  from: number | null | undefined,
  to: number | null | undefined,
): boolean {
  if (!from || !to) return false;
  return from <= to
    ? month >= from && month <= to
    : month >= from || month <= to;
}
