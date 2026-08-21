import { describe, it, expect } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate()", () => {
  it("writes the month out in full", () => {
    expect(formatDate(new Date("2026-08-10"))).toBe("August 10, 2026");
  });

  it("renders a midnight UTC date as that day, not the day before", () => {
    expect(formatDate(new Date("2025-09-15"))).toBe("September 15, 2025");
  });
});
