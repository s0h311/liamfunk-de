import { useRouterState } from '@tanstack/react-router'
import { isFullness, isReason, type Fullness, type Reason, type Surface } from './record'

export const SLUG = 'visitor-artifact'

/** Every surface is this one document plus query string. Never the hash: the hash never reaches the server. */
export const FRONT_DOOR = `/proto/${SLUG}`

export type Query = Readonly<{
  /** Which project page, if any. */
  project: string | undefined
  /** The visitor's own trace. Stands in for the session cookie a real build would set. */
  trace: Reason | undefined
  /** Where they left it. */
  at: Surface
  /** Review device, not site copy: which fixture the record is built from. */
  fullness: Fullness
}>

export function useQuery(): Query {
  return useRouterState({
    select: (state) => {
      const search = state.location.search as Record<string, unknown>
      const project = search['p']
      const at = search['at']

      return {
        project: typeof project === 'string' ? project : undefined,
        trace: isReason(search['trace']) ? search['trace'] : undefined,
        at: at === 'tabley' ? ('tabley' as const) : ('front door' as const),
        fullness: isFullness(search['record']) ? search['record'] : ('full' as const),
      }
    },
  })
}

/**
 * Links carry the whole query forward, so the visitor's trace follows them from
 * the front door into a project page and back. In the real build that is a
 * cookie; here it is the URL, which has the side effect of making every state of
 * the artifact a shareable, server-rendered address.
 */
export function href(query: Query, changes: Partial<Query> = {}): string {
  const next = { ...query, ...changes }
  const pairs: [string, string][] = []

  if (next.project !== undefined) pairs.push(['p', next.project])
  if (next.trace !== undefined) pairs.push(['trace', next.trace])
  if (next.trace !== undefined && next.at !== 'front door') pairs.push(['at', next.at])
  if (next.fullness !== 'full') pairs.push(['record', next.fullness])

  const search = pairs.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')

  return search === '' ? FRONT_DOOR : `${FRONT_DOOR}?${search}`
}

/**
 * The escape hatch, and the only thing on the page that is not about the record.
 *
 * Sticky, so S3's first-viewport half holds at any scroll depth: a visitor who
 * wants the email never has to come back up through the artifact to find it. Both
 * affordances are one tap from cold load, and neither requires understanding what
 * the record is.
 */
export function SiteHeader({ home }: Readonly<{ home: boolean }>) {
  return (
    <header className='sticky top-0 z-20 border-b border-white/10 bg-[#0a0a0b]/95 backdrop-blur'>
      <nav className='mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3 text-[0.8rem]'>
        {home ? (
          <span className='font-medium tracking-tight text-[#e8e3d9]'>Liam Funk</span>
        ) : (
          <a
            href={FRONT_DOOR}
            className='py-2 font-medium tracking-tight text-[#e8e3d9] underline-offset-4 hover:underline'
          >
            Liam Funk
          </a>
        )}

        <div className='flex items-center gap-5'>
          <a
            href={home ? '#work' : FRONT_DOOR}
            className='-mx-2 flex min-h-[44px] min-w-[44px] items-center justify-center px-2 text-[#a5a096] underline-offset-4 hover:text-[#e8e3d9] hover:underline'
          >
            Work
          </a>
          <a
            href='mailto:hi@liamfunk.de'
            className='flex min-h-[44px] items-center text-[#e8e3d9] underline decoration-[#d9a441] decoration-2 underline-offset-4'
          >
            hi@liamfunk.de
          </a>
        </div>
      </nav>
    </header>
  )
}

/**
 * The foot. Carries the two things this sketch owes the reader: the real contact
 * routes, and an unhidden admission that nothing here is stored.
 */
export function SiteColophon() {
  return (
    <footer className='border-t border-white/10 px-5 py-10'>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 text-[0.8rem] text-[#8b867d] sm:flex-row sm:justify-between'>
        <div className='space-y-1'>
          <p>
            <a
              href='mailto:hi@liamfunk.de'
              /* 44px in the foot as well as the header: the contact route should not
                 be the one link on the page a thumb misses. */
              className='inline-flex min-h-[44px] items-center text-[#e8e3d9] underline underline-offset-4'
            >
              hi@liamfunk.de
            </a>{' '}
            · Hamburg
          </p>
          <p>
            <a
              href='https://github.com/s0h311'
              className='inline-flex min-h-[44px] items-center underline underline-offset-4 hover:text-[#e8e3d9]'
            >
              GitHub
            </a>{' '}
            ·{' '}
            {/* Visibly faked rather than invented: docs/raw-material.md lists the LinkedIn URL and the CV as missing. */}
            <span className='text-[#5c584f] line-through decoration-[#5c584f]'>LinkedIn</span>{' '}
            <span className='text-[#5c584f]'>(URL still missing)</span> ·{' '}
            <span className='text-[#5c584f] line-through decoration-[#5c584f]'>CV</span>{' '}
            <span className='text-[#5c584f]'>(PDF not written yet)</span>
          </p>
        </div>

        <p className='max-w-sm text-[0.72rem] leading-relaxed text-[#5c584f]'>
          Prototype note, not site copy: the record on this page is a fixture of 148 invented arrivals, and your line
          lives in the query string, not in a database. Round one of the concept comparison for issue #19.
        </p>
      </div>
    </footer>
  )
}
