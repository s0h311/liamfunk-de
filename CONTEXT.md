# liamfunk.de

Liam Funk's personal website. The repo is currently in a **concept tournament**:
throwaway prototypes are built and compared until one creative concept is locked,
after which the real site is built. See
[the map](https://github.com/s0h311/liamfunk-de/issues/1).

## Language

### The tournament

**Concept**:
One candidate answer to what the whole site _is_. Named, and carried by exactly
one prototype per round.
_Avoid_: idea, direction, design

**Prototype**:
A throwaway sketch of one concept, at a round's fixed fidelity, living at
`prototypes/<slug>/index.tsx`. Never promoted — the winner is rebuilt.
_Avoid_: demo, POC, mock

**Round**:
A batch of prototypes built at equal fidelity so they can be compared fairly.
Fidelity is equal _within_ a round, never across rounds.

**The cut**:
The single point where the roster is reduced to two finalists.

**Control group**:
Prototypes from an earlier round left in play, unrebuilt, so a later round's
concepts are compared against something rather than only against each other.

**Keeper**:
A technique that outlives the concept that invented it. Keepers are harvested at
the cut, separately from picking concepts, so the winner can carry a device its
own prototype never invented.
_Avoid_: pattern, component, learning

**Positioning**:
What the site is _for_ — calling card, playground, hiring-first, or simulation.
A tag on a concept, not a bucket it sits in.

**Signature interaction**:
The one interaction a concept is judged on; the thing that makes it that concept
and not another.

**Front door**:
The site's arrival surface. Names a _role_, not a page shape — a front door need
not scroll and need not be a page.
_Avoid_: homepage, landing page, index

**Container**:
The spatial shape a concept puts its content in. It is part of the concept: two
concepts sharing a container are two controls in one experiment, not two websites.
_Avoid_: layout, chrome, template

**Spatial model**:
How a concept's space is organised and how its parts relate. A container's
structure.

### Story (round 1c)

**Story**:
A fixed sequence of full-viewport **scenes**. Each scene holds one idea, a real
URL names each scene, and **transport** carries the visitor between them.
_Fixed_ means authored — the sequence may branch, but every route through it was
placed by hand.
_Avoid_: narrative, journey, flow, scrollytelling

**Scene**:
One state of a story: one idea, one URL, one viewport. Not a slide — a slide is
a scene whose only relationship to the next one is order.
_Avoid_: slide, step, section, panel

**Transport**:
What moves the visitor from one scene to the next. The axis concepts are
differentiated on: two concepts with the same transport are one concept in two
skins, however differently they are drawn.
_Avoid_: navigation, transition, animation

**S1b collapse**:
What a story is with JavaScript off — one complete, ordinary, readable document
holding every scene. Not a story, but complete.

### The screens

**Hard screen**:
An eliminating test. A concept that fails one is out regardless of how good it
looks. Three exist: **S1**, **S2**, **S3**.
_Avoid_: criterion, requirement, guideline

**S1a**:
The crawler half of S1: words in the served HTML, every destination a real
`<a href>`, real URLs, no state in the hash.

**S1b**:
The no-JS human half of S1: a person with JavaScript off can read _and navigate_,
not merely receive the strings.

**S2**:
Touch is a first-class target. No hover- or cursor-velocity-dependence.

**S3**:
Weird, but never blocking. `hi@liamfunk.de` and the work are reachable in ≤2
interactions, with the affordance in the first viewport.

**Anti-target**:
A pattern whose mere presence signals "template" or "trend-follow" regardless of
execution quality. Fatal only when it _is_ the signature interaction.

**Pixel layer**:
An optional WebGL or canvas enhancement over the semantic document. It carries
**pace, not words** — removing it must remove 0 words and 0 routes.
_Avoid_: hero, canvas, 3D background

### The material

**Raw material**:
The real words about Liam that every prototype renders, in
`docs/raw-material.md`. Nothing is invented; missing facts are faked _visibly_.

**Refusal vocabulary**:
A first-class way for the site to say a thing is not finished, not available or
not for sale. Invented independently by three round-1b prototypes, which makes it
a property of this site's material rather than of any one concept.
