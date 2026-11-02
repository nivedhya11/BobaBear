# First-party UI fonts

Self-hosted latin WOFF2 subsets for deterministic CI and production builds via
`next/font/local` in `src/app/layout.tsx` (assets in `src/shared/brand-fonts`).

This removes build-time Google Fonts network fetches that intermittently fail
Next's Google font loader (`TypeError: Cannot read properties of null (reading '1')`
in `@next/font` `google/loader.js`).

Brand families, CSS variables, weights, and roles are unchanged:

| Family | Role | Variable | Weights | License file |
|---|---|---|---|---|
| Luckiest Guy | Display | `--font-display` | 400 | `license-luckiest-guy.txt` (Apache-2.0) |
| Bubblegum Sans | Heading | `--font-heading` | 400 | `license-bubblegum-sans.txt` (OFL-1.1) |
| Nunito | Body / UI | `--font-body` | 400, 600, 700 | `license-nunito.txt` (OFL-1.1) |
| JetBrains Mono | Mono | `--font-mono` | 400 | `license-jetbrains-mono.txt` (OFL-1.1) |

## Provenance

Latin WOFF2 binaries are byte-identical to `@fontsource/*@5.3.0` redistributions of
the upstream Google Fonts / project releases (verified 2026-10-30):

| File | npm package | Upstream file | SHA-256 |
|---|---|---|---|
| `LuckiestGuy-latin-400.woff2` | `@fontsource/luckiest-guy@5.3.0` | `luckiest-guy-latin-400-normal.woff2` | `3877b5221817…` |
| `BubblegumSans-latin-400.woff2` | `@fontsource/bubblegum-sans@5.3.0` | `bubblegum-sans-latin-400-normal.woff2` | `eb8731f38a9a…` |
| `Nunito-latin-400.woff2` | `@fontsource/nunito@5.3.0` | `nunito-latin-400-normal.woff2` | `a5906e15ceb6…` |
| `Nunito-latin-600.woff2` | `@fontsource/nunito@5.3.0` | `nunito-latin-600-normal.woff2` | `45f437de32ff…` |
| `Nunito-latin-700.woff2` | `@fontsource/nunito@5.3.0` | `nunito-latin-700-normal.woff2` | `fa89300b9bbb…` |
| `JetBrainsMono-latin-400.woff2` | `@fontsource/jetbrains-mono@5.3.0` | `jetbrains-mono-latin-400-normal.woff2` | `14425ba9c695…` |

License texts are vendored beside the binaries. `@fontsource` packages are **not**
runtime dependencies; only the redistributed font files and licenses are vendored.

## CSP

First-party app fonts remain `font-src 'self'`. D-376 Maps UI hosts
(`fonts.googleapis.com` style-src / `fonts.gstatic.com` font-src) are unchanged and
are not used for these application fonts.
