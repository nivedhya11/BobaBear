/**
 * IMP-036J Tranche 7 reporting calendar.
 *
 * Half-open 28 civil-day window in Asia/Kolkata. Occurrence membership is
 * evaluated against stored fact timestamps, not against this helper.
 */
export const MEASUREMENT_CALENDAR_TIMEZONE = "Asia/Kolkata";
export const REPORT_WINDOW_CIVIL_DAYS = 28;

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

export type MeasurementReportWindow = Readonly<{
  windowStart: Date;
  windowEnd: Date;
  reportAsOf: Date;
}>;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function istWall(instant: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
} {
  const shifted = new Date(instant.getTime() + IST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    millisecond: shifted.getUTCMilliseconds(),
  };
}

function fromIstWall(input: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}): Date {
  return new Date(
    Date.UTC(
      input.year,
      input.month - 1,
      input.day,
      input.hour,
      input.minute,
      input.second,
      input.millisecond,
    ) - IST_OFFSET_MS,
  );
}

function addCalendarDays(
  year: number,
  month: number,
  day: number,
  days: number,
): { year: number; month: number; day: number } {
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function addCivilDaysInKolkata(anchor: Date, days: number): Date {
  const wall = istWall(anchor);
  const next = addCalendarDays(wall.year, wall.month, wall.day, days);
  return fromIstWall({ ...wall, ...next });
}

export function initialMeasurementWindow(input: {
  productionReleaseAnchor: Date;
  reportAsOf?: Date;
}): MeasurementReportWindow {
  const windowStart = input.productionReleaseAnchor;
  const windowEnd = addCivilDaysInKolkata(
    windowStart,
    REPORT_WINDOW_CIVIL_DAYS,
  );
  return {
    windowStart,
    windowEnd,
    reportAsOf: input.reportAsOf ?? windowEnd,
  };
}

export function formatIstCivilDate(instant: Date): string {
  const wall = istWall(instant);
  return `${wall.year}-${pad2(wall.month)}-${pad2(wall.day)}`;
}
