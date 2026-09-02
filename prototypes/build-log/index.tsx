import type { PrototypeMeta } from '../types'
import type { BuildState } from './log'
import { momentsOf, stateAt } from './log'
import { SNAPSHOT } from './snapshot'
import { Backlog, Dashboard, Timeline } from './timeline'
import { COLUMN, Colophon, Masthead, MONO, PAGE, Pending, SLUG, readCursor, useSearch, type Search } from './ui'

export const meta: PrototypeMeta = {
  title: 'The Live Build Log',
  positioning: 'playground',
  note: 'Round one, concept 3. The site documents its own construction from its real git history and its real issue tracker — and you can rewind it to any moment of that construction, because the cursor is a link and the state is in the URL.',
}

/** The ticket that asked for this page. It is in the backlog below, and it is open. */
const THIS_TICKET = 17

export default function BuildLog() {
  const search = useSearch()

  return search['p'] === 'tabley' ? <Tabley /> : <FrontDoor search={search} />
}

/* --------------------------------------------------------------- front door */

const MOMENTS = momentsOf(SNAPSHOT)
const LAST = MOMENTS.length - 1

function FrontDoor({ search }: Readonly<{ search: Search }>) {
  const cursor = readCursor(search, LAST)
  const state = stateAt({ snapshot: SNAPSHOT, moments: MOMENTS, cursor })

  return (
    <div className={PAGE}>
      <Masthead home />

      <main className={`${COLUMN} pt-12`}>
        <h1 className='max-w-prose text-2xl leading-snug font-semibold tracking-tight text-neutral-950 sm:text-3xl'>
          Liam Funk builds web products end-to-end from Hamburg, and runs Rock Science, a one-person product studio
          behind{' '}
          <a
            href='https://tabley.de'
            className='underline decoration-neutral-300 underline-offset-[6px] hover:decoration-neutral-900'
          >
            tabley
          </a>
          .
        </h1>

        <Standing state={state} />

        <section
          id='build'
          className='mt-10'
        >
          <Dashboard
            state={state}
            cursor={cursor}
            last={LAST}
            latestAt={MOMENTS[LAST]?.at ?? SNAPSHOT.takenAt}
          />
          <Backlog
            state={state}
            here={THIS_TICKET}
          />
        </section>

        <section
          id='log'
          className='mt-14'
        >
          <h2 className='text-lg font-semibold tracking-tight'>The log</h2>
          <p className='mt-1 max-w-prose text-[15px] leading-relaxed text-neutral-600'>
            Every commit and every issue, in order. The times are links, and the panel above re-reads the site as it
            stood at whichever one you pick.
          </p>
          <Timeline
            moments={MOMENTS}
            cursor={cursor}
          />
        </section>

        <Work />
        <About />
      </main>

      <Colophon takenAt={SNAPSHOT.takenAt} />
    </div>
  )
}

/**
 * The one paragraph that would normally be a claim about how the site was built.
 * Here every number in it is read off the cursor, so rewinding rewrites it.
 */
function Standing({ state }: Readonly<{ state: BuildState }>) {
  const decided = state.closedTickets.length
  const open = state.openTickets.length
  const hours = Math.round(state.elapsedHours)

  return (
    <p className='mt-5 max-w-prose text-[17px] leading-relaxed text-neutral-700'>
      You are reading it{' '}
      <strong className='font-semibold text-neutral-950'>
        {hours < 1 ? 'in its first hour' : `${hours} hour${hours === 1 ? '' : 's'}`}
      </strong>{' '}
      into its own construction. {state.commits.length} {state.commits.length === 1 ? 'commit exists' : 'commits exist'}
      , <strong className='font-semibold text-neutral-950'>{state.agentCommits} of them written by an agent</strong>{' '}
      while nobody was at the keyboard.{' '}
      {decided === 0
        ? `Nothing has been decided yet; ${open === 0 ? 'the questions are not even written down' : `${open} questions are open`}.`
        : `${decided} decisions are closed and ${open} questions are still open.`}{' '}
      None of the real site is built — this page included. It is one of six sketches arguing about what the site should
      be, and it is arguing by showing you the argument.
    </p>
  )
}

/* ---------------------------------------------------------------------- work */

