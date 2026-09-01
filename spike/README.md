# Spike: TanStack Start vs. the seamless-MPA concept

Throwaway. Answers
[#12](https://github.com/s0h311/liamfunk-de/issues/12) on
[Map: a rare, interactive liamfunk.de](https://github.com/s0h311/liamfunk-de/issues/1).
**Nothing here is the site.** It lives only on the `spike/mpa-view-transitions` branch and is
never merged; delete the branch once the answer stops being useful.

## What it is

Two real URLs — `/spike/a` and `/spike/b` — rendered by the app's own router and SSR, carrying:

- a shared element (`view-transition-name: spike-card` / `spike-title`) on both pages,
- `@view-transition { navigation: auto; }` in `<head>` (via the route's `head.styles`),
- state read from the query string with `validateSearch`, printed into the markup,
- four ways out of each page: a plain `<a>`, a plain `<a>` with `?query`, a plain `<a>` with
  `#hash`, and a TanStack `<Link>`.

Each navigation style is then measured, rather than reasoned about.

## Results

Every result below reproduces identically on `pnpm dev` and on a production build
(`node .output/server/index.mjs`), in Chromium 148.

| Question | Answer |
| --- | --- |
| Content readable with JS off | **Yes** — headings, body copy and query-derived state are all in the HTML; links navigate |
| Plain `<a>` intercepted by the router | **No** — new document every time; the router installs no global click handler |
| Cross-document view transition fires | **Yes** — `pageswap` and `pagereveal` both carry a `viewTransition` |
| Shared elements actually morph | **Yes** — `::view-transition-old/new/group(spike-card)` and `(spike-title)` animate |
| TanStack `<Link>` | Same document, no `pagereveal`, no transition — the single-document path, chosen per link |
| URL state in `?query`, server-side | **Yes** — `validateSearch` runs on the server and the value is in the SSR'd HTML |
| URL state in `#hash` | **Never reaches the server** — the document request carries no fragment |
| `prefers-reduced-motion` | Does **not** suppress the transition; the same animations run |

## Re-run it

```sh
pnpm dev                                   # or: pnpm build && node .output/server/index.mjs
node spike/probe-1-ssr-and-nav.mjs         # no-JS pass, plain <a>, ?query, #hash
node spike/probe-2-anchor-vs-link.mjs      # <a> vs <Link>, hydration errors
node spike/probe-3-transition-runs.mjs     # pageswap/pagereveal, pseudo-elements, reduced motion
```

`SPIKE_BASE=http://localhost:3100` points them at a production server on another port.

Needs Playwright's Chromium (`node node_modules/.pnpm/playwright@*/node_modules/playwright/cli.js
install chromium`) plus its system libraries — which this sandbox lacks and cannot `apt-get install`
without root. Working around that: `apt-get download` the libraries listed by the launch error,
`dpkg -x` them into a directory, and put every directory holding a `.so` on `LD_LIBRARY_PATH`.

## Two things that bit, unrelated to the question

- **`validateSearch` shapes the canonical URL.** Returning `null` for an absent param makes the
  server 307-redirect `/spike/a` → `/spike/a?pane=null&open=null`. Return `undefined`.
- **`pnpm build` fails roughly every other run**, on `main` too: rolldown reports
  `Could not create directory for output chunks: … File exists (os error 17)` whenever it has to
  create an output directory that isn't there yet. Re-running succeeds, because by then it exists.

## Delete it

```sh
rm -rf spike app/pages/spike.a.tsx app/pages/spike.b.tsx
```
