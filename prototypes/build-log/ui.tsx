import type { ReactNode } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'

export const SLUG = 'build-log'

/**
 * The cursor — which moment of its own construction the site is rendering as —
 * lives in the query string, never the hash. That is what makes every state of
 * this page a real server-rendered document: the rewind works with JavaScript
 * off, because each step is a document navigation rather than a re-render.
 */
export type Search = Record<string, string | number>

export function useSearch(): Search {
  return useRouterState({
    select: (state) => (state.location.search ?? {}) as Search,
  })
}

export function readCursor(search: Search, last: number): number {
  const raw = search['t']
  const parsed = typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? ''), 10)

  if (Number.isNaN(parsed)) {
    return last
  }

  return Math.min(last, Math.max(0, parsed))
}

/**
 * `<Link>` for the cursor: the single-document path is deliberate for a control
 * you press repeatedly, and with JavaScript off it is still an `<a href>`. Plain
 * `<a>` is used for cross-document navigation — front door to case study — and
 * for everything that leaves the site.
 */
export function Cursor({
  to,
  className,
  label,
  children,
}: Readonly<{ to: number; className: string; label?: string; children: ReactNode }>) {
  return (
    <Link
      to='/proto/$slug'
      params={{ slug: SLUG }}
      search={{ t: to }}
      resetScroll={false}
      aria-label={label}
      className={className}
    >
      {children}
    </Link>
  )
}

export const PAGE = 'min-h-dvh bg-white font-sans text-neutral-900 antialiased [&_[data-proto-chrome]]:opacity-20'
export const COLUMN = 'mx-auto w-full max-w-3xl px-5 sm:px-6'

/**
 * Deliberately not a terminal. A build log wants to look like an instrument, and
 * the nearest available cliché — green text on black — is a listed anti-target
 * that would be this concept's whole surface. So: ruled paper, ink, monospace
 * only where a value is a value.
 */
export const LABEL = 'text-[13px] font-medium text-neutral-500'
export const MONO = 'font-mono text-[13px] tabular-nums'

export function Masthead({ home }: Readonly<{ home: boolean }>) {
  return (
    <header className='border-b border-neutral-900'>
      <div className={`${COLUMN} flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2`}>
        <div className='flex items-baseline gap-3'>
          {home ? (
            <span className='text-base font-semibold tracking-tight'>Liam Funk</span>
          ) : (
            <a
              href={`/proto/${SLUG}`}
              className='text-base font-semibold tracking-tight underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
            >
              Liam Funk
            </a>
          )}
          <span className='text-sm text-neutral-500'>Hamburg</span>
        </div>
        <nav className='flex items-center gap-5 text-sm'>
          <a
            href={home ? '#work' : `/proto/${SLUG}#work`}
            className='inline-flex h-11 min-w-11 items-center justify-center text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950 hover:decoration-neutral-900'
          >
            Work
          </a>
          <a
            href='mailto:hi@liamfunk.de'
            className='inline-flex h-11 items-center font-mono text-[13px] text-neutral-950 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
          >
            hi@liamfunk.de
          </a>
        </nav>
      </div>
    </header>
  )
}

/** A hole in docs/raw-material.md, shown as a hole rather than filled in. */
export function Pending({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className='border-b border-dashed border-neutral-400 text-neutral-500'>
      {children}
      <span className='ml-1 align-super text-[0.6rem] tracking-wide text-neutral-400'>pending</span>
    </span>
  )
}

export function Colophon({ takenAt }: Readonly<{ takenAt: string }>) {
  return (
    <footer className='mt-16 border-t border-neutral-900 py-10'>
      <div className={COLUMN}>
        <ul className='flex flex-wrap items-center gap-x-8 text-sm text-neutral-700'>
          <li>
            <a
              href='mailto:hi@liamfunk.de'
              className='inline-flex h-11 items-center font-mono text-[13px] text-neutral-950 underline decoration-neutral-400 underline-offset-4'
            >
              hi@liamfunk.de
            </a>
          </li>
          <li>
            <a
              href='https://github.com/s0h311'
              className='inline-flex h-11 items-center underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
            >
              GitHub
            </a>
          </li>
          <li>
            <Pending>LinkedIn</Pending>
          </li>
          <li>
            <Pending>CV (PDF)</Pending>
          </li>
        </ul>
        <p className='mt-6 max-w-prose text-xs leading-relaxed text-neutral-400'>
          Prototype. The prose comes from <code>docs/raw-material.md</code> and the dashed items are holes in it, left
          visible rather than invented. Everything in the log is read from the repository itself — commits, their
          co-author trailers, and the issues on <code>s0h311/liamfunk-de</code> — snapshotted at build time,{' '}
          {takenAt.replace('T', ' ').replace('Z', ' UTC')}.
        </p>
      </div>
    </footer>
  )
}
