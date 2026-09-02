import type { ReactNode } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'

export const SLUG = 'explorable'

/**
 * Every control on this sketch is a link, and the model's whole state lives in
 * the query string — never the hash, which never reaches the server. That is
 * what lets the figures render server-side at *any* state, so the explorable
 * still runs with JavaScript disabled: each step is a document navigation
 * instead of a re-render.
 */
export type Search = Record<string, string | number>

export function useSearch(): Search {
  return useRouterState({
    select: (state) => (state.location.search ?? {}) as Search,
  })
}

/**
 * Numbers stay numbers in the search object: the router's serialiser quotes a
 * string that looks like a number (`?i=%228%22`) so it survives the round trip,
 * and a quoted number is an ugly URL for a figure whose state *is* the URL.
 */
export type Bounded = {
  key: string
  fallback: number
  min: number
  max: number
}

export function readNumber(search: Search, { key, fallback, min, max }: Bounded): number {
  const raw = search[key]
  const parsed = typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? ''), 10)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(max, Math.max(min, parsed))
}

export function withValues(search: Search, values: Search): Search {
  return { ...search, ...values }
}

/**
 * `<Link>` rather than a plain `<a>`: the single-document path is deliberate for
 * the model's own controls, so poking a figure twenty times is twenty renders
 * and not twenty document loads. With JavaScript off it is still an `<a href>`,
 * which is the whole point. Cross-document navigation on this sketch — front
 * door to case study — uses a plain `<a>` instead.
 */
function SketchLink({
  search,
  className,
  children,
  label,
}: Readonly<{ search: Search; className: string; children: ReactNode; label?: string }>) {
  return (
    <Link
      to='/proto/$slug'
      params={{ slug: SLUG }}
      search={search}
      resetScroll={false}
      aria-label={label}
      className={className}
    >
      {children}
    </Link>
  )
}

const STEP_BUTTON =
  'flex h-11 w-11 shrink-0 items-center justify-center border border-neutral-300 text-lg text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900'

const STEP_BUTTON_SPENT =
  'flex h-11 w-11 shrink-0 items-center justify-center border border-neutral-200 text-lg text-neutral-300'

/**
 * Steppers and tap-to-set, deliberately — not draggable objects. A drag handle
 * is the explorable genre's signature and it is exactly the part that does not
 * survive a phone.
 */
export function Stepper({
  label,
  value,
  unit,
  down,
  up,
}: Readonly<{ label: string; value: string; unit?: string; down: Search | null; up: Search | null }>) {
  return (
    <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3'>
      <div className='w-32 shrink-0 text-xs uppercase tracking-widest text-neutral-500'>{label}</div>
      <div className='flex items-center'>
        {down === null ? (
          <span
            className={STEP_BUTTON_SPENT}
            aria-hidden='true'
          >
            −
          </span>
        ) : (
          <SketchLink
            search={down}
            className={STEP_BUTTON}
            label={`Fewer ${label.toLowerCase()}`}
          >
            −
          </SketchLink>
        )}
        <output className='flex h-11 min-w-20 items-center justify-center border-y border-neutral-300 px-3 font-mono text-base tabular-nums text-neutral-950'>
          {value}
          {unit === undefined ? null : <span className='ml-1 text-xs text-neutral-500'>{unit}</span>}
        </output>
        {up === null ? (
          <span
            className={STEP_BUTTON_SPENT}
            aria-hidden='true'
          >
            +
          </span>
        ) : (
          <SketchLink
            search={up}
            className={STEP_BUTTON}
            label={`More ${label.toLowerCase()}`}
          >
            +
          </SketchLink>
        )}
      </div>
    </div>
  )
}

/** Tap-to-set: the whole set of choices is visible, no drag, no menu. */
export function Choice({
  label,
  options,
}: Readonly<{
  label: string
  options: readonly { value: string; current: boolean; search: Search }[]
}>) {
  return (
    <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3'>
      <div className='w-32 shrink-0 text-xs uppercase tracking-widest text-neutral-500'>{label}</div>
      <div className='flex flex-wrap items-center'>
        {options.map((option) =>
          option.current ? (
            <span
              key={option.value}
              aria-current='true'
              className='flex h-11 items-center border border-neutral-900 bg-neutral-900 px-4 font-mono text-sm tabular-nums text-white'
            >
              {option.value}
            </span>
          ) : (
            <SketchLink
              key={option.value}
              search={option.search}
              className='flex h-11 items-center border border-neutral-300 px-4 font-mono text-sm tabular-nums text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900'
            >
              {option.value}
            </SketchLink>
          ),
        )}
      </div>
    </div>
  )
}

/** A hole in docs/raw-material.md, shown as a hole rather than filled in. */
export function Pending({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className='border-b border-dashed border-neutral-400 text-neutral-500'>
      {children}
      <span className='ml-1 align-super text-[0.6rem] uppercase tracking-widest text-neutral-400'>pending</span>
    </span>
  )
}
