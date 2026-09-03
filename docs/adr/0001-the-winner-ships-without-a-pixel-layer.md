# The winner ships without a pixel layer

Three rounds of prototypes were built against the bar _"the kind of site that turns up when you
search for crazy, unusual websites"_, and most of that reference class is WebGL and canvas — which
[S1](../../CONTEXT.md) rejects on sight, because a page built by JavaScript returns an empty shell
to the AI crawlers that never render and have no budget to. Rather than relax S1, round 1b granted a
**pixel budget**: a drawn layer is allowed as an _enhancement_, provided removing it removes 0 words
and 0 routes. Round 1c then spent that budget by mandate — one prototype on three.js, one on raw
WebGL, three with no 3D at all as controls — so the question could be settled by measurement.

**Every prototype measured the same: 0 words and 0 routes.** The two 3D slots returned it, the two
round-1b concepts that _declined_ the budget returned it, and — decisively — the non-3D controls
returned it for their own CSS skins. So the measurement cannot distinguish three.js from a CSS
gradient, and the three controls held their own against the two mandated 3D slots. Under a
pre-commitment made before the round ran, that outcome records the **pixel layer as decoration for
this site**: the winner ships without one, and there is no further round to re-test the question.

## Consequences

The finalist that used three.js, [The Magnification](https://github.com/s0h311/liamfunk-de/issues/31),
advances **as structure rather than as 3D** — its recursive-aperture descent survives, its `three`
dependency does not. Anyone later proposing a WebGL hero for this site should read this first: the
budget was granted, spent deliberately, and measured, and the drawn layer bought nothing a cheap skin
did not also buy. This is a finding about _this site's material_, not a general claim about WebGL —
the material is deepest where it is emptiest, and atmosphere could not disguise that.

Decided at [the cut](https://github.com/s0h311/liamfunk-de/issues/21).
