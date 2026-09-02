/**
 * The repository as a readable timeline.
 *
 * Everything the sketch renders is derived here from `snapshot.ts`, so there is
 * exactly one place where a number could be wrong, and no page asserts a fact
 * about the build that the repository does not already contain.
 */

export type Actor = 'agent' | 'hand'

export type Commit = {
  sha: string
  at: string
  subject: string
  actor: Actor
  branch: string
  files: number
  added: number
  removed: number
  session?: string
}

export type Ticket = {
  number: number
  title: string
  /** The wayfinder ticket type: research, prototype, grilling, task, map. */
  type: string
  openedAt: string
  closedAt: string | null
}

export type Snapshot = {
  takenAt: string
  repo: string
  commits: readonly Commit[]
  tickets: readonly Ticket[]
}

export type Event =
  | { kind: 'commit'; at: string; commit: Commit }
  | { kind: 'opened'; at: string; ticket: Ticket }
  | { kind: 'closed'; at: string; ticket: Ticket }

/**
 * A cluster of events close enough together to be one thing that happened.
 *
 * Without this the timeline has 46 steps, nine of which are "another ticket was
 * filed one second later" — a cursor you have to press nine times to cross one
 * decision. Clustering is a reading decision, not a data change: every event is
 * still rendered, just under the moment it belongs to.
 */
export type Moment = {
  index: number
  at: string
  events: readonly Event[]
}

const CLUSTER_WINDOW_MS = 5 * 60 * 1000

function time(iso: string): number {
  return new Date(iso).getTime()
}

export function eventsOf(snapshot: Snapshot): Event[] {
  const events: Event[] = snapshot.commits.map((commit) => ({ kind: 'commit', at: commit.at, commit }) as const)

  for (const ticket of snapshot.tickets) {
    events.push({ kind: 'opened', at: ticket.openedAt, ticket })

    if (ticket.closedAt !== null) {
      events.push({ kind: 'closed', at: ticket.closedAt, ticket })
    }
  }

  return events.toSorted((a, b) => time(a.at) - time(b.at))
}

export function momentsOf(snapshot: Snapshot): Moment[] {
  const moments: Moment[] = []
  let current: Event[] = []
  let openedAt = 0

  function flush(): void {
    const last = current[current.length - 1]

    if (last === undefined) {
      return
    }

    moments.push({ index: moments.length, at: last.at, events: current })
    current = []
  }

  for (const event of eventsOf(snapshot)) {
    if (current.length > 0 && time(event.at) - openedAt > CLUSTER_WINDOW_MS) {
      flush()
    }

    if (current.length === 0) {
      openedAt = time(event.at)
    }

    current.push(event)
  }

  flush()

  return moments
}

/** The build as it stood at the end of one moment. */
export type BuildState = {
  at: string
  elapsedHours: number
  commits: Commit[]
  agentCommits: number
  linesAdded: number
  openTickets: Ticket[]
  closedTickets: Ticket[]
  /** Prototype sketches that existed then: one per `proto/*` branch with a commit on it. */
  prototypes: string[]
}

export function stateAt({
  snapshot,
  moments,
  cursor,
}: Readonly<{ snapshot: Snapshot; moments: readonly Moment[]; cursor: number }>): BuildState {
  const upTo = moments.slice(0, cursor + 1).flatMap((moment) => moment.events)
  const at = upTo[upTo.length - 1]?.at ?? snapshot.takenAt
  const start = time(moments[0]?.at ?? at)

  const commits = upTo.flatMap((event) => (event.kind === 'commit' ? [event.commit] : []))
  const opened = upTo.flatMap((event) => (event.kind === 'opened' ? [event.ticket] : []))
  const closedNumbers = new Set(upTo.flatMap((event) => (event.kind === 'closed' ? [event.ticket.number] : [])))

  return {
    at,
    elapsedHours: (time(at) - start) / 3_600_000,
    commits,
    agentCommits: commits.filter((commit) => commit.actor === 'agent').length,
    linesAdded: commits.reduce((total, commit) => total + commit.added, 0),
    openTickets: opened.filter((ticket) => !closedNumbers.has(ticket.number) && ticket.type !== 'map'),
    closedTickets: opened.filter((ticket) => closedNumbers.has(ticket.number)),
    prototypes: [...new Set(commits.filter((c) => c.branch.startsWith('proto/')).map((c) => c.branch))],
  }
}

/** How long a ticket stayed open, in whole hours or minutes. Only for closed ones. */
export function turnaround(ticket: Ticket): string | null {
  if (ticket.closedAt === null) {
    return null
  }

  const minutes = Math.round((time(ticket.closedAt) - time(ticket.openedAt)) / 60_000)

  return minutes < 90 ? `${minutes}m` : `${Math.round(minutes / 60)}h`
}

/**
 * Rendered in Liam's timezone rather than the server's, and stated explicitly so
 * the same document comes out of any machine that builds it. The log is a record
 * of his days; 13:14 is when he remembers doing it.
 */
const BERLIN = 'Europe/Berlin'

export function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    timeZone: BERLIN,
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function day(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    timeZone: BERLIN,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
