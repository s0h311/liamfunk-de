import type { ReactNode } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'

export const SLUG = 'reading-interface'

/**
 * The whole site is one document, so "opening" something is not a destination —
 * it is a change to what this document currently shows. That change is the
 * search string: `?open=tabley,matrix`.
 *
 * Never the hash. The hash never reaches the server, and a concept whose state
 * is the hash silently fails the no-JS screen while looking fine in a browser.
 * The `#t-<id>` fragment these links *do* carry is not state: it is a scroll
 * anchor, and the same URL without it renders the identical document. Drop it
 * and you lose your reading position on the JavaScript-off path, nothing else.
 */
export type Search = Record<string, string | number>

export function useSearch(): Search {
  return useRouterState({
    select: (state) => (state.location.search ?? {}) as Search,
  })
}

export function openIds(search: Search): readonly string[] {
  const raw = search['open']

  return typeof raw === 'string' && raw.length > 0 ? raw.split(',') : []
}

export function isOpen(search: Search, id: string): boolean {
  return openIds(search).includes(id)
}

/** The link target for flipping one transclusion, open ⇄ closed. */
export function toggled(search: Search, id: string): Search {
  const ids = openIds(search)
  const next = ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id]
  const { open: _open, ...rest } = search

  return next.length === 0 ? rest : { ...rest, open: next.join(',') }
}

export type Source = {
  /** The real link the transclusion is an enhancement over — never a replacement. */
  href: string
  label: string
  /** True when the destination is this same sketch rendered as its own document. */
  internal?: boolean
}

/**
 * `<Link>`, not a plain `<a>`: expanding a passage in the document you are
 * reading is the single-document path by definition, and `resetScroll={false}`
 * keeps the words under your thumb where they were. With JavaScript off it is
 * still an `<a href>` and the expansion becomes a document navigation instead —
 * which is why every one of these carries the `#t-<id>` anchor as well.
 */
function ToggleLink({
  search,
  id,
  className,
  label,
  children,
}: Readonly<{ search: Search; id: string; className: string; label: string; children: ReactNode }>) {
  return (
    <Link
      to='/proto/$slug'
      params={{ slug: SLUG }}
      search={toggled(search, id)}
      hash={`t-${id}`}
      resetScroll={false}
      aria-label={label}
      aria-expanded={isOpen(search, id)}
      aria-controls={`t-${id}`}
      className={className}
    >
      {children}
    </Link>
  )
}

/**
 * The affordance, and the whole S2 problem in one class list. A prose line is
 * 32px tall and a 44px word would wreck the column, so the marker takes its
 * height from vertical padding on the inline box — which grows the tap target
 * without moving a single line of type — and stays visually the width of a `+`.
 */
const MARKER =
  'ml-px py-2.5 align-super font-mono text-[0.7em] text-stone-500 no-underline dark:text-stone-400'

const WORD =
  'py-2.5 underline decoration-stone-400 decoration-dotted underline-offset-4 hover:decoration-stone-900 focus-visible:rounded-xs focus-visible:bg-amber-200/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:decoration-stone-500 dark:hover:decoration-stone-200 dark:focus-visible:bg-amber-400/25 dark:focus-visible:outline-stone-200'

/* ------------------------------------------------------------- the device */

/**
 * The signature interaction: a link in the prose that opens where it stands,
 * with the URL following it.
 *
 * This renders the *word* only. The passage it opens is rendered by <Passage>,
 * immediately after the paragraph rather than inside it — an <aside> nested in
 * a <p> is hoisted straight back out by the HTML parser, and the hydrated DOM
 * then stops matching the markup the server sent. Under a concept whose whole
 * claim is that the served document is the real one, that is not a detail.
 */
export function Word({
  search,
  id,
  label,
  children,
}: Readonly<{ search: Search; id: string; label: string; children: ReactNode }>) {
  const open = isOpen(search, id)

  return (
    <ToggleLink
      search={search}
      id={id}
      label={open ? `Close ${label}` : `Open ${label} here`}
      className={WORD}
    >
      {children}
      <span
        aria-hidden='true'
        className={MARKER}
      >
        {open ? '×' : '+'}
      </span>
    </ToggleLink>
  )
}

