---
Status: HISTORICAL SUPPORTING EVIDENCE
Last updated: 2026-10-05
---

# Canonical authority history

## Status

`HISTORICAL SUPPORTING EVIDENCE`

## Purpose

Preserve exact prior canonical authority snapshots after CURRENT-context compression of
[`../ROADMAP.md`](../ROADMAP.md) and [`../STATE.md`](../STATE.md).

Historical files in this directory are **not** current lifecycle authority. They preserve
immutable prior governance / acceptance / provenance evidence so it remains queryable and
fingerprint-protected.

## Current truth

| Question | Authority |
|---|---|
| IMP identity / sequence / lifecycle | [`../ROADMAP.md`](../ROADMAP.md) |
| Accepted / current reality | [`../STATE.md`](../STATE.md) |

Never infer current product position from a historical snapshot. Accepted history remains
immutable; CURRENT metadata and CURRENT position sections override any historical narrative.

## Pre-compression source identity

```text
source commit:  33a226a18e4e9428c07233990d026541418f0860
source tree:    1c8e0b66fe0b59dcd8b00dde73075419defe85bd
```

GOV-2 cutover snapshots are exact copies of CURRENT ROADMAP/STATE at
`06f82145d9625da83b2597a67e948759fdcfe9ef` / tree `21cd355ab77c64111d660dbc0dd9258e12939d1c`.

| Snapshot | Source version | Source blob |
|---|---|---|
| [`ROADMAP-GTM-R113-pre-compression.md`](./ROADMAP-GTM-R113-pre-compression.md) | GTM-R113 | `35a58c93095713c173f0b1e455125bd6854a34b8` |
| [`STATE-STATE-R111-pre-compression.md`](./STATE-STATE-R111-pre-compression.md) | STATE-R111 | `748c3b615fe9b93f91ff573f88548223b9ba1d0d` |
| [`ROADMAP-GTM-R188-pre-gov2.md`](./ROADMAP-GTM-R188-pre-gov2.md) | GTM-R188 | `5dad28bc140426e082c2889b860a6300fee8eb4b` |
| [`STATE-STATE-R186-pre-gov2.md`](./STATE-STATE-R186-pre-gov2.md) | STATE-R186 | `8da316e4de4d338a25b7a5c3a1c931307ff890f9` |

These snapshot files are exact byte-for-byte copies of the named base commit paths. Do not add
headers, notices, or whitespace to the snapshot files themselves.

## Reading policy

1. Read CURRENT [`../ROADMAP.md`](../ROADMAP.md) and [`../STATE.md`](../STATE.md) first.
2. Read historical snapshots only when historical acceptance, provenance, revision semantics, or
   old checkpoint evidence is materially required.
3. Never treat a historical snapshot as current lifecycle authority.
4. Accepted history remains immutable; do not rewrite snapshot bytes.
