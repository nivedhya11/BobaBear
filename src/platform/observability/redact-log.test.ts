import { describe, expect, it } from "vitest";

import { redactLogObject } from "./redact-log";

const SENTINEL = "DO_NOT_LEAK_THIS_SECRET_74291";

describe("redactLogObject", () => {
  it("redacts sensitive keys and auth-shaped values deeply", () => {
    const redacted = redactLogObject({
      requestId: "req-1",
      headers: {
        authorization: `Bearer ${SENTINEL}`,
        apiToken: SENTINEL,
      },
      nested: {
        sessionToken: SENTINEL,
        safe: "visible",
      },
    }) as Record<string, unknown>;

    expect(redacted.requestId).toBe("req-1");
    expect(JSON.stringify(redacted)).not.toContain(SENTINEL);
    expect((redacted.nested as Record<string, unknown>).safe).toBe("visible");
  });

  it("redacts sensitive keys inside arrays and auth-shaped values on ordinary keys", () => {
    const redacted = redactLogObject({
      notes: [
        { password: SENTINEL, label: "kept" },
        `Bearer ${SENTINEL}`,
        "plain-array-text",
      ],
      note: `Bearer ${SENTINEL}`,
      header: `Basic ${SENTINEL}`,
      lower: `bearer ${SENTINEL}`,
      count: 2,
      ok: true,
      empty: null,
    }) as {
      notes: Array<Record<string, unknown> | string>;
      note: string;
      header: string;
      lower: string;
      count: number;
      ok: boolean;
      empty: null;
    };

    expect(redacted.notes[0]).toEqual({ password: "[REDACTED]", label: "kept" });
    expect(redacted.notes[1]).toBe("[REDACTED]");
    expect(redacted.notes[2]).toBe("plain-array-text");
    expect(redacted.note).toBe("[REDACTED]");
    expect(redacted.header).toBe("[REDACTED]");
    expect(redacted.lower).toBe("[REDACTED]");
    expect(redacted.count).toBe(2);
    expect(redacted.ok).toBe(true);
    expect(redacted.empty).toBeNull();
    expect(JSON.stringify(redacted)).not.toContain(SENTINEL);
  });

  it("replaces circular references and still serializes", () => {
    const self: Record<string, unknown> = { name: "self", safe: "visible" };
    self.self = self;
    const selfOut = redactLogObject(self) as Record<string, unknown>;
    expect(selfOut.self).toBe("[REDACTED]");
    expect(selfOut.safe).toBe("visible");
    expect(() => JSON.stringify(selfOut)).not.toThrow();

    const left: Record<string, unknown> = { name: "a" };
    const right: Record<string, unknown> = { name: "b" };
    left.other = right;
    right.other = left;
    const mutual = redactLogObject(left) as {
      name: string;
      other: { name: string; other: string };
    };
    expect(mutual.name).toBe("a");
    expect(mutual.other.name).toBe("b");
    expect(mutual.other.other).toBe("[REDACTED]");
    expect(() => JSON.stringify(mutual)).not.toThrow();
  });

  it("bounds depth, object key count, and array length", () => {
    const deep: unknown = { leak: SENTINEL };
    let capped: unknown = { marker: "visible-at-cap", child: deep };
    for (let index = 0; index < 12; index += 1) capped = { child: capped };
    const depthOut = redactLogObject(capped) as Record<string, unknown>;
    let cursor = depthOut;
    for (let index = 0; index < 12; index += 1) {
      cursor = cursor.child as Record<string, unknown>;
    }
    expect(cursor.marker).toBe("visible-at-cap");
    expect(cursor.child).toBe("[REDACTED]");
    expect(JSON.stringify(depthOut)).not.toContain(SENTINEL);

    const wide: Record<string, unknown> = {};
    for (let index = 0; index < 65; index += 1) {
      const key = `k${String(index).padStart(2, "0")}`;
      if (index === 0) wide[key] = { password: SENTINEL };
      else if (index === 64) wide[key] = SENTINEL;
      else wide[key] = `value-${index}`;
    }
    const wideOut = redactLogObject(wide) as Record<string, unknown>;
    expect(Object.keys(wideOut)).toHaveLength(64);
    expect(wideOut.k64).toBeUndefined();
    expect(wideOut.k63).toBe("value-63");
    expect((wideOut.k00 as Record<string, unknown>).password).toBe("[REDACTED]");
    expect(JSON.stringify(wideOut)).not.toContain(SENTINEL);

    const entries: unknown[] = Array.from({ length: 65 }, (_, index) => `n-${index}`);
    entries[0] = { password: SENTINEL };
    entries[63] = "kept-last";
    entries[64] = SENTINEL;
    const arrayOut = redactLogObject(entries) as Array<Record<string, unknown> | string>;
    expect(arrayOut).toHaveLength(64);
    expect(arrayOut[0]).toEqual({ password: "[REDACTED]" });
    expect(arrayOut[63]).toBe("kept-last");
    expect(JSON.stringify(arrayOut)).not.toContain(SENTINEL);
  });
});
