/**
 * The artifact itself: a record of everyone who came.
 *
 * Round one is allowed to fake persistence, and this fakes it in the one way that
 * keeps the sketch honest about the *screens*: the record is a **fixture computed
 * from a fixed seed**, and your own line lives in the query string. Nothing is
 * stored, so nothing accumulates between visitors — which is exactly the part a
 * backend would buy, and the part this ticket exists to price.
 *
 * Two constraints shaped the fake rather than the concept:
 *
 * 1. **No `Date.now()`, no `Math.random()`.** The sketch is server-rendered and
 *    then hydrated; anything that differs between the two renders is a hydration
 *    mismatch, and React would silently re-render the whole record on the client
 *    — which is the S1 failure mode this concept is most exposed to. Every value
 *    here is derived from a constant seed and a hard-coded date anchor.
 * 2. **No mutation during render.** A module-level array appended to while
 *    rendering would diverge between the server module and the browser module,
 *    with the same result.
 *
 * The real build stores arrivals; see the resolution on
 * https://github.com/s0h311/liamfunk-de/issues/19 for what that costs.
 */

/** Why you came. A closed vocabulary — the whole moderation story is in this line. */
export type Reason = 'code' | 'hiring' | 'link' | 'lost'

export const REASONS: readonly Reason[] = ['code', 'hiring', 'link', 'lost']

/** First person, because the visitor taps it. */
export const REASON_PROMPTS: Record<Reason, string> = {
  code: 'I came for the code',
  hiring: 'I am hiring',
  link: 'Someone sent me a link',
  lost: 'No idea why I am here',
}

/** Third person, because the record is written *about* the visitor, by the site. */
export const REASON_LABELS: Record<Reason, string> = {
  code: 'for the code',
  hiring: 'hiring',
  link: 'sent by a link',
  lost: "wouldn't say",
}

export function isReason(value: unknown): value is Reason {
  return typeof value === 'string' && (REASONS as readonly string[]).includes(value)
}

/** Where a trace was left. Only two of these are built this round; the rest are real projects. */
export type Surface = 'front door' | 'tabley' | 'matrix' | 'project-matrix' | 'smith' | 'workshops'

export type Arrival = {
  /** Its place in the lineage. The whole reason a line feels like a line and not a row. */
  ordinal: number
  /** Hard-coded relative to the anchor below, never computed from the clock. */
  day: string
  time: string
  reason: Reason
  surface: Surface
  /** True only for the line the current visitor just left. */
  you: boolean
}

/**
 * How full the record is. `?record=empty` and `?record=thin` exist so the two
 * states this concept is most likely to die of can be *looked at* rather than
 * argued about: the survey flags "looks sad while empty" as the known risk, and
 * the awkward middle — a handful of arrivals, visibly not many — is worse than
 * either end.
 */
export type Fullness = 'full' | 'thin' | 'empty'

export const FULLNESS_SIZES: Record<Fullness, number> = { full: 148, thin: 7, empty: 0 }

export function isFullness(value: unknown): value is Fullness {
  return value === 'full' || value === 'thin' || value === 'empty'
}

/**
 * The date anchor. Ten labels is ten days of history; the fixture never needs
 * more because a record deep enough to scroll is a record deep enough to judge.
 */
const TODAY = '02 Sep'
const OLDEST = '20 Aug'
const DAYS = [
  TODAY,
  '01 Sep',
  '31 Aug',
  '30 Aug',
  '29 Aug',
  '28 Aug',
  '27 Aug',
  '26 Aug',
  '25 Aug',
  '24 Aug',
  '23 Aug',
  '22 Aug',
  '21 Aug',
  OLDEST,
]

/** Deterministic, seeded, and boring on purpose. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Weights<T> = readonly [readonly [T, number], ...(readonly [T, number])[]]

function weighted<T>(random: () => number, pairs: Weights<T>): T {
  const total = pairs.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = random() * total
  let chosen = pairs[0][0]

  for (const [value, weight] of pairs) {
    chosen = value
    roll -= weight
    if (roll <= 0) break
  }

  return chosen
}

const REASON_WEIGHTS = [
  ['code', 38],
  ['hiring', 20],
  ['link', 28],
  ['lost', 14],
] as const satisfies Weights<Reason>

const SURFACE_WEIGHTS = [
  ['front door', 54],
  ['tabley', 22],
  ['matrix', 12],
  ['project-matrix', 6],
  ['smith', 4],
  ['workshops', 2],
] as const satisfies Weights<Surface>

const pad = (value: number) => String(value).padStart(2, '0')

/** Minutes before the anchor, walked backwards. Nobody arrives at 04:00. */
const DAY = 24 * 60
const ANCHOR = 23 * 60
const NIGHT_START = 2 * 60
const NIGHT_END = 9 * 60

