import { describe, expect, it } from "vitest";
import { monthInRange, monthRange } from "./format";

describe("monthRange", () => {
  it("returns null when both bounds are missing", () => {
    expect(monthRange(null, null)).toBeNull();
    expect(monthRange(undefined, undefined)).toBeNull();
  });

  it("formats a normal same-year window", () => {
    expect(monthRange(4, 6)).toBe("april – juni");
  });

  it("collapses a single-month window to just that month", () => {
    expect(monthRange(7, 7)).toBe("juli");
  });

  it("handles an open-ended 'from' with no 'to'", () => {
    expect(monthRange(9, null)).toBe("vanaf september");
  });

  it("handles an open-ended 'to' with no 'from'", () => {
    expect(monthRange(null, 4)).toBe("tot april");
  });

  it("formats a window that wraps the new year the same as any other range", () => {
    expect(monthRange(11, 2)).toBe("november – februari");
  });
});

describe("monthInRange", () => {
  it("is false when either bound is missing", () => {
    expect(monthInRange(6, null, 8)).toBe(false);
    expect(monthInRange(6, 4, null)).toBe(false);
  });

  it("checks inclusively within a normal window", () => {
    expect(monthInRange(4, 4, 6)).toBe(true);
    expect(monthInRange(6, 4, 6)).toBe(true);
    expect(monthInRange(5, 4, 6)).toBe(true);
    expect(monthInRange(3, 4, 6)).toBe(false);
    expect(monthInRange(7, 4, 6)).toBe(false);
  });

  it("handles a window that wraps the new year", () => {
    // November through February: Dec/Jan/Feb are in, June is not.
    expect(monthInRange(12, 11, 2)).toBe(true);
    expect(monthInRange(1, 11, 2)).toBe(true);
    expect(monthInRange(2, 11, 2)).toBe(true);
    expect(monthInRange(11, 11, 2)).toBe(true);
    expect(monthInRange(6, 11, 2)).toBe(false);
  });
});