/** The same device standing on its own line: a whole entry that expands. */
export function Row({
  search,
  id,
  title,
  aside,
  gloss,
  source,
  children,
}: Readonly<{
  search: Search
  id: string
  title: string
  aside: string
  gloss: ReactNode
  source?: Source
  children: ReactNode
}>) {
  const open = isOpen(search, id)

  return (
    <li className='border-b border-stone-300 last:border-b-0 dark:border-stone-700'>
      <ToggleLink
        search={search}
        id={id}
        label={open ? `Close ${title}` : `Open ${title} here`}
        className='flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1 py-4 hover:bg-stone-200/50 focus-visible:bg-amber-200/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stone-900 dark:hover:bg-stone-800/50 dark:focus-visible:bg-amber-400/20 dark:focus-visible:outline-stone-200'
      >
        <span className='font-medium text-stone-950 dark:text-stone-50'>{title}</span>
        <span className='font-mono text-xs text-stone-500 dark:text-stone-400'>{aside}</span>
        <span
          aria-hidden='true'
          className='ml-auto font-mono text-xs whitespace-nowrap text-stone-500 dark:text-stone-400'
        >
          {open ? '− close' : '+ open here'}
        </span>
        <span className='w-full text-stone-600 dark:text-stone-400'>{gloss}</span>
      </ToggleLink>
      {open ? (
        <div className='pb-2'>
          <Panel
            search={search}
            id={id}
            source={source}
            label={title}
          >
            {children}
          </Panel>
        </div>
      ) : null}
    </li>
  )
}

/**
 * Everything that opens, opens like this: ruled on the left, labelled with the
 * real link it came from, and closable from its own foot as well as from the
 * word that opened it.
 */
export function Panel({
  search,
  id,
  source,
  label,
  children,
}: Readonly<{ search: Search; id: string; source?: Source; label: string; children: ReactNode }>) {
  return (
    <aside
      id={`t-${id}`}
      className='my-4 scroll-mt-20 border-l-2 border-stone-400 pl-4 sm:pl-6 dark:border-stone-600'
    >
      <p className='mb-3 flex flex-wrap items-baseline gap-x-3 font-mono text-xs text-stone-500 dark:text-stone-400'>
        <span>transcluded</span>
        {source === undefined ? null : (
          <a
            href={source.href}
            className='underline decoration-stone-400 underline-offset-4 hover:decoration-stone-900 dark:hover:decoration-stone-200'
          >
            {source.label} {source.internal === true ? '→' : '↗'}
          </a>
        )}
      </p>
      <div className='[&>*+*]:mt-3'>{children}</div>
      <p className='mt-4'>
        <ToggleLink
          search={search}
          id={id}
          label={`Close ${label}`}
          className='inline-flex h-11 items-center font-mono text-xs text-stone-500 underline decoration-stone-400 underline-offset-4 hover:text-stone-900 focus-visible:bg-amber-200/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:text-stone-400 dark:hover:text-stone-100 dark:focus-visible:bg-amber-400/25 dark:focus-visible:outline-stone-200'
        >
          − close
        </ToggleLink>
      </p>
    </aside>
  )
}

/* ------------------------------------------------------------------- note */

/**
 * gwern's other device, and the one the touch screen is most likely to catch.
 * Wide enough, the note is simply *there* in the margin and nothing has to be
 * tapped or hovered to read it. Narrow, it collapses into the same transclusion
 * as everything else — the marker is a link, never a hover target.
 */
export function Note({
  search,
  id,
  n,
  children,
}: Readonly<{ search: Search; id: string; n: number; children: ReactNode }>) {
  const open = isOpen(search, id)

  return (
    <>
      <ToggleLink
        search={search}
        id={id}
        label={open ? `Close note ${n}` : `Open note ${n}`}
        className='px-1.5 py-2.5 align-super font-mono text-xs text-stone-600 underline decoration-stone-400 underline-offset-2 hover:text-stone-950 focus-visible:rounded-xs focus-visible:bg-amber-200/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-stone-900 xl:pointer-events-none dark:text-stone-400 dark:hover:text-stone-100 dark:focus-visible:bg-amber-400/25 dark:focus-visible:outline-stone-200'
      >
        [{n}]
      </ToggleLink>
      <span
        id={`t-${id}`}
        className={`${open ? 'block' : 'hidden'} my-3 scroll-mt-20 border-l-2 border-stone-400 pl-4 font-sans text-sm/6 text-stone-600 sm:pl-6 xl:absolute xl:left-full xl:my-0 xl:-mt-7 xl:ml-10 xl:block xl:w-56 xl:border-l-0 xl:pl-0 dark:border-stone-600 dark:text-stone-400`}
      >
        <span className='mr-1.5 font-mono text-xs text-stone-500 dark:text-stone-500'>[{n}]</span>
        {children}
      </span>
    </>
  )
}

/* ------------------------------------------------------------------ holes */

/**
 * A fact `docs/raw-material.md` does not have yet. Marked on the page rather
 * than invented.
 */
export function Pending({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className='rounded-xs bg-amber-100 px-1 py-0.5 font-mono text-[0.8em] text-amber-900 ring-1 ring-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800'>
      pending: {children}
    </span>
  )
}
