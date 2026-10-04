import { describe, expect, it } from "vitest";

import {
  addCivilDaysInKolkata,
  formatIstCivilDate,
  initialMeasurementWindow,
  MEASUREMENT_CALENDAR_TIMEZONE,
  REPORT_WINDOW_CIVIL_DAYS,
} from "./report-window";

describe("IMP-036J tranche 7 measurement window", () => {
  it("T7-WINDOW-01 uses 28 civil days in Asia/Kolkata from the supplied anchor", () => {
    const anchor = new Date("2026-01-01T18:30:00.000Z");
    const window = initialMeasurementWindow({
      productionReleaseAnchor: anchor,
    });
    expect(MEASUREMENT_CALENDAR_TIMEZONE).toBe("Asia/Kolkata");
    expect(REPORT_WINDOW_CIVIL_DAYS).toBe(28);
    expect(window.windowStart.toISOString()).toBe(anchor.toISOString());
    expect(formatIstCivilDate(window.windowStart)).toBe("2026-01-02");
    expect(formatIstCivilDate(window.windowEnd)).toBe("2026-01-30");
    expect(window.windowEnd.toISOString()).toBe("2026-01-29T18:30:00.000Z");
    expect(window.reportAsOf.toISOString()).toBe(window.windowEnd.toISOString());
    expect(addCivilDaysInKolkata(anchor, 28).toISOString()).toBe(
      window.windowEnd.toISOString(),
    );
  });

  it("T7-WINDOW-01 keeps the Kolkata wall clock, not a UTC-day rollover", () => {
    const anchor = new Date("2026-03-08T02:15:30.250Z");
    const window = initialMeasurementWindow({
      productionReleaseAnchor: anchor,
    });
    expect(window.windowEnd.toISOString()).toBe("2026-04-05T02:15:30.250Z");
  });
});
