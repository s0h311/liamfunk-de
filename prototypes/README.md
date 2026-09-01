# Prototypes

Throwaway sketches for the concept comparison on
[Map: a rare, interactive liamfunk.de](https://github.com/s0h311/liamfunk-de/issues/1).

**These are not the site.** Nothing here is imported by `app/` except the two route files that
serve them. The winner gets rebuilt properly; everything here is meant to be deleted.

## Add one

Copy `_placeholder/` and rename it. The directory name is the URL slug.

```
prototypes/<slug>/index.tsx      ← required: default-export the sketch, named-export `meta`
prototypes/<slug>/<anything>     ← whatever else the sketch needs, kept local to it
```

```tsx
import type { PrototypeMeta } from '../types'

export const meta: PrototypeMeta = {
  title: 'Terminal front door',
  positioning: 'calling-card',
  note: 'Can a command line be the whole navigation without blocking anyone?',
}

export default function TerminalFrontDoor() {
  return <main>…</main>
}
```

No registration step: `registry.ts` globs `./*/index.tsx`, so a new directory appears on the index
by itself. Tailwind is available (`app/index.css` is imported by the root document).

## Look at one

```sh
pnpm dev
```

- Index: <http://localhost:3000/proto>
- A sketch: `http://localhost:3000/proto/<slug>`

**On a phone** — required, touch is a first-class target. Vite binds `0.0.0.0` (see
`vite.config.ts`), so it prints a **Network** URL like `http://192.168.x.x:3000` alongside the
local one. Open `/proto` there with the phone on the same Wi-Fi. If no Network URL appears, the
machine's firewall is blocking port 3000.

## The two rules

1. **Server-render the content.** Every sketch is SSR'd by the same stack the real site would use,
   and the registry imports sketches eagerly so there is no Suspense boundary hiding the fact.
   A sketch is only a fair test of the SEO/GEO hard screen if its text is in the HTML — check with
   `curl -s localhost:3000/proto/<slug>`, or with JavaScript disabled in devtools.
2. **Keep it local to your directory.** Sketches are globbed eagerly and share one dev server, so a
   file that doesn't compile takes the whole index down with it. Don't reach into `app/` or
   `server/`, and don't share code between sketches — copy it.

A sketch that *throws* is contained: its own page shows the stack and every other sketch keeps
working. Note that React abandons SSR for that page and recovers on the client, so a throwing
sketch is also a sketch you can't judge against rule 1 until it stops throwing.

## Delete them all

```sh
rm -rf prototypes app/pages/proto.index.tsx 'app/pages/proto.$slug.tsx'
```

That is the entire footprint.
