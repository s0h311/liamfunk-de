import type { ReactNode } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { SLUG, type CheatId, type Search } from './cheats'

export function useSearch(): Search {
  return useRouterState({
    select: (state) => (state.location.search ?? {}) as Search,
  })
}

export function merge(search: Search, values: Search): Search {
  return { ...search, ...values }
}

/**
 * `<Link>` for anything that stays in this document — flipping a cheat, taking a
 * turn — so the trainer feels like a trainer rather than a form submit. With
 * JavaScript off it is still an `<a href>` and the server renders the same state,
 * which is the entire reason the cheats live in the query string. Cross-document
 * navigation (front door to case study) uses a plain `<a>` instead.
 */
export function StateLink({
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

/* ------------------------------------------------------------------- chrome */

export const PAGE = 'min-h-dvh bg-[#f7f5f1] font-sans text-neutral-900 antialiased [&_[data-proto-chrome]]:opacity-20'
export const COLUMN = 'mx-auto w-full max-w-3xl px-5'

/**
 * The unglamorous bar. It is not a cheat, it is not in the game, and it does not
 * know the joke exists: a recruiter with thirty seconds taps the address and is
 * gone. Sticky, so it is still there at the bottom of the case study.
 */
export function Masthead({ home, search }: Readonly<{ home: boolean; search: Search }>) {
  return (
    <header
      data-hb='header'
      className='sticky top-0 z-20 border-b border-neutral-300 bg-[#f7f5f1]/95 backdrop-blur'
    >
      <div className={`${COLUMN} flex flex-wrap items-center justify-between gap-x-6 gap-y-0.5 py-1.5`}>
        <p className='text-[0.95rem]'>
          {home ? (
            <span className='font-semibold tracking-tight text-neutral-950'>Liam Funk</span>
          ) : (
            <a
              href={hrefFor(search, { p: undefined })}
              className='font-semibold tracking-tight text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
            >
              Liam Funk
            </a>
          )}
          <span className='ml-3 text-sm text-neutral-500'>Hamburg</span>
        </p>
        <nav
          data-hb='nav'
          className='flex items-center gap-5 text-sm'
        >
          <a
            href={home ? '#work' : hrefFor(search, { p: undefined })}
            className='inline-flex h-11 min-w-11 items-center justify-center text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950 hover:decoration-neutral-900'
          >
            Work
          </a>
          <a
            href='mailto:hi@liamfunk.de'
            className='inline-flex h-11 items-center font-mono text-[0.9rem] text-neutral-950 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
          >
            hi@liamfunk.de
          </a>
        </nav>
      </div>
    </header>
  )
}

function hrefFor(search: Search, values: Search): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries({ ...search, ...values })) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }

  const query = params.toString()

  return query === '' ? `/proto/${SLUG}` : `/proto/${SLUG}?${query}`
}

export { hrefFor }

export function Colophon() {
  return (
    <footer
      data-hb='footer'
      className='mt-16 border-t border-neutral-300 py-6'
    >
      <div className={`${COLUMN} space-y-1 text-xs leading-relaxed text-neutral-500`}>
        <p>
          Prototype for{' '}
          <a
            href='https://github.com/s0h311/liamfunk-de/issues/20'
            className='underline underline-offset-2'
          >
            round one, concept 6
          </a>
          . Throwaway. Every word comes from <code>docs/raw-material.md</code>.
        </p>
        <p>
          <a
            href='mailto:hi@liamfunk.de'
            className='underline underline-offset-2'
          >
            hi@liamfunk.de
          </a>{' '}
          ·{' '}
          <a
            href='https://github.com/s0h311'
            className='underline underline-offset-2'
          >
            github.com/s0h311
          </a>
        </p>
      </div>
    </footer>
  )
}

/* --------------------------------------------------------------- the fakes */

/**
 * A hole in `docs/raw-material.md`, rendered as a hole. It is visible without
 * any cheat — that is the house rule — and WALLHACK adds what is actually
 * missing behind it.
 */
export function Fake({
  children,
  missing,
  cheats,
}: Readonly<{ children: ReactNode; missing: string; cheats: ReadonlySet<CheatId> }>) {
  if (!cheats.has('wallhack')) {
    return <span className='text-neutral-500 italic'>{children}</span>
  }

  return (
    <span className='bg-[#ffe8a3] px-1 text-neutral-800 not-italic ring-1 ring-[#c9a227]'>
      {children}
      <span className='ml-1.5 font-mono text-[0.7rem] tracking-tight text-[#8a6d00] uppercase'>missing: {missing}</span>
    </span>
  )
}

/* ------------------------------------------------------------- the hitboxes */

/**
 * SHOW HITBOXES draws the thing the SEO/GEO screen actually cares about: the
 * semantic document under the game. It is a cheat because a trainer showing you
 * the collision geometry is the same gesture — here the geometry is `<header>`,
 * `<main>`, `<h1>`, `<ul>`, and every one of them is really there.
 */
export function HitboxStyles() {
  return (
    <style>{`
      [data-hb] { position: relative; outline: 1px solid #7c5cff; outline-offset: 2px; }
      [data-hb]::before {
        content: attr(data-hb);
        position: absolute; top: -0.85rem; left: -0.1rem; z-index: 30;
        font: 600 0.66rem/1 ui-monospace, SFMono-Regular, Menlo, monospace;
        letter-spacing: 0.04em; color: #fff; background: #7c5cff;
        padding: 0.15rem 0.3rem; pointer-events: none; white-space: nowrap;
      }
      [data-hb="header"]::before, [data-hb="nav"]::before { top: 0.15rem; }
      main :is(h1, h2, h3) { outline: 1px solid #c2410c; outline-offset: 2px; }
      main :is(p, li, dt, dd) { outline: 1px dotted rgba(124, 92, 255, 0.35); }
      main a[href] { outline: 1px solid rgba(14, 138, 22, 0.55); }
      main a[href^="mailto:"] { outline: 2px solid #0e8a16; }
    `}</style>
  )
}

/** The key to what the outlines mean. It is only rendered when the cheat is on. */
export function HitboxLegend() {
  const keys: readonly [string, string][] = [
    ['#7c5cff', 'landmark — header, main, section, aside, ul, footer'],
    ['#c2410c', 'heading — h1, h2, h3'],
    ['rgba(124, 92, 255, 0.35)', 'text block — p, li'],
    ['#0e8a16', 'link, and the email in bold'],
  ]

  return (
    <p className='mt-3 flex flex-wrap gap-x-5 gap-y-1 border border-[#7c5cff] bg-white px-3 py-2 font-mono text-[0.7rem] text-neutral-700'>
      <span className='font-semibold tracking-[0.08em] text-[#5b3fd1] uppercase'>Hitboxes</span>
      {keys.map(([colour, label]) => (
        <span
          key={label}
          className='inline-flex items-center gap-1.5'
        >
          <span
            aria-hidden
            className='inline-block h-2.5 w-2.5 shrink-0'
            style={{ background: colour }}
          />
          {label}
        </span>
      ))}
      <span className='basis-full text-neutral-500'>
        Every box is a real element in the served HTML. None of it is drawn by JavaScript.
      </span>
    </p>
  )
}
