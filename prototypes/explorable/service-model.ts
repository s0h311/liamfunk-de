/**
 * The model behind the tabley case study: one evening service, seated greedily.
 *
 * This is the conflict tabley's booking engine exists to prevent — a table
 * promised to two parties at once. Arrivals are a fixed, clustered evening so
 * the model is deterministic and the same URL always renders the same figure.
 */

export const SERVICE_START = 17 * 60
export const SERVICE_END = 23 * 60

/**
 * Minutes after 17:00, in the order the bookings were *taken* — which is not the
 * order they are sat, because people call ahead. Stepping the booking count adds
 * the next call, so the pressure builds on the 18:00–19:00 peak first.
 */
const ARRIVALS = [0, 40, 80, 100, 120, 180, 240, 300, 60, 140, 200, 20, 90, 260]

export const MAX_BOOKINGS = ARRIVALS.length

export type Service = {
  tables: number
  bookings: number
  turnMinutes: number
}

export type Seating = {
  /** 1-based, in the order the booking came in. */
  id: number
  /** 0-based row. */
  table: number
  start: number
  end: number
  /** The booking already sitting at this table when this one was promised it. */
  doubleBooks: number | null
}

/**
 * First-fit: each booking takes the lowest-numbered table that is free when it
 * arrives. When nothing is free the booking is still accepted — that is the
 * failure — and lands on the table that frees soonest, on top of whoever is
 * already there.
 */
export function seatEvening({ tables, bookings, turnMinutes }: Service): Seating[] {
  const freeAt = Array.from({ length: tables }, () => SERVICE_START)
  const sittingAt = Array.from({ length: tables }, () => 0)
  const seatings: Seating[] = []

  ARRIVALS.slice(0, bookings)
    .toSorted((first, second) => first - second)
    .forEach((offset, index) => {
      const start = SERVICE_START + offset
      const free = freeAt.findIndex((freeFrom) => freeFrom <= start)
      const table = free === -1 ? indexOfEarliest(freeAt) : free

      seatings.push({
        id: index + 1,
        table,
        start,
        end: start + turnMinutes,
        doubleBooks: free === -1 ? (sittingAt[table] ?? 0) : null,
      })

      freeAt[table] = start + turnMinutes
      sittingAt[table] = index + 1
    })

  return seatings
}

export function countConflicts(seatings: readonly Seating[]): number {
  return seatings.filter((seating) => seating.doubleBooks !== null).length
}

function indexOfEarliest(freeAt: readonly number[]): number {
  return freeAt.indexOf(Math.min(...freeAt))
}

export function formatClock(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24
  const rest = minutes % 60

  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}
