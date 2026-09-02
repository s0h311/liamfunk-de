# The hard screens: how a prototype is actually tested

Three screens decide whether a concept for [liamfunk.de](https://github.com/s0h311/liamfunk-de/issues/1)
survives. They are **eliminating, not scoring**: a concept that fails one is out regardless of how
good it looks.

- **S1 — a semantic document underneath.** Server-rendered, text-bearing, readable without JS.
- **S2 — touch is a first-class target.** No hover- or cursor-velocity-dependence.
- **S3 — weird, but never blocking.** Anyone who wants Liam's email or his work gets there fast and
  obviously.

Plus two cross-cutting checks: the **anti-target checklist** and the **reduced-motion floor**.

This file is the protocol. It exists because a screen with no way to fail it is decorative —
automated accessibility tooling covers roughly a third of WCAG AA, and S2 and S3 live almost
entirely in the manual remainder. Decided in
[How the hard screens actually get tested](https://github.com/s0h311/liamfunk-de/issues/13).

## Who runs what, when

| | Round one (six, cheap) | The cut (batched) | Round two (two finalists) |
| --- | --- | --- | --- |
| **S1** no-JS | agent self-serves | — | re-run |
| **S2** touch | — | Liam, one ~30-min iPhone sitting | re-run |
| **S3** never-blocking | agent: interaction count | Liam: first-viewport | re-run |
| **Anti-targets** | agent declares hits | Liam adjudicates fatality | re-run |
| **Reduced-motion** | stated in writing | — | implemented |

Six prototypes times a full manual protocol is the thing that quietly stops happening, so the work
is split by who *can* run it. An agent has no phone; Liam does. The touch pass is **one batched
sitting across all six at once**, feeding [The cut](https://github.com/s0h311/liamfunk-de/issues/21) —
not six separate sessions.

**Two roles the building agent does not hold.** It runs the S3 *interaction count* (device-independent,
checkable on desktop) and asserts the first-viewport claim, but Liam verifies the first-viewport half
on the phone. And it only *declares* anti-target hits: fatality is adjudicated by Liam, because an
agent has an obvious incentive to rule its own signature interaction not-an-anti-target.

## S1 — the no-JS pass

`curl` proves strings are in the HTML. It does not prove the page is readable: a concept can
server-render every word and still position it off-screen or leave it invisible until JS mounts,
which passes `curl` and fails a crawler and a human alike.

**Two steps. The second one is the verdict.**

1. **Fast check** — `curl -s localhost:3000/proto/<slug>`. The words are in the served HTML, and
   every navigation destination is a real `href`.
2. **Verdict** — a real browser with JavaScript disabled. The page must be **readable and
   navigable**, not merely contain the strings.

**Fails on:**

- Words present only inside a `<template>`, a JSON blob, or a script payload.
- Navigation that is `<button>` or `<div onclick>` rather than `<a href>`.
- Content that needs JS to become *visible* (off-screen until mount, `opacity: 0` until an
  animation runs, a height-0 container that JS expands).
- State that lives in the hash — the hash never reaches the server, so a URL-as-state concept
  silently fails this screen.

**The bar, in one sentence:** a reader who sees only this can learn what Liam does, read the tabley
case study, and find `hi@liamfunk.de`.

## S2 — the touch pass

**Real device, not devtools emulation.** Emulation misses exactly the touch and webview behaviour
that matters.

**Devices: a real iPhone, in two environments.**

- **Safari.**
- **The LinkedIn in-app browser.** A `WKWebView` — the most likely first-visit environment for a
  personal site shared as a link, and the worst-case audio environment. Essentially nobody tests it.

Open `/proto` via the **Network** URL `pnpm dev` prints, with the phone on the same Wi-Fi.

**Chrome on Android is a permanently accepted gap.** No Android device is available; the risk is
that a Chrome-only failure surfaces after the concept is locked, and that price has been accepted
consciously rather than papered over with emulation.

**What is looked for, beyond "it responds":**

- [ ] Tap targets at least 44x44 px.
- [ ] Nothing reachable only by hover — anything a cursor reveals, a tap must also reveal.
- [ ] No **sticky-hover trap**: a tapped element that keeps its hover state afterwards.
- [ ] Text legible without pinch-zoom.
- [ ] No horizontal scroll leak.
- [ ] The signature interaction is **discoverable** without an instruction line telling you to hover.

## S3 — the never-blocking pass

"Fast and obviously" fails no prototype, and a stopwatch alone is too weak: a tester who already
knows where the email is will always be fast. So there are **two criteria, both hard fails.**

**1. Count.** From cold load on the phone, **without completing any part of the signature
interaction**:

- [ ] `hi@liamfunk.de` reachable in **2 interactions or fewer**.
- [ ] The work reachable in **2 interactions or fewer**.

**2. Visibility.** The affordance is in the **first viewport**:

- [ ] No scroll-to-discover.
- [ ] No "press ? for help".
- [ ] No learning the metaphor first.
- [ ] **Fail if the tester had to read an instruction.**

Run it as a proxy for a recruiter who has never seen the site. At round two, with only two
candidates, one genuinely unaided outsider is cheap and worth it.

## The anti-target checklist

From Part 1 of
[the landscape survey](https://github.com/s0h311/liamfunk-de/issues/2) — patterns whose *presence*
says "template" or "trend-follow" regardless of execution quality.

**Declare, don't dodge.** Each prototype **names every hit and justifies it** in its resolution.
Silently avoiding them is not the point; knowing where you are is.

**Fatality is about position, not presence.** An anti-target is **fatal when it *is* the signature
interaction**, and merely a caution anywhere else. A scroll-progress bar is not what makes a site
derivative; a WebGL hero *as the concept* is.

**The list:**

- [ ] WebGL / shader hero
- [ ] Custom cursor
- [ ] Scroll-jacking or a smooth-scroll library
- [ ] Scroll-triggered reveal (fade-up, stagger, split-text)
- [ ] Infinite marquee
- [ ] OS / desktop-metaphor portfolio
- [ ] Terminal / CLI portfolio
- [ ] 3D drive-around portfolio
- [ ] Multiplayer live cursors
- [ ] Digital garden
- [ ] Counting-percentage preloader
- [ ] "Enter" splash gate
- [ ] Horizontal-scroll project shelf
- [ ] Oversized display type over a 12-column grid with 10px uppercase labels
- [ ] Film grain / noise overlay
- [ ] Duotone-on-hover image grid
- [ ] Magnetic buttons, spring hovers
- [ ] Animated dark-mode toggle
- [ ] Scroll-progress bar
- [ ] `Cmd+K` command palette on a five-page site
- [ ] The `/now` + `/uses` + "currently listening" Spotify widget triad
- [ ] "Ask my resume" AI chatbot
- [ ] Background ambient loop with a mute button
- [ ] Hover blips
- [ ] Waveform visualiser over a track

## The reduced-motion floor

**Reduced sound is closed by construction.** There is no `prefers-reduced-sound`, and none is
needed: sound is opt-in and never autoplays, so **the opt-in is the control**.

**Reduced motion is a floor, not a style.**

> `prefers-reduced-motion: reduce` may remove transitions. It may never remove **information**.

If the signature interaction conveys meaning through motion, it owes a **static equivalent that
conveys the same meaning**. This is the same artifact the no-JS screen already demands (an SSR'd
static figure), so a concept pays for it once and satisfies both.

The platform opts out of nothing on its own — the
[spike](https://github.com/s0h311/liamfunk-de/issues/12) established that `prefers-reduced-motion`
suppresses no view transition by itself. Every transition needs a hand-written media query.

**Staging:** round one **states** its reduced-motion story in writing. Round two **implements** it.

## When a prototype fails

Prototypes are deliberately rough throwaway sketches, so a failure means one of two different
things. Liam judges which at the phone session.

- **Inherent to the concept** — it depends on hover; the metaphor must be learned before the email
  is reachable; the content cannot exist without JS. → **Eliminated, before the cut.**
- **An artifact of a rough sketch** — a tap target too small, a missing `href` on one link.
  → **Logged and carried into the cut as a known cost**, not a death.

## Reporting

Every round-one resolution carries, per screen, **evidence rather than assertion**: the `curl`
output or what the JS-disabled browser showed, the interaction counts with the path taken, the
named anti-target hits with their justification, and the reduced-motion story in prose.