/**
 * The seeded history, newest first. Ordinals count up from the site's first day,
 * so the newest arrival carries the total.
 *
 * Timestamps are walked backwards from the anchor rather than drawn independently,
 * because a record whose ordinals descend while its clocks jump around reads as
 * generated the moment anyone looks twice. The gaps widen as the walk goes back —
 * a site being found gets denser, not steadier — and the dead hours are stepped
 * over so the small hours stay empty.
 */
function seededArrivals(size: number): Arrival[] {
  const random = mulberry32(0x1a3f)
  const arrivals: Arrival[] = []
  let minutesAgo = Math.floor(random() * 40)

  for (let index = 0; index < size; index++) {
    const spread = 1 + (index / Math.max(1, size)) * 1.4
    minutesAgo += Math.floor((28 + random() * 62) * spread)

    const clock = (((ANCHOR - minutesAgo) % DAY) + DAY) % DAY
    if (clock > NIGHT_START && clock < NIGHT_END) {
      /* Step back past the dead hours, and not to the same minute every time —
         a record where every night ends at exactly 02:00 is a record with a
         generator behind it. */
      minutesAgo += clock - NIGHT_START + Math.floor(random() * 74)
    }

    const at = (((ANCHOR - minutesAgo) % DAY) + DAY) % DAY
    const dayIndex = Math.floor((minutesAgo + (DAY - ANCHOR)) / DAY)

    arrivals.push({
      ordinal: size - index,
      day: DAYS[dayIndex] ?? OLDEST,
      time: `${pad(Math.floor(at / 60))}:${pad(at % 60)}`,
      reason: weighted(random, REASON_WEIGHTS),
      surface: weighted(random, SURFACE_WEIGHTS),
      you: false,
    })
  }

  return arrivals
}

export type Record_ = {
  arrivals: Arrival[]
  /** Total arrivals including yours, which is what the ordinal on your line says. */
  total: number
  counts: Record<Reason, number>
  bySurface: Record<Surface, number>
  /** True when the visitor has left their trace this session. */
  traced: boolean
}

export function buildRecord({
  fullness,
  trace,
  at,
}: Readonly<{ fullness: Fullness; trace: Reason | undefined; at: Surface }>): Record_ {
  const seeded = seededArrivals(FULLNESS_SIZES[fullness])
  const arrivals =
    trace === undefined
      ? seeded
      : [
          {
            ordinal: seeded.length + 1,
            day: TODAY,
            /* Not a clock reading: "just now" is true on the server and on the
               client, and a fixture timestamp on the newest line would be a lie
               a reader could catch. */
            time: 'just now',
            reason: trace,
            surface: at,
            you: true,
          },
          ...seeded,
        ]

  const counts: Record<Reason, number> = { code: 0, hiring: 0, link: 0, lost: 0 }
  const bySurface: Record<Surface, number> = {
    'front door': 0,
    tabley: 0,
    matrix: 0,
    'project-matrix': 0,
    smith: 0,
    workshops: 0,
  }

  for (const arrival of arrivals) {
    counts[arrival.reason]++
    bySurface[arrival.surface]++
  }

  return { arrivals, total: arrivals.length, counts, bySurface, traced: trace !== undefined }
}

/**
 * The site's own sentence about its audience — the part that is "text existing
 * nowhere else on the web", and the part that is most obviously a template.
 * Written in the site's voice rather than as a stat line, because a stat line is
 * an analytics dashboard and this is meant to be a document.
 */
export function composeReading(record: Record_): string {
  if (record.total === 0) {
    return 'No one has been here yet. The first line of this record is still unwritten, and it could be yours.'
  }

  const { code, hiring, link, lost } = record.counts
  const opening = record.total === 1 ? 'One arrival so far' : `Of the ${record.total} arrivals so far`
  const was = (count: number) => (count === 1 ? 'was' : 'were')
  const clauses =
    `${code} came for the code, ${hiring} ${was(hiring)} hiring, ` +
    `${link} ${was(link)} sent by a link, and ${lost} wouldn't say`
  const opened = record.total - record.bySurface['front door']

  return `${opening}: ${clauses}. ${opened} of them went past this page and into the work.`
}

/**
 * The same sentence, scoped to one page. A project page that repeated the
 * site-wide reading would be showing the visitor a number about somewhere else.
 */
export function composeReadingFor(record: Record_, surface: Surface): string {
  const here = record.arrivals.filter((arrival) => arrival.surface === surface)

  if (here.length === 0) {
    return `Nobody has left a trace on ${surface} yet. You would be the first.`
  }

  const count = (reason: Reason) => here.filter((arrival) => arrival.reason === reason).length

  return (
    `${here.length} of the ${record.total} arrivals left their trace here: ` +
    `${count('code')} for the code, ${count('hiring')} hiring, ` +
    `${count('link')} sent by a link, and ${count('lost')} who wouldn't say.`
  )
}