function Work() {
  return (
    <section
      id='work'
      className='mt-16'
    >
      <h2 className='border-b border-neutral-900 pb-1 text-lg font-semibold tracking-tight'>Work</h2>
      <ul className='divide-y divide-neutral-200'>
        <Project
          name='tabley'
          state='live · the flagship'
          href='https://tabley.de'
        >
          <p>
            Online table reservations for German restaurants, built and maintained as a Rock Science product rather than
            a side project. Public discovery and booking on one side; a merchant login on the other. Self-hosted end to
            end, with assets served from Rock Science's own Hetzner object storage. Four live restaurants —{' '}
            <Pending>their names</Pending>, because nobody has asked them yet.
          </p>
          <p className='mt-1.5'>
            <a
              href={`/proto/${SLUG}?p=tabley`}
              className='inline-flex min-h-11 items-center font-medium underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
            >
              Read the case study →
            </a>
          </p>
        </Project>

        <Project
          name='project-matrix'
          state='in construction'
          href='https://github.com/s0h311/project-matrix'
        >
          <p>
            A framework for AFK agentic development, in Go. It is not built yet: the README carries the problem
            statement and the solution sections are still empty. The argument it makes is that one agent over a whole
            spec leaves the non-dumb zone, that implementation without rules returns garbage, and that a 200-file diff
            cannot be reviewed.
          </p>
        </Project>

        <Project
          name='matrix'
          state='shipping today'
          href='https://github.com/s0h311/matrix'
        >
          <p>
            Spawns AFK agents — each one named Smith — that work through GitHub issues one at a time, with deterministic
            format, lint and test gates between them. It is configured in this repository:{' '}
            <code className={MONO}>.matrix/config.json</code> is a committed file, pointed at the same issue tracker the
            log above is read from.
          </p>
        </Project>

        <Project
          name='smith'
          state='shipping'
          href='https://github.com/s0h311/smith'
        >
          <p>
            Generates an empty TanStack Start project optimised for agentic engineering — the scaffold this site was
            generated from. It is the first entry in the log above: 82 files, 6,074 lines, and nothing of Liam's in it
            yet.
          </p>
        </Project>

        <Project
          name='Workshops'
          state='history, not an offer'
        >
          <p>
            Web Development Workshop 2024 at HAW Hamburg; an MCP series in 2025 (server, server over streamable HTTP,
            client); reusable components; server setup and auto-deployment; React 2026. Kept as evidence, with no
            booking path — teaching is not part of the pitch.
          </p>
        </Project>
      </ul>
    </section>
  )
}

function Project({
  name,
  state,
  href,
  children,
}: Readonly<{ name: string; state: string; href?: string; children: React.ReactNode }>) {
  return (
    <li className='py-4'>
      <div className='flex flex-wrap items-baseline gap-x-3'>
        <h3 className='text-[17px] font-semibold tracking-tight'>
          {href === undefined ? (
            name
          ) : (
            <a
              href={href}
              className='inline-flex min-h-11 items-center underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
            >
              {name}
            </a>
          )}
        </h3>
        <span className={`${MONO} text-neutral-500`}>{state}</span>
      </div>
      <div className='mt-1 max-w-prose text-[15px] leading-relaxed text-neutral-700'>{children}</div>
    </li>
  )
}

