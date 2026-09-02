/**
 * The trainer.
 *
 * A cheat is a flag in the query string, nothing else. That is the whole trick:
 * the site's state — which is to say what it renders — is a value the server can
 * read, so every cheat toggle is a plain `<a href>` and the cheated site is a
 * real document at a real URL. A trainer built on `localStorage`, a keyboard
 * listener or the hash would be a client-side toy sitting on top of a site; this
 * one *is* the site.
 */
export const SLUG = 'cheat-menu'

export type CheatId = 'godmode' | 'onehit' | 'noclip' | 'wallhack' | 'hitboxes' | 'unlockall'

export type Cheat = {
  id: CheatId
  /** Written the way a trainer writes them: what it does to the machine, not to you. */
  name: string
  effect: string
  group: 'game' | 'site'
}

export const CHEATS: readonly Cheat[] = [
  {
    id: 'godmode',
    name: 'GOD MODE',
    effect: 'Your HP stops going down.',
    group: 'game',
  },
  {
    id: 'onehit',
    name: 'INFINITE DAMAGE',
    effect: 'One turn ends the fight.',
    group: 'game',
  },
  {
    id: 'noclip',
    name: 'NOCLIP',
    effect: 'Walk through the page boundaries — the tabley case study loads into this document.',
    group: 'site',
  },
  {
    id: 'wallhack',
    name: 'WALLHACK',
    effect: 'See what is faked. Every placeholder says what is actually missing.',
    group: 'site',
  },
  {
    id: 'hitboxes',
    name: 'SHOW HITBOXES',
    effect: 'Draw the document underneath — every landmark and heading, labelled.',
    group: 'site',
  },
  {
    id: 'unlockall',
    name: 'UNLOCK ALL',
    effect: 'Open the locked surfaces: the blog, the books, the travel map.',
    group: 'site',
  },
]

const IDS = new Set<string>(CHEATS.map((cheat) => cheat.id))

export type Search = Record<string, string | number | undefined>

/**
 * Comma-separated rather than one param per cheat: `?cheats=noclip,wallhack`
 * is a URL you would actually paste to someone, and unknown names are dropped
 * rather than trusted, so a hand-edited URL cannot put the site in a state it
 * has no rendering for.
 */
export function readCheats(search: Search): Set<CheatId> {
  const raw = search['cheats']

  if (typeof raw !== 'string') {
    return new Set()
  }

  return new Set(raw.split(',').filter((name): name is CheatId => IDS.has(name)))
}

export function toggled(active: ReadonlySet<CheatId>, id: CheatId): Search {
  const next = CHEATS.filter((cheat) => (cheat.id === id ? !active.has(cheat.id) : active.has(cheat.id))).map(
    (cheat) => cheat.id,
  )

  return { cheats: next.length === 0 ? undefined : next.join(',') }
}

export function readTurn(search: Search): number {
  const raw = search['turn']
  const parsed = typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? ''), 10)

  if (Number.isNaN(parsed)) {
    return 0
  }

  return Math.min(99, Math.max(0, parsed))
}

/** Cross-document navigation is a real `<a>`, so its href is built by hand. */
export function href(search: Search): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(search)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }

  const query = params.toString()

  return query === '' ? `/proto/${SLUG}` : `/proto/${SLUG}?${query}`
}
