# The landscape: what's already common vs genuinely rare

- **Ticket:** https://github.com/s0h311/liamfunk-de/issues/2
- **Map:** https://github.com/s0h311/liamfunk-de/issues/1
- **Date:** 2026-09-01
- **Status:** research findings, not a decision

This file answers: against the current state of personal/portfolio sites, which "creative" patterns
have become stock (and therefore read as template work rather than craft), and which interaction
models, navigation structures and site concepts are still genuinely seldom attempted. Every rare
pattern is judged explicitly against the map's three hard screens so the next ticket can shortlist
from it directly.

**Sourcing note.** Every named example below was opened and checked on 2026-09-01; claims about what
a site does are from the site itself, and specs are quoted from w3.org / MDN / Chrome developer docs
rather than from write-ups about them. Entries where I could *not* find a real flagship example are
marked **UNDER-VERIFIED** in place, and that absence is reported rather than papered over. See
[Part 6](#part-6--verification-log) for what was checked directly.

---

## How to read this

The map's three hard screens, used as the verdict axis throughout:

- **S1 — SEO/GEO.** A server-rendered, semantic, text-bearing document must exist underneath. Content
  readable with client JS off. Canvas-only or JS-gated content is rejected on sight.
- **S2 — Touch is first-class.** No dependence on hover, cursor velocity, cursor position, or window
  resizing. Two specs bind here:
  - *Dragging Movements (2.5.7):* "Some people cannot perform dragging movements in a precise manner.
    Others use a specialized or adapted input device… which may make dragging cumbersome and
    error-prone… An alternative method must be provided"
    ([WCAG 2.2 Understanding 2.5.7, primary](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)).
  - *Target Size (2.5.8):* "The requirement is for targets to be at least 24 by 24 CSS pixels in size"
    with five exceptions ([Understanding 2.5.8, primary](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
  - *Reflow (1.4.10)* also constrains any 2D layout: content must work "without requiring scrolling in
    two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal
    scrolling content at a height equivalent to 256 CSS pixels… Except for parts of the content which
    require two-dimensional layout for usage or meaning"
    ([Understanding 1.4.10, primary](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)).
- **S3 — Weird, never blocking.** Someone who wants Liam's email or his work gets there fast and
  obviously. The vestibular constraint sits here too: "if scrolling a page causes elements to move
  (other than the essential movement associated with scrolling) it can trigger vestibular disorders…
  Another animation that is often non-essential is parallax scrolling"
  ([Understanding 2.3.3 Animation from Interactions, primary](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).

A number worth holding onto for the **hiring-first** positioning: recruiting write-ups converge on
~30 seconds or less of portfolio attention before a keep/discard decision, and a majority of hiring
managers say the absence of a portfolio site wouldn't have hurt the candidate anyway
([scale.jobs, secondary](https://scale.jobs/blog/portfolio-content-for-tech-jobs-what-recruiters-want),
[Python in Plain English, secondary](https://python.plainenglish.io/portfolio-building-github-vs-personal-website-vs-case-studies-strategy-1ca111319e3e)).
So a hiring-first concept cannot spend its budget on the experience — the experience has to *be* the
evidence, or it's dead weight.

---

## Part 1 — Now common (anti-targets)

These are the patterns whose *presence* tells a visitor "template" or "trend-follow", regardless of
execution quality. Each entry: where it's endemic, and the **tell** — the specific thing that trips
recognition.

**The structural evidence.** Awwwards maintains dedicated, multi-page browse collections for exactly
these techniques — WebGL (5+ pages of winners), 3D, GSAP, CSS animations, Scrolling, Parallax,
Transitions, Framer, Webflow — verified directly at
[awwwards.com/websites/webgl/](https://www.awwwards.com/websites/webgl/) and
[awwwards.com/websites/scrolling/](https://www.awwwards.com/websites/scrolling/). When a technique
has its own permanent gallery filter with hundreds of entries, it is not a differentiator.

### 1.1 The WebGL / shader hero
Full-bleed animated gradient mesh, fluid-sim blob, or noise-displaced image plane behind the name.
**Endemic to:** Awwwards/FWA submission culture (see the WebGL collection above — current entries
include Santioni Spirits by Active Theory, Colonia Zacamil by Adoratorio Studio, and dozens more),
Codrops tutorials ([Codrops WebGL portfolio walkthrough](https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/)),
creative-dev Twitter.
**Tell:** the shader is decorative and *behind* the content; it doesn't change if you change the copy.
Fails S1 outright if any actual *content* lives inside the canvas.

### 1.2 The custom cursor
Dot-plus-ring, magnetic snap to links, `mix-blend-mode: difference` inversion, trailing blob,
"flashlight" mask. **Endemic to:** every 2024–2026 trend listicle names it as a signature move
([hostadvice, secondary](https://hostadvice.com/blog/website-design/web-design-trends/),
[thewebfactory, secondary](https://www.thewebfactory.us/blogs/25-stunning-interactive-website-examples-design-trends/)).
**Tell:** it exists on desktop only and does nothing on touch — an S2 failure, so it's an anti-target
twice over.

### 1.3 Scroll-jacking and smooth-scroll libraries
Lenis/Locomotive inertia, pinned sections, scroll-driven "chapters" that steal the wheel.
**Endemic to:** award-site culture specifically — Awwwards has a permanent
[Scrolling collection](https://www.awwwards.com/websites/scrolling/). It draws sustained criticism as
accessibility-hostile and motion-sickness-inducing
([DEV thread, secondary](https://dev.to/accudio/comment/14e1m)) and is listed alongside dark patterns
([SitePoint, secondary](https://www.sitepoint.com/annoying-web-dark-patterns/)).
**Tell:** your scrollbar disappears, or your two-finger flick has the wrong weight in the first second.

### 1.4 Scroll-triggered reveal (fade-up, stagger, split-text)
Every section enters. Headlines animate character-by-character.
**Endemic to:** everything. It is now a CSS platform feature rather than a skill —
`animation-timeline: view()` needs no library. (Support figure: community reporting puts scroll-driven
animations around ~82% global with Firefox still behind a flag and a named Interop 2026 priority —
[State of Web Animation 2026, secondary](https://annnimate.com/state-of-web-animation). I could not
render the caniuse table for this feature to confirm the number; treat ~82% as approximate.)
**Tell:** it costs nothing now, so it signals nothing. The critique that lands: these get "applied as a
starting point without being questioned"
([This Is Also, secondary](https://thisisalso.com/blog/every-website-looks-the-same)).

### 1.5 The infinite marquee
Endless horizontal ticker of skills, client logos or the words "AVAILABLE FOR WORK ★".
**Endemic to:** Webflow/Framer template marketplaces — it ships as a stock component
([Webflow "Infinite Logo Marquee"](https://webflow.com/made-in-webflow/website/logo-marquee-dual)).
**Tell:** the same six tech logos everyone has. It also directly triggers WCAG 2.2.2: "For any moving,
blinking or scrolling information that (1) starts automatically, (2) lasts more than five seconds, and
(3) is presented in parallel with other content, there is a mechanism for the user to pause, stop, or
hide it" ([Understanding 2.2.2 Pause, Stop, Hide, primary](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).
Almost nobody ships the pause control.

### 1.6 The OS / desktop-metaphor portfolio
Draggable windows, taskbar, start menu, macOS traffic lights.
**Endemic to:** GitHub. This is now a *genre* with a name — OSFOLIO, portfolio.os, YAPOS, plus "Aura OS"
style templates ([OSFOLIO](https://github.com/amaansyed27/OSFOLIO),
[Justinianus2001/my-portfolio](https://github.com/Justinianus2001/my-portfolio),
[lazys0ul/portfolio.os](https://github.com/lazys0ul/portfolio.os),
[YAPOS write-up, secondary](https://uncomputation.medium.com/yet-another-portfolio-operating-system-yapos-959ce97f9ee2)).
**Tell:** a taskbar. Also an S2 disaster — drag-to-move windows on a 375px viewport is the canonical
2.5.7 violation, and a windowed desktop is the canonical 1.4.10 Reflow violation.

### 1.7 The terminal / CLI portfolio
Type `whoami`, `projects`, `contact`. **Endemic to:** GitHub, again as a named genre with dozens of
public implementations and freeCodeCamp/DEV tutorials
([satnaing/terminal-portfolio](https://github.com/satnaing/terminal-portfolio),
[navnee1h/terminal-portfolio](https://github.com/navnee1h/terminal-portfolio),
[BrijenMakwana/terminal-portfolio](https://github.com/BrijenMakwana/terminal-portfolio),
[freeCodeCamp how-to, secondary](https://www.freecodecamp.org/news/how-to-create-an-interactive-terminal-portfolio-website/)).
**Tell:** a blinking block cursor and a `help` command. Fails S1 (content behind a JS REPL) and S3
(making a recruiter type a command to find an email is blocking).

### 1.8 The 3D drive-around portfolio
Post-Bruno-Simon Three.js worlds where you steer a vehicle to project markers.
**Endemic to:** the Three.js Journey alumni pipeline; there are public "I built a Bruno-Simon-inspired
portfolio in 20 days" build logs
([DEV, secondary](https://dev.to/asynchronope/i-built-bruno-simons-portfolio-in-20-days-heres-my-jakarta-street-3d-experience-2ghp)).
**Tell:** WASD hints on the loading screen.

**Correction from direct inspection.** [bruno-simon.com](https://bruno-simon.com/) is *better* than the
genre it spawned, and worth being precise about: it is not canvas-only — it ships readable HTML
(welcome copy, an options panel, control instructions, achievements, a leaderboard, and a "Behind the
Scene" section naming Three.js, Rapier and Howler.js with source on GitHub) and it supports mouse,
keyboard, **mobile touch and gamepad**. What it does *not* have is an email address; contact is a
Discord server and DM, with a note that replies may take time. The original took months on top of
years of 3D experience ([Bruno's own case study, secondary](https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b));
the copies take three weeks. That gap is exactly why the pattern stopped reading as craft.

### 1.9 Multiplayer live cursors
Other visitors' cursors floating on your page. **Endemic to:** PartyKit/Liveblocks/Ably demo culture,
now packaged as a browser extension you can bolt onto *any* URL
([partykit/sketch-voronoi](https://github.com/partykit/sketch-voronoi),
[Ably "Cursors Everywhere", secondary](https://ably.com/blog/cursor-everywhere-experiment),
[CursorParty, secondary](https://www.producthunt.com/products/cursor-party)).
**Tell:** pastel name-tag pills. Fails S2 — touch visitors have no cursor to broadcast, so they get a
degraded, mute version of the headline feature.

### 1.10 The digital garden
Bidirectional links, `[[wikilinks]]`, seedling/budding/evergreen maturity tags.
**Endemic to:** Obsidian/Quartz/Jekyll publishing; there are curated *inventories* of dozens
([MaggieAppleton/digital-gardeners](https://github.com/MaggieAppleton/digital-gardeners),
[kyrose/awesome-digital-gardens](https://github.com/kyrose/awesome-digital-gardens)).
**Tell:** a "🌱 seedling" badge. Appleton herself warns against mistaking the technical features for
the ethos ([maggieappleton.com/nontechnical-gardening](https://maggieappleton.com/nontechnical-gardening)).

### 1.11 The rest of the stock kit
Enumerated fast, because a prototype should be checkable against them: the counting-percentage
preloader; the "enter" splash gate; horizontal-scroll project shelf; oversized display type over a
12-column grid with 10px uppercase labels; film grain / noise overlay; duotone-on-hover image grid;
magnetic buttons and spring hovers; the animated dark-mode toggle; the scroll-progress bar; `Cmd+K`
command palettes on a five-page site (borrowed from editor UI —
[Positron command palette, secondary](https://positron.posit.co/command-palette.html)); the
`/now` + `/uses` + "currently listening" Spotify widget triad; and — the 2026 addition — the
"ask my résumé" AI chatbot.

**Why this list matters more than it looks.** The homogenization critique is well-documented and
predates the current crop: between 2010 and 2016 measurable design difference between sites collapsed
([OneZero, secondary](https://onezero.medium.com/its-not-just-you-websites-really-do-all-look-the-same-now-d8050b8ea743)),
with inspiration-gallery monoculture as the named mechanism
([Feed Fatigue, secondary](https://medium.com/feed-fatigue/double-dribbble-losing-out-to-homogenous-design-51393223588a)).
Doing 1.1–1.11 *very well* still lands inside the sameness. That is the whole argument for swinging at
something in Part 2.

---

## Part 2 — Genuinely rare

Each entry: **what it is** → **verified reference** → **why it's rare** → **hard-screen verdict** →
**positioning fit**.

### R1. The seamless MPA — cross-document view transitions over zero-JS content

**What it is.** A real multi-page, server-rendered site where navigation between *documents* animates
continuously (a project thumbnail morphs into the project hero) using the native cross-document View
Transitions API. No client router, no client-side content fetching — the transition is a browser
affordance layered on top of plain document navigation.

**Reference (primary).** MDN is explicit that this was previously impossible: cross-document
transitions "occur across full document unloads/reloads" and were "historically impossible on the web
before this API." The opt-in is two lines of CSS present in *both* documents:

```css
@view-transition { navigation: auto; }
```

([MDN, View Transition API, primary](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)).
caniuse reports 90.2% global support for the View Transitions API, though that page covers the
single-document form specifically ([caniuse/view-transitions, primary](https://caniuse.com/view-transitions));
cross-document reached Firefox in late 2025 per community reporting
([brainstormsandraves, secondary](https://brainstormsandraves.com/css/view-transitions-2026/)).

**Why it's rare.** Adoption lags support badly — 2026 write-ups are still framed as "you *can* now",
and the practical guides are full of gotchas
([CSS-Tricks: the gotchas nobody mentions, secondary](https://css-tricks.com/cross-document-view-transitions-part-1/)).
More decisively: the entire SPA ecosystem — including the default TanStack Start instinct — pushes
toward client routing, so almost nobody builds the MPA the feature is *for*. Keeping
`view-transition-name` values unique across pages is finicky and un-Googleable.

**Hard screens.**
- S1 **PASSES** — the most SEO-native pattern in this document; with JS off it is simply a normal
  document load.
- S2 **PASSES** — input-agnostic; nothing depends on pointer.
- S3 **PASSES** — failure mode is "no animation", never "broken page".

**Positioning.** Hiring-first and calling card. Weak as a *concept* alone — strong as the substrate
every other candidate sits on.

---

### R2. The reading interface — sidenotes, link previews, transclusion

**What it is.** Treat the document itself as the interaction. Footnotes render as margin sidenotes on
wide viewports and fall back on narrow ones; every internal link shows a rich preview on focus/tap;
sections of other pages are transcluded lazily into the current one; backlinks are bidirectional and
visible.

**Reference (primary, read directly).** [gwern.net/design](https://gwern.net/design) documents the
whole system in its own words: "sidenotes using both margins, fallback to floating footnotes";
"Generalized tooltip popups for loading introductions/summaries/previews of all links"; client-side
transclusion "within-page or cross-page, arbitrary IDs or ranges in pages, links, annotations", lazy
by default; "true bidirectional backlinks, which can pop up the context". The
[repo description](https://github.com/gwern/gwern.net) corroborates the same feature set, and there is
a dedicated essay on the pattern at [gwern.net/sidenote](https://gwern.net/sidenote).

**The load-bearing quote for S1**, from the same page: *"JavaScript is not required for the core
reading experience, only for (mostly) optional features: popups & transclusions, table-sorting,
sidenotes, and so on."* This is the exact architecture the map's S1 screen demands — and note the
honest implication: **sidenotes themselves are a JS enhancement**, with real footnotes underneath.

**Why it's rare.** It is unglamorous, invisible in a screenshot, and takes real work: sidenote
collision avoidance, the narrow-viewport fallback, preview generation, and a transclusion primitive
that survives recursion. It photographs badly, so it wins no awards, so nobody copies it.

**Hard screens.**
- S1 **PASSES** — verified against a real implementation that states the no-JS guarantee explicitly.
- S2 **PASSES WITH CARE** — previews must be tap/focus-triggered, not hover-triggered, and note markers
  need the 24×24 CSS px rule ([2.5.8, primary](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- S3 **PASSES** — nothing is hidden behind the mechanism.

**Positioning.** Calling card (craft as credential); hiring-first if the documents *are* the work.

---

### R3. Stacked panes — navigation that accretes instead of replacing

**What it is.** Clicking an internal link doesn't replace the page; it opens a new fixed-width column
to the right, and previous columns compress into readable spines. Your reading path stays visible and
re-enterable. Horizontal, not hierarchical.

**Reference.** `notes.andymatuschak.org` is the origin. Read directly, his landing note says these are
working notes shared as an experiment and — importantly — *"For now, there's no index or navigational
aids: you'll need to follow a link to some starting point."* He also declines to release the system.

The best-documented public implementation is Quartz's StackedPages plugin, read directly at
[quartz.jzhao.xyz/plugins/stackedpages](https://quartz.jzhao.xyz/plugins/stackedpages), which supplies
the concrete engineering facts: stack state is encoded in the URL as `#stacked=slug1,slug2` (shareable,
integrated with browser history); a maximum of 8 visible panes with older ones evicted; collapsed
"spines" when panes overflow the viewport; and **"disabled on mobile by default (below 800px) since
horizontal panning doesn't work well on small screens"** — on mobile, links navigate normally. The
Obsidian lineage is [deathau/sliding-panes-obsidian](https://github.com/deathau/sliding-panes-obsidian).

**Why it's rare.** Nearly every adoption is in a *desktop app*, not on the public web, and the one
serious web implementation ships with mobile switched off. That is the whole story: the narrow-viewport
case has no good answer, so you build the navigation twice. It also fights 1.4.10 Reflow directly, and
the URL-hash state model means panes beyond the first are not server-rendered.

**Hard screens.**
- S1 **PASSES WITH CARE** — only if each pane is a real, individually-addressable SSR document that
  loads standalone. The `#hash` stack model is client-only by construction, so the *stack* is never
  crawlable; the individual pages must be.
- S2 **PASSES WITH CARE** — the reference implementation's answer is to disable it below 800px. That
  is acceptable (it degrades to normal navigation) but means touch users never see the signature idea.
- S3 **PASSES WITH CARE** — Matuschak's own site fails this screen ("no index or navigational aids").
  Any version of this for liamfunk.de must add the index and contact he deliberately omitted.

**Positioning.** Calling card; playground if the stack itself is the demonstrated idea.

---

### R4. The explorable explanation as the unit of portfolio

**What it is.** Each project page isn't a case study *about* a thing — it's a working interactive model
*of* the thing, with sliders and live diagrams the reader manipulates, embedded in prose.

**Reference (verified by direct read).** [ciechanow.ski](https://ciechanow.ski/) — the
[archive](https://ciechanow.ski/archives/) lists **22 articles spanning 2014–2024**. The signature
interactive era runs 2019→2024 (17 articles: *Exposing Floating Point*, *Color Spaces*, *Alpha
Compositing*, *Earth and Sun*, *Tesseract*, *Gears*, *Lights and Shadows*, *Cameras and Lenses*,
*Internal Combustion Engine*, *Naval Architecture*, *Curves and Surfaces*, *GPS*, *Mechanical Watch*,
*Sound*, *Bicycle*, *Airfoil*, *Moon*) — roughly two to three a year, tapering to one in 2024. The
*Moon* article's interactions, read directly, are **draggable celestial bodies, sliders, time-scrubbing,
zoom, camera repositioning and visualization-mode toggles**; the author calls them "space playgrounds".
Genre context: [awesome-explanations](https://github.com/BHSPitMonkey/awesome-explanations),
[Wikipedia: Explorable explanation](https://en.wikipedia.org/wiki/Explorable_explanation).

**Why it's rare.** Ciechanowski manages roughly one to three a year, and he is the best in the world at
it. The cost is not the code — it's that you must *understand* the subject well enough to build a
correct simulation, then design an interface that teaches. There is no template.

**Hard screens.**
- S1 **PASSES WITH CARE** — the prose must carry the argument alone; every interactive needs a
  server-rendered static figure + caption as its no-JS state. This is the make-or-break constraint.
- S2 **PASSES WITH CARE** — and the reference implementation is a live warning here: *draggable*
  celestial bodies are precisely what 2.5.7 requires an alternative for
  ([primary](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)). Build with
  sliders/steppers and tap-to-set, not drag-only canvases.
- S3 **PASSES** — it's a document with toys in it; nothing gates navigation.

**Positioning.** Calling card *and* hiring-first simultaneously — rare among these candidates. Also
playground.

---

### R5. The site that is a working tool

**What it is.** The homepage isn't about the work; it *is* a real utility or toy a stranger would use
and bookmark independently of who made it. The portfolio hangs off the tool, not the reverse.

**Reference (verified by direct read).** [neal.fun](https://neal.fun/) — Neal Agarwal's site presents a
minimalist grid of **40+ self-contained toys** (Infinite Craft, The Password Game, The Deep Sea,
Internet Artifacts, Absurd Trolley Problems, Size of Space, Internet Roadtrip…) under the tagline
"games and stuff by Neal", with no navigation menu and no heavy branding. Crucially for S3: contact is
a plain footer email (`contact@neal.fun`, plus a separate `business@` address) and social links. Each
piece is understandable in one screen with no instructions
([analysis, secondary](https://webiano.digital/neal-fun-is-the-web-that-still-rewards-curiosity/)).

**Why it's rare.** It requires an *idea worth shipping*, which is scarcer than front-end skill. It also
inverts the incentive structure of a portfolio: the tool has to be good on its own terms or the whole
thing collapses, and if it *is* good it acquires maintenance, support and abuse costs. Most people
would rather build a grid of screenshots.

**Hard screens.**
- S1 **PASSES WITH CARE** — the tool can be JS, but there must be a server-rendered explanatory
  document (what it is, who made it, why) that indexes on its own. neal.fun's homepage grid does this.
- S2 **PASSES WITH CARE** — depends on the tool chosen; pick one whose input is typing or tapping.
- S3 **PASSES** — neal.fun's footer-email model is the pattern to copy exactly.

**Positioning.** Playground primarily; hiring-first if the tool is in Liam's domain.

---

### R6. Site-as-concept, versioned in public

**What it is.** The site's *design* is the artifact, the concept changes on a known cadence, every
version is preserved and reachable, and each ships with a written case study explaining the idea.

**Reference (verified by direct read).** [lynnandtonic.com](https://lynnandtonic.com/) — Lynn Fisher
has published a case study per refresh for the better part of a decade:
[2017](https://lynnandtonic.com/thoughts/entries/case-study-2017-refresh/),
[2018](https://lynnandtonic.com/thoughts/entries/case-study-2018-refresh/),
[2019 (CSS-Tricks)](https://css-tricks.com/case-study-lynnandtonic-com-2019-refresh/),
[2021](https://lynnandtonic.com/thoughts/entries/case-study-2021-refresh/),
[2023](https://lynnandtonic.com/thoughts/entries/case-study-2023-refresh/),
[2025](https://lynnandtonic.com/thoughts/entries/case-study-2025-refresh/).

**The 2025 mechanism, read directly, is the cautionary detail.** A fixed 436px container stretches and
squashes elastically as you resize the browser window, then bounces back when you stop — implemented
with CSS `scale()` rather than width changes specifically so text doesn't reflow ("Text wants to *flow*
when its container changes size. That's normally a good thing!"). Her framing: *"Resizing is
futile—but fun! The grain of this website is polyester."* Below a 500px viewport it is "regular
full-width responsive again." The write-up is **silent on `prefers-reduced-motion`, on touch
alternatives, and on keyboard-only users.**

**Why it's rare.** It's a multi-year commitment, not a project — the value compounds only if you keep
doing it. And the mechanism Fisher favours (viewport width as the interaction) is desktop-only by
construction, which is a genuine content-unsuitability trap for anyone copying it naively.

**Hard screens.**
- S1 **PASSES** — the archive of versions is a real content surface, each a static document.
- S2 **FAILS if the interaction is window-resize** (verified: it degrades to plain responsive below
  500px, i.e. touch users never see the concept); **PASSES** if the concept-per-version *idea* is kept
  and the mechanism is chosen to be input-agnostic. Flagging loudly: do not copy the resize gag.
- S3 **PASSES** — a version switcher is additive.

**Positioning.** Calling card. Weak for hiring-first at launch (there's only one version on day one).

---

### R7. The site that accumulates visitor traces

**What it is.** Visitors leave something behind that persists and visibly changes the site for the next
visitor — not a comment section, but a shared artifact: a mark on a collective canvas, a counter that
only goes up, a wall of one-word answers, an object placed in a room.

**Reference.** The honest closest reference is the guestbook revival on the indie web — Susam Pal
reinstating his guestbook after 20 years ([susam.net](https://susam.net/reinstated-guestbook.html)),
the [IndieWeb guestbook page](https://indieweb.org/guestbook), and the Neocities
[guestbook tag](https://neocities.org/browse?tag=guestbook). The *shared-artifact* variant is rarer:
the multiplayer-presence tooling exists (PartyKit, Ably) but is almost always spent on ephemeral
cursors (§1.9) rather than persistent state. **UNDER-VERIFIED** as a flagship personal-site pattern —
I found the ingredients everywhere and the finished dish nowhere.

**Why it's rare.** It needs a backend, which most personal sites deliberately avoid. It needs
moderation and abuse handling from day one. And it needs enough traffic not to look empty — a
collective artifact with three marks on it is sadder than no artifact. This is the pattern most likely
to look brilliant in a prototype and embarrassing in month three.

**Hard screens.**
- S1 **PASSES WITH CARE** — the accumulated state must be SSR'd into the HTML as real markup (a list, a
  table, an inline SVG), not hydrated client-side. Done right this is genuinely good for GEO: the page
  contains text that exists nowhere else.
- S2 **PASSES WITH CARE** — the "leave a trace" action must be tap-sized (≥24px) and non-drag.
- S3 **PASSES** — additive to a normal site.

**Positioning.** Playground. The cleanest justification for "a backend must be earned".

---

### R8. Art direction per project

**What it is.** Every case study gets its own typography, palette, grid and layout logic, derived from
the project it describes. No shared template. The site's system is *editorial judgment*, not a
component library.

**Reference.** The practice is named, old, and explicitly acknowledged as rare on the web: *"on the web
art direction is rare and there have been few meaningful conversations about it"*
([Andy Clarke, Stuff & Nonsense](https://stuffandnonsense.co.uk/blog/art-directing-the-web)); see also
[A List Apart, "Art Direction and Design"](https://alistapart.com/article/art-direction-and-design/)
and Clarke's book announcement
([Smashing, secondary](https://www.smashingmagazine.com/2019/03/art-direction-release/)). Jason Santa
Maria and Trent Walton are the usually-cited practitioners.

**Why it's rare.** Linear cost — N projects means N designs — with zero reuse, and it fights every
instinct of a component-driven React codebase. It requires design range, which most developers building
portfolios don't have. And it's fragile: one weak page drags the average down.

**Hard screens.**
- S1 **PASSES** — bespoke layout is still semantic HTML; arguably better, since each page is distinct.
- S2 **PASSES** — nothing input-dependent.
- S3 **PASSES** — provided a consistent, boring global header/footer survives across all of them.

**Positioning.** Calling card. Real risk for hiring-first: reads as "designer" more than "engineer".

---

### R9. The page that is also a printable object

**What it is.** The site has a second, deliberately designed physical output: `@media print` / CSS
Paged Media styling so the CV prints as a typeset document, or a project page prints, folds and cuts
into an actual zine or poster.

**Reference.** The tooling is real and documented —
[Paged.js "Web design for print"](https://pagedjs.org/en/documentation/5-web-design-for-print/),
[print-css.rocks](https://print-css.rocks/),
[Smashing, "Designing For Print With CSS", secondary](https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/) —
and the fold-it-yourself zine variant has a published walkthrough
([secondary](https://medium.com/swlh/create-a-printable-zine-with-css-cfba7a3a0855)). I could not
verify a named *personal portfolio* that does this as a signature move; **UNDER-VERIFIED**, which is
itself the finding.

**Why it's rare.** Nobody sees it unless they print, so it earns no gallery placement and no
screenshot. Paged Media support is inconsistent across browser print engines, imposition (page order
for folding) is fiddly arithmetic, and there is no feedback loop — you can't A/B test paper.

**Hard screens.** S1 **PASSES** (pure addition to a semantic document) · S2 **PASSES** (orthogonal to
input) · S3 **PASSES** (invisible until invoked).

**Positioning.** Calling card, austere/technical tone. Best as a *detail* inside a larger concept — a
grace note, not a swing.

---

### R10. Context-reactive server rendering, disclosed

**What it is.** The server renders a materially different page depending on real context — the
visitor's local time, hemisphere/season, referrer, or language — and *tells them it did*. Not "Hallo"
vs "Hello"; a page whose whole mood or ordering is a function of context, with the reasoning surfaced
as content ("It's 04:12 where you are. Here's the quiet version.").

**Reference.** The mechanism is a commodity in marketing — contextual personalization on time of day,
location and weather is standard e-commerce practice
([Dynamic Yield/Mastercard, secondary](https://www.dynamicyield.com/lesson/web-personalization/),
[HubSpot, secondary](https://blog.hubspot.com/website/website-personalization-examples-dynamic)).
I found **no personal site using it as an aesthetic concept rather than a conversion tactic**.
**UNDER-VERIFIED** as a creative pattern; verified only as a marketing one.

**⚠ Correction found during verification — this changes the build.** The browser does **not** send the
visitor's timezone in an HTTP request, so a naive server render cannot know their local time; the
common advice is that this must be done client-side
([CSS-Tricks snippet, secondary](https://css-tricks.com/snippets/javascript/different-stylesheet-pending-the-time-of-day/),
[DEV, secondary](https://dev.to/lakshmananarumugam/the-simple-tricks-to-change-your-website-theme-based-on-day-and-night-23l0)).
Doing it *server-side* — which S1 requires — means one of: IP geolocation at the edge, an
`Accept-Language`/region heuristic, or a client-set timezone cookie that only takes effect from the
second request. Each is a real design decision, not a free win. This pattern is cheaper than a shader
but not as cheap as it first looks.

**Why it's rare.** The industry with the technology uses it to sell, so it's coded as
"personalization", so creative people avoid it. It also complicates caching/CDN strategy, and reads as
creepy unless disclosure is explicit and the signals are non-invasive.

**Hard screens.**
- S1 **PASSES WITH CARE** — everything is server-rendered and crawlers get a coherent variant, but you
  must pick a stable canonical variant so indexing isn't thrashed, and solve the timezone-source
  problem above.
- S2 **PASSES** — context comes from headers/IP/time, never from pointer.
- S3 **PASSES** — provided variance is atmospheric and never removes a route.

**Positioning.** Calling card, cinematic/atmospheric tone.

---

### R11. The self-documenting site

**What it is.** The site's own construction is its primary content: live commit history, the diff that
produced the current version, a visible changelog of the design, open TODOs, the actual source of the
component you're looking at rendered next to it.

**Reference.** Weak. The concept exists as stated intent —
[jbarthelmess/self-documenting-site](https://github.com/jbarthelmess/self-documenting-site) is a
personal site explicitly meant to document the process of building itself — but I found no polished,
well-known execution. Adjacent *verified* practice: Bruno Simon documented his rebuild as a public
devlog series and ships a "Behind the Scene" section on the site itself with the stack named and source
linked (read directly at [bruno-simon.com](https://bruno-simon.com/)). **UNDER-VERIFIED** as a
standalone concept.

**Why it's rare.** It only works if the work is genuinely ongoing and good; it's a commitment to keep
shipping in public. It needs a build-time pipeline into git data. And the content is only interesting
to a technical audience, which shrinks the addressable reader to roughly "other engineers".

**Hard screens.** S1 **PASSES** (git-derived content rendered at build time is ideal SSR fodder and
unusually crawl-worthy — nobody else has this text) · S2 **PASSES** (it's documents) · S3 **PASSES**.

**Positioning.** Playground and calling card, austere/technical tone. A strong "the site is the
project" answer.

---

### R12. Spatial / map navigation over an infinite canvas

**What it is.** Work is arranged in 2D space rather than a list. You pan and zoom rather than scroll;
position carries meaning (proximity = relatedness, depth = chronology).

**Reference.** The technique is documented and buildable
([Codrops, "Infinite Canvas: Building a Seamless, Pan-Anywhere Image Space"](https://tympanus.net/codrops/2026/01/07/infinite-canvas-building-a-seamless-pan-anywhere-image-space/),
[Wikipedia: Infinite canvas](https://en.wikipedia.org/wiki/Infinite_canvas)), with historic
Google-Maps-tile-based site navigations as precedent
([Creative Bloq, secondary](https://www.creativebloq.com/web-design/website-navigation-4132549)).

**Why it's rare — and mostly correctly so.** It is drag-primary, which lands squarely in 2.5.7
territory ([primary](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)), and it is
the textbook 1.4.10 Reflow problem: content must work "without requiring scrolling in two dimensions"
at 320×256 CSS px, and while the criterion excepts "parts of the content which require two-dimensional
layout for usage or meaning", a portfolio index does not qualify — a *map* does
([primary](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)). Getting lost is the default
state, deep-linking a viewport is awkward, and most bodies of work have no genuine spatial semantics.

**Hard screens.**
- S1 **FAILS as normally built** (canvas-rendered); **PASSES WITH CARE** only if it's DOM elements
  CSS-transformed over a server-rendered list that reads as a normal index with JS off.
- S2 **FAILS as normally built** — pan-and-zoom with no non-drag alternative.
- S3 **PASSES WITH CARE** at best — needs permanent index/contact chrome that never scrolls away.

**Positioning.** Playground only. **The weakest of the rare set** — included so it can be consciously
rejected rather than rediscovered later.

---

### R13. Layered secrets under a fully functional plain site

**What it is.** The site works completely and conventionally for everyone. Underneath, for anyone who
looks — view-source comments, HTTP headers, an unlisted route referenced obliquely — there's a second
layer with its own reward.

**Reference.** The construction techniques are documented in ARG practice: hidden links, unlisted
pages, clues embedded in code and UI, layers revealed progressively
([Wikipedia: Alternate reality game](https://en.wikipedia.org/wiki/Alternate_reality_game),
[Game Developer on ARG puzzle design, secondary](https://www.gamedeveloper.com/design/alternate-reality-game-puzzle-design)).
Verified in the wild at portfolio scale: bruno-simon.com invites you to "drive around to learn more
about him and discover **hidden secrets**", with an achievements system — read directly on the site.

**Why it's rare on personal sites.** The discipline is the hard part: the secret must be *strictly*
additive, and the temptation to gate something real behind it is enormous — the moment you do, you've
built mystery-meat navigation. And unlike an ARG with a community, a personal site's secret may simply
never be found.

**Hard screens.**
- S1 **PASSES** — the surface site is a normal document; hidden routes can be `noindex`.
- S2 **PASSES** — if the trigger is a link/tap, not a hover or a key sequence (a keyboard-only trigger
  silently excludes every touch visitor).
- S3 **PASSES BY DEFINITION** — the constraint *is* that nothing is gated. Fails instantly if violated.

**Positioning.** Playground; pairs with any other candidate as a second layer rather than competing.

---

### R14. Deep-linkable state as the entire navigation model

**What it is.** Every configuration of the site — filter, comparison, sort, the exact state of an
interactive figure — has a URL, and the URL is presented as the interface. Sharing a link shares an
argument. The address bar is a first-class control surface.

**Reference.** No canonical personal-site flagship found; **UNDER-VERIFIED** as a standalone concept.
Two verified partial precedents: gwern.net's addressability of arbitrary IDs and ranges for
transclusion ([gwern.net/design, primary](https://gwern.net/design)), and Quartz StackedPages encoding
its entire pane stack as `#stacked=slug1,slug2` so a reading path is shareable and bookmarkable
([primary](https://quartz.jzhao.xyz/plugins/stackedpages)) — note that the latter uses a *hash*, which
is exactly the version that is **not** server-visible.

**Why it's rare.** SPA culture actively degrades it — state lives in React, not the URL, and restoring
arbitrary state on the *server* is real work. It's also invisible as a feature unless you deliberately
*show* the URL changing, which most designers consider ugly.

**Hard screens.**
- S1 **PASSES** — maximal SSR: every state is a real, crawlable URL. Best-in-set for GEO, since it
  multiplies genuine indexable content. Requires path/query params, **not** hash fragments.
- S2 **PASSES** — URLs are input-agnostic.
- S3 **PASSES** — increases addressability rather than reducing it.

**Positioning.** Hiring-first (share a link straight to the relevant evidence) and austere/technical
calling card. Very strong combined with R1 or R4; thin alone.

---

## Part 3 — Rare but bad (do not mistake these for opportunities)

Uncommon *because hostile*, and several are explicitly catalogued alongside dark patterns
([SitePoint, secondary](https://www.sitepoint.com/annoying-web-dark-patterns/);
[hostility framework, Ethics & Information Technology, secondary](https://link.springer.com/article/10.1007/s10676-025-09856-z)).

1. **Full scroll hijack with no visible scrollbar.** Motion sickness and loss of positional feedback.
   Violates S3.
2. **Audio on entry.** Browsers block it by design. Chrome permits audible autoplay only if "the user
   has interacted with the domain (click, tap, etc.)", or their Media Engagement Index threshold has
   been crossed (desktop only), or the site is installed as a PWA / added to the home screen
   ([Chrome autoplay policy, primary](https://developer.chrome.com/blog/autoplay)). Any concept that
   *needs* sound to work is dead on arrival — the first paint is silent and you cannot control that.
3. **Mystery-meat navigation.** Unlabelled hot-spots the visitor must discover. Direct S3 violation.
4. **The "enter" gate / long preloader.** A 4-second counting animation in front of a 30-second
   attention budget is arithmetic you lose.
5. **Cursor-velocity-dependent interaction.** Rare because unbuildable on touch. Automatic S2 failure.
6. **Drag-only anything with no alternative.** Named non-conformance under 2.5.7
   ([primary](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)).
7. **Parallax everywhere.** Called out by name in the spec as a vestibular trigger
   ([2.3.3, primary](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).
8. **Content behind a typed command or a puzzle.** The terminal-portfolio failure mode: making a
   recruiter earn your email address.
9. **Time-gated or rate-limited content** ("come back tomorrow for section 2"). Converts a visit into
   a chore.
10. **Text rendered into canvas/WebGL.** Kills selection, search, translation, screen readers and
    indexing at once. Automatic S1 failure.
11. **Deliberately broken / anti-usable "art" interfaces.** Interesting once, in a gallery, by someone
    who isn't asking to be hired.

Context for how much rope exists: the 2026 WebAIM Million reports detectable WCAG failures on 95.9% of
top-million home pages ([reported secondary](https://ratedwithai.com/blog/keyboard-accessibility-guide-2026)),
and automated tools catch only ~30–40% of WCAG 2.2 AA issues — keyboard and screen-reader behaviour
needs a human ([secondary](https://www.modernsoftworks.com/guides/wcag-22-accessibility-audit)). So
"it passes Lighthouse" will never be evidence that a weird concept passes S2/S3.

---

## Part 4 — Shortlist for liamfunk.de

Ranked for: TanStack Start SSR / React 19 / Tailwind 4, a weekend-plus of build, swing-hard ambition,
all three hard screens mandatory.

**1. Explorable-project pages (R4) — every project is a working interactive model, not a screenshot.**
The only candidate that satisfies calling-card *and* hiring-first at once, because the artifact proving
the craft is the same artifact explaining the work. **S1** passes with care (prose + SSR static figure
must carry it with JS off) · **S2** passes with care (sliders/steppers and tap-to-set — ciechanow.ski's
draggable objects are the thing *not* to copy) · **S3** passes.

**2. Deep-linkable state (R14) on a seamless MPA (R1) — one substrate.**
Every view is a real server-rendered URL (path/query, never hash), and moving between them animates
natively via `@view-transition { navigation: auto; }`; it looks like an app and is architecturally a
document set. Best-in-set for SEO/GEO and the rarest *technical* position available in 2026, because
the whole SPA ecosystem — TanStack Start included — pushes the other way. **S1** passes (strongest of
all) · **S2** passes · **S3** passes.

**3. The reading interface (R2) — sidenotes, tap-previews, transclusion over plain semantic HTML.**
Highest craft-per-line-of-code on the list and nearly unfakeable; gwern.net proves the architecture and
states the no-JS guarantee outright. A visitor can't tell you how it's done but can feel that nobody
else's site reads like this. **S1** passes · **S2** passes with care (tap/focus not hover; ≥24px note
markers) · **S3** passes.

**4. The site that is a working tool (R5) — a real utility with the portfolio hung off it.**
The most honest answer to the playground positioning and the strongest "the site is the project"
story; neal.fun's footer-email model shows exactly how to stay non-blocking. Highest variance on the
list — it lives or dies on the idea, not the build. **S1** passes with care (needs a server-rendered
explainer beside the tool) · **S2** passes with care (choose a tap/type-input tool) · **S3** passes.

**5. Visitor-accumulated artifact (R7) — the site carries traces of everyone who came.**
The clearest justification for earning a backend, and it makes the page contain text that exists
nowhere else on the web, which is a real GEO asset. **S1** passes with care (state must be SSR'd as
markup) · **S2** passes with care (tap-sized, non-drag contribution) · **S3** passes. Caveats: needs
moderation from day one, looks sad while empty, and is under-verified as a finished pattern.

**6. Context-reactive server rendering, disclosed (R10) — the page is a function of when and where you are.**
Makes the *server* the site's signature rather than the GPU — the axis nobody is competing on.
**Demoted from a higher rank by verification:** browsers don't send timezone, so the first server
render needs edge IP-geo, a locale heuristic, or a cookie that only helps from request two. **S1**
passes with care (pick a canonical variant; solve the timezone source) · **S2** passes · **S3** passes.

**7. Art direction per project (R8) — no shared template, each case study designed to its subject.**
Maximum craft signal for the calling-card positioning with zero technical risk to the hard screens; the
cost is linear and the risk is reading as "designer" to an engineering audience. **S1** passes ·
**S2** passes · **S3** passes (keep one boring global header).

**8. Self-documenting site (R11) — the build log, diffs and open TODOs are the content.**
Fits "the site is the project" and the austere/technical tone; git-derived content is ideal SSR fodder
and unusually crawl-worthy. **S1** passes · **S2** passes · **S3** passes. Caveats: under-verified as
an executed pattern, and only interesting to a technical reader.

**Not shortlisted, deliberately.**
- *Spatial / infinite-canvas navigation (R12)* — fails S1 and S2 as normally built; remediating it
  removes everything distinctive about it.
- *Stacked panes (R3)* — the best public implementation switches itself off below 800px, so touch
  visitors never see the idea, and the origin site fails S3 by design ("no index or navigational
  aids"). Genuinely rare, but it spends the whole budget on a desktop-only effect.
- *Site-as-concept versioned in public (R6)* — excellent, but a multi-year commitment rather than a
  launch concept, and its signature mechanism (viewport resize) fails S2 outright.
- *Printable object (R9)* and *layered secrets (R13)* — both pass all three screens cleanly but neither
  is a concept; they are garnishes to add to whichever of 1–8 wins.

**Cross-cutting recommendation.** R1 and R14 are not rivals to entries 1, 3–8 — they're the substrate.
Whatever concept wins should be *built on* them.

---

## Part 5 — Open questions and gaps

**New questions this surfaced, candidates for future map tickets:**

1. **What is Liam's subject?** R4 (explorable) and R5 (tool) both collapse without a specific thing
   worth modelling or shipping. That's a content question the map has no ticket for, and it gates the
   top two shortlist entries.
2. **Does TanStack Start actually emit a no-JS-readable document, and does it cooperate with
   cross-document view transitions?** Shortlist #2 depends on it entirely. TanStack Start is
   router-first, which is in direct architectural tension with the MPA the API is designed for. This
   should be spiked before any prototype is scoped.
3. **Cheap-but-real prototype protocol.** Bruno Simon's original took months on top of years of
   experience while the clones take three weeks — so how are three throwaway prototypes scoped such
   that the comparison is fair rather than "whichever one I built last"?
4. **How is "never blocking" actually tested?** Automated tools cover ~30–40% of WCAG AA; S2 and S3
   live in the manual-only remainder. The map needs a concrete check — real phone, keyboard-only pass,
   JS-off pass — or the screen is decorative.
5. **Anti-target self-check.** Part 1 should become a literal checklist run against each prototype
   before the comparison, not a document read once.

**Gaps I could not close, even with full network access:**

- **No quantitative census of portfolio sites exists.** The commonness claims in Part 1 are argued from
  genre evidence — permanent Awwwards technique collections spanning multiple pages, many independent
  GitHub implementations of the same idea, stock template components, tutorial saturation — not from
  measured frequency. This is strong but not numeric.
- **No accessibility audit specifically of award-winning sites.** The WCAG failure statistics quoted
  are general-web (WebAIM Million) reached via secondary reporting, not the WebAIM report itself.
- **Five patterns lack a flagship example** and are labelled UNDER-VERIFIED in place: R7 (persistent
  visitor artifact), R9 (printable object as signature), R10 (context-reactive rendering as concept),
  R11 (self-documenting site), R14 (URL-as-state as concept). Absence of evidence is weak evidence of
  rarity — it is also the risk that someone has done them well and I did not find them.
- **caniuse's feature table for CSS scroll-driven animations would not render** through the fetcher, so
  the ~82% support figure in §1.4 remains secondary and approximate. The View Transitions figure
  (90.2%, single-document) is primary from caniuse; a separate primary figure for *cross-document*
  support was not obtainable.

---

## Part 6 — Verification log

Opened and read directly on 2026-09-01 (not via search summary): gwern.net/design · ciechanow.ski and
its archive index · notes.andymatuschak.org · quartz.jzhao.xyz/plugins/stackedpages · neal.fun ·
lynnandtonic.com 2025 case study · bruno-simon.com · awwwards.com/websites/ and
awwwards.com/websites/webgl/ · developer.mozilla.org View Transition API · caniuse.com/view-transitions ·
developer.chrome.com/blog/autoplay · w3.org WCAG 2.2 Understanding docs for 1.4.10, 2.2.2, 2.3.3, 2.5.7
and 2.5.8 · github.com/gwern/gwern.net repo metadata via `gh api`.

Claims corrected as a result of that verification, rather than left as originally drafted:
Bruno Simon's site is *not* canvas-only and does support touch and gamepad (§1.8); gwern.net's
sidenotes are themselves a JS enhancement over real footnotes (R2); Ciechanowski's cadence is 22
articles over 2014–2024 with ~2–3/year in the interactive era, not "roughly one a year" (R4); the
stacked-panes reference implementation disables itself below 800px and stores state in a URL *hash*
(R3); Lynn Fisher's 2025 effect stops below a 500px viewport and the write-up never mentions reduced
motion (R6); and servers cannot read a visitor's timezone from an HTTP request, which materially
raises the cost of R10 and demoted it in the shortlist.