function About() {
  return (
    <section
      id='about'
      className='mt-16'
    >
      <h2 className='border-b border-neutral-900 pb-1 text-lg font-semibold tracking-tight'>Liam</h2>
      <div className='mt-3 max-w-prose space-y-3 text-[15px] leading-relaxed text-neutral-700'>
        <p>
          He started programming at eleven for an unglamorous reason: he was bad at the computer games he wanted to be
          good at, so he learned to write hacks for them instead. He has been writing software ever since —
          professionally since 2022, and he studied Business Information Systems at HAW Hamburg, finishing in April
          2025.
        </p>
        <p>
          Alongside the product work he builds tooling for agentic engineering — systems that let coding agents work
          through a backlog while nobody is at the keyboard, and that keep the output reviewable when they do. He plays
          music, and he travels.
        </p>
        <p>
          He is available for building web applications end-to-end and for agentic engineering consulting.{' '}
          <a
            href='mailto:hi@liamfunk.de'
            className='inline-flex min-h-11 items-center font-mono text-[14px] underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
          >
            hi@liamfunk.de
          </a>
        </p>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- case study */

function Tabley() {
  return (
    <div className={PAGE}>
      <Masthead home={false} />

      <main className={`${COLUMN} pt-12`}>
        <p className={`${MONO} text-neutral-500`}>Case study · the one entry with one</p>
        <h1 className='mt-1 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl'>tabley</h1>
        <p className='mt-3 max-w-prose text-[17px] leading-relaxed text-neutral-700'>
          A live restaurant reservation platform serving real German restaurants, built and run by Rock Science. Public
          discovery and booking on one side, a merchant dashboard on the other, self-hosted end to end.{' '}
          <a
            href='https://tabley.de'
            className='underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
          >
            tabley.de
          </a>
          .
        </p>

        <dl className='mt-8 grid grid-cols-2 border border-neutral-900 sm:grid-cols-4'>
          <Fact
            label='status'
            value='live'
          />
          <Fact
            label='restaurants'
            value='4'
          />
          <Fact
            label='source'
            value='private'
          />
          <Fact
            label='language'
            value='German'
          />
        </dl>

        <section className='mt-10 max-w-prose space-y-3 text-[15px] leading-relaxed text-neutral-700'>
          <h2 className='text-lg font-semibold tracking-tight text-neutral-950'>What it is</h2>
          <p>
            Restaurants take bookings by phone and on paper. tabley puts the booking on the restaurant's own page and
            the diary on a screen the staff already have: guests discover and book on one side, and the restaurant
            manages the evening through a merchant login on the other.
          </p>
          <p>
            It is self-hosted rather than assembled from platforms — including the assets, which are served from Rock
            Science's own Hetzner object storage. It is German-language and server-rendered, and it has real customers,
            which is the part that matters: it is the one project here that proves shipped-and-maintained rather than
            built-and-abandoned.
          </p>
        </section>

        <section className='mt-10'>
          <h2 className='text-lg font-semibold tracking-tight text-neutral-950'>What this page is still missing</h2>
          <p className='mt-1 max-w-prose text-[15px] leading-relaxed text-neutral-600'>
            The site keeps its own gaps as tracked work rather than writing around them. These three are open, and this
            is where they will land.
          </p>
          <ul className='mt-4 divide-y divide-neutral-200 border-y border-neutral-900'>
            <Gap title='Screenshots of the booking flow and the merchant dashboard'>
              None have been taken. The page renders no image rather than a placeholder image.
            </Gap>
            <Gap title='The architecture write-up'>
              Self-hosted, SSR, own object storage is what is known. The decisions behind it — why self-hosted, what the
              diary model actually is — have not been written down anywhere yet.
            </Gap>
            <Gap title='Permission to name the four restaurants'>
              They are real and they are live, and none of them has been asked whether they want to be named on Liam's
              site. Until one of them says yes, this page says "four".
            </Gap>
          </ul>
          <p className={`mt-3 ${MONO} text-neutral-500`}>
            source: docs/raw-material.md → Still needed · tracked, not decorative
          </p>
        </section>

        <section className='mt-12 border-t border-neutral-200 pt-4'>
          <p className='max-w-prose text-[15px] leading-relaxed text-neutral-600'>
            This page exists because of{' '}
            <a
              href='https://github.com/s0h311/liamfunk-de/issues/17'
              className='underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
            >
              <span className={MONO}>#17</span> Round one: The Live Build Log
            </a>
            , which is still open.{' '}
            <a
              href={`/proto/${SLUG}#log`}
              className='underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
            >
              See where it sits in the log →
            </a>
          </p>
        </section>
      </main>

      <Colophon takenAt={SNAPSHOT.takenAt} />
    </div>
  )
}

function Fact({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className='border-r border-neutral-200 px-3 py-2 last:border-r-0'>
      <dt className='text-[13px] font-medium text-neutral-500'>{label}</dt>
      <dd className='font-mono text-lg tabular-nums text-neutral-950'>{value}</dd>
    </div>
  )
}

function Gap({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <li className='py-3'>
      <div className='flex flex-wrap items-baseline gap-x-2'>
        <span className='rounded-sm border border-neutral-400 px-1.5 py-0.5 text-[11px] text-neutral-600'>open</span>
        <h3 className='text-[15px] font-medium text-neutral-950'>{title}</h3>
      </div>
      <p className='mt-1 max-w-prose text-[15px] leading-relaxed text-neutral-600'>{children}</p>
    </li>
  )
}
