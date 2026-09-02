import type { PrototypeMeta } from '../types'
import type { Strategy } from './context-model'
import { MAX_BOOKINGS } from './service-model'
import { ContextFigure, ServiceFigure } from './figures'
import { Choice, Pending, Stepper, useSearch, readNumber, withValues, type Search } from './ui'

export const meta: PrototypeMeta = {
  title: 'The Explorable',
  positioning: 'calling-card',
  note: 'Round one, concept 1. Every page is a working model of the problem it solves, not screenshots. The model’s controls are links and its state is in the query string, so it runs with JavaScript off.',
}

export default function Explorable() {
  const search = useSearch()

  return search['p'] === 'tabley' ? <TableyCaseStudy search={search} /> : <FrontDoor search={search} />
}

/* ------------------------------------------------------------------ chrome */

const PAGE = 'min-h-dvh bg-[#fbfaf8] font-sans text-neutral-900 antialiased [&_[data-proto-chrome]]:opacity-20'
const COLUMN = 'mx-auto w-full max-w-2xl px-6'

function Masthead({ home }: Readonly<{ home: boolean }>) {
  return (
    <header className='border-b border-neutral-200'>
      <div className={`${COLUMN} flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2`}>
        <div>
          {home ? (
            <span className='text-base font-semibold tracking-tight text-neutral-950'>Liam Funk</span>
          ) : (
            <a
              href='/proto/explorable'
              className='text-base font-semibold tracking-tight text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
            >
              Liam Funk
            </a>
          )}
          <span className='ml-3 text-sm text-neutral-500'>Hamburg</span>
        </div>
        <nav className='flex items-center gap-5 text-sm'>
          <a
            href={home ? '#work' : '/proto/explorable#work'}
            className='inline-flex h-11 min-w-11 items-center justify-center text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950 hover:decoration-neutral-900'
          >
            Work
          </a>
          <a
            href='mailto:hi@liamfunk.de'
            className='inline-flex h-11 items-center font-mono text-neutral-950 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
          >
            hi@liamfunk.de
          </a>
        </nav>
      </div>
    </header>
  )
}

function Colophon() {
  return (
    <footer className='mt-20 border-t border-neutral-200 py-10'>
      <div className={COLUMN}>
        <ul className='flex flex-wrap items-center gap-x-8 text-sm text-neutral-700'>
          <li>
            <a
              href='mailto:hi@liamfunk.de'
              className='inline-flex h-11 items-center font-mono text-neutral-950 underline decoration-neutral-400 underline-offset-4'
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
          Prototype. Every word on this page comes from <code>docs/raw-material.md</code>; the dashed items are holes in
          that document, left visible rather than invented.
        </p>
      </div>
    </footer>
  )
}

/* --------------------------------------------------------------- front door */

const STRATEGIES: readonly { value: Strategy; label: string }[] = [
  { value: 'one-agent', label: 'one agent, whole spec' },
  { value: 'agent-per-issue', label: 'one agent per issue' },
]

function FrontDoor({ search }: Readonly<{ search: Search }>) {
  const issues = readNumber(search, { key: 'i', fallback: 9, min: 1, max: 20 })
  const filesPerIssue = readNumber(search, { key: 'f', fallback: 4, min: 1, max: 12 })
  const strategy: Strategy = search['run'] === 'agent-per-issue' ? 'agent-per-issue' : 'one-agent'

  return (
    <div className={PAGE}>
      <Masthead home />

      <main className={`${COLUMN} pt-14`}>
        <h1 className='max-w-prose text-3xl leading-tight font-semibold tracking-tight text-neutral-950 sm:text-4xl'>
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

        <p className='mt-8 max-w-prose text-lg leading-relaxed text-neutral-700'>
          He started programming at eleven for an unglamorous reason: he was bad at the computer games he wanted to be
          good at, so he learned to write hacks for them instead. He has been writing software ever since —
          professionally since 2022.
        </p>

        <p className='mt-6 max-w-prose text-lg leading-relaxed text-neutral-700'>
          Alongside the product work he builds tooling for agentic engineering — systems that let coding agents work
          through a backlog while nobody is at the keyboard, and that keep the output reviewable when they do.
        </p>

        <section className='mt-16 border-t border-neutral-900 pt-8'>
          <h2 className='text-xl font-semibold tracking-tight text-neutral-950'>
            Why one agent cannot take a whole spec
          </h2>
          <p className='mt-4 max-w-prose leading-relaxed text-neutral-700'>
            A coding model is reliable inside a context window of roughly 0–100K tokens. Past that it is still fluent
            and no longer accurate — and an agent working a backlog in a single run never puts anything down. Set a
            backlog below and watch where the run leaves that zone.
          </p>

          <div className='mt-8 flex flex-col gap-3'>
            <Stepper
              label='Issues'
              value={String(issues)}
              down={issues > 1 ? withValues(search, { i: issues - 1 }) : null}
              up={issues < 20 ? withValues(search, { i: issues + 1 }) : null}
            />
            <Stepper
              label='Files per issue'
              value={String(filesPerIssue)}
              down={filesPerIssue > 1 ? withValues(search, { f: filesPerIssue - 1 }) : null}
              up={filesPerIssue < 12 ? withValues(search, { f: filesPerIssue + 1 }) : null}
            />
            <Choice
              label='Run as'
              options={STRATEGIES.map((option) => ({
                value: option.label,
                current: option.value === strategy,
                search: withValues(search, { run: option.value }),
              }))}
            />
          </div>

          <ContextFigure
            issues={issues}
            filesPerIssue={filesPerIssue}
            strategy={strategy}
          />

          <p className='max-w-prose leading-relaxed text-neutral-700'>
            The second setting is not a trick of the diagram. It is what{' '}
            <a
              href='https://github.com/s0h311/matrix'
              className='underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
            >
              matrix
            </a>{' '}
            does: it spawns one agent per GitHub issue, runs deterministic format, lint and test gates between them, and
            hands you a diff you can actually read.{' '}
            <a
              href='https://github.com/s0h311/project-matrix'
              className='underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
            >
              project-matrix
            </a>{' '}
            is the framework it is becoming.
          </p>
        </section>

        <section className='mt-16 border-t border-neutral-200 pt-8'>
          <h2 className='text-xl font-semibold tracking-tight text-neutral-950'>Available for</h2>
          <ol className='mt-5 flex flex-col gap-5'>
            <li className='max-w-prose'>
              <span className='font-semibold text-neutral-950'>Building web apps end-to-end</span>
              <span className='block text-neutral-700'>
                React/TanStack front to Postgres back, self-hosted. tabley is the proof.
              </span>
            </li>
            <li className='max-w-prose'>
              <span className='font-semibold text-neutral-950'>Agentic engineering consulting</span>
              <span className='block text-neutral-700'>
                AFK agent workflows, skills, automated review loops. The diagram above is the proof.
              </span>
            </li>
          </ol>
        </section>

        <Work />
      </main>

      <Colophon />
    </div>
  )
}

/* --------------------------------------------------------------------- work */

function Work() {
  return (
    <section
      id='work'
      className='mt-16 scroll-mt-6 border-t border-neutral-900 pt-8'
    >
      <h2 className='text-xl font-semibold tracking-tight text-neutral-950'>Work</h2>
      <p className='mt-3 max-w-prose text-sm leading-relaxed text-neutral-500'>
        No screenshots. Each entry that has a case study opens with a model of the problem it solves, running.
      </p>

      <ul className='mt-8 divide-y divide-neutral-200 border-y border-neutral-200'>
        <Entry
          name='tabley'
          meta='Rock Science · live'
          href='/proto/explorable?p=tabley'
          cta='Read the case study'
        >
          Online table reservations for German restaurants — public discovery and booking on one side, a merchant
          dashboard on the other. Self-hosted end to end, real customers.
        </Entry>
        <Entry
          name='matrix'
          meta='TypeScript · shipping'
          href='https://github.com/s0h311/matrix'
          cta='Repository'
        >
          Spawns AFK agents — each named Smith — that work through GitHub issues one at a time, with deterministic
          quality gates between them.
        </Entry>
        <Entry
          name='project-matrix'
          meta='Go · in construction'
          href='https://github.com/s0h311/project-matrix'
          cta='Repository'
        >
          A framework for AFK agentic development. Not built yet — today it is a problem statement, and it is labelled
          as one.
        </Entry>
        <Entry
          name='smith'
          meta='TypeScript'
          href='https://github.com/s0h311/smith'
          cta='Repository'
        >
          Generates an empty TanStack Start project optimised for agentic engineering. The scaffold this site was built
          from.
        </Entry>
        <li className='py-6'>
          <div className='flex flex-wrap items-baseline gap-x-3'>
            <span className='text-lg font-semibold tracking-tight text-neutral-950'>Workshops</span>
            <span className='font-mono text-xs uppercase tracking-widest text-neutral-400'>2024–2025 · history</span>
          </div>
          <p className='mt-2 max-w-prose leading-relaxed text-neutral-700'>
            Web Development Workshop 2024 at HAW Hamburg; an MCP series in 2025 (server, server over Streamable HTTP,
            client); reusable components — API and layout design; server setup and auto-deployment; React 2026. The
            series is winding down, so there is nothing to book.
          </p>
        </li>
      </ul>
    </section>
  )
}

function Entry({
  name,
  meta: metaLine,
  href,
  cta,
  children,
}: Readonly<{ name: string; meta: string; href: string; cta: string; children: string }>) {
  return (
    <li className='py-6'>
      <div className='flex flex-wrap items-baseline gap-x-3'>
        <a
          href={href}
          className='text-lg font-semibold tracking-tight text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
        >
          {name}
        </a>
        <span className='font-mono text-xs uppercase tracking-widest text-neutral-400'>{metaLine}</span>
      </div>
      <p className='mt-2 max-w-prose leading-relaxed text-neutral-700'>{children}</p>
      <a
        href={href}
        className='mt-3 inline-flex h-11 items-center text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950 hover:decoration-neutral-900'
      >
        {cta} →
      </a>
    </li>
  )
}

/* ---------------------------------------------------------- tabley: the case */

const TURNS = [60, 90, 120]

function readTurn(search: Search): number {
  const raw = search['turn']

  return TURNS.includes(Number(raw)) ? Number(raw) : 90
}

function TableyCaseStudy({ search }: Readonly<{ search: Search }>) {
  const tables = readNumber(search, { key: 't', fallback: 3, min: 1, max: 8 })
  const bookings = readNumber(search, { key: 'b', fallback: 8, min: 0, max: MAX_BOOKINGS })
  const turnMinutes = readTurn(search)

  return (
    <div className={PAGE}>
      <Masthead home={false} />

      <main className={`${COLUMN} pt-14`}>
        <p className='font-mono text-xs uppercase tracking-widest text-neutral-400'>Rock Science · live</p>
        <h1 className='mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl'>tabley</h1>
        <p className='mt-5 max-w-prose text-lg leading-relaxed text-neutral-700'>
          Online table reservations for German restaurants. Public discovery and booking on one side; a merchant login —{' '}
          <span lang='de'>Anmelden für Geschäfte</span> — on the other.{' '}
          <a
            href='https://tabley.de'
            className='underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
          >
            tabley.de
          </a>{' '}
          is live and serving real restaurants.
        </p>

        <section className='mt-16 border-t border-neutral-900 pt-8'>
          <h2 className='text-xl font-semibold tracking-tight text-neutral-950'>The problem, running</h2>
          <p className='mt-4 max-w-prose leading-relaxed text-neutral-700'>
            A small restaurant takes bookings on the phone into a paper diary. Every booking is accepted the moment it
            is made, because saying &ldquo;hold on&rdquo; to a caller is worse than saying yes. One evening, three
            tables, a fixed turn time — set the service below and find the point where the diary starts promising a
            table twice.
          </p>

          <div className='mt-8 flex flex-col gap-3'>
            <Stepper
              label='Tables'
              value={String(tables)}
              down={tables > 1 ? withValues(search, { t: tables - 1 }) : null}
              up={tables < 8 ? withValues(search, { t: tables + 1 }) : null}
            />
            <Stepper
              label='Bookings'
              value={String(bookings)}
              down={bookings > 0 ? withValues(search, { b: bookings - 1 }) : null}
              up={bookings < MAX_BOOKINGS ? withValues(search, { b: bookings + 1 }) : null}
            />
            <Choice
              label='Turn time'
              options={TURNS.map((turn) => ({
                value: `${turn} min`,
                current: turn === turnMinutes,
                search: withValues(search, { turn }),
              }))}
            />
          </div>

          <ServiceFigure
            tables={tables}
            bookings={bookings}
            turnMinutes={turnMinutes}
          />

          <p className='max-w-prose leading-relaxed text-neutral-700'>
            Everything tabley does on the booking side is downstream of this figure: availability is computed against
            turn time and table count before a slot is ever offered, so the conflict cannot be created rather than being
            caught afterwards.
          </p>
        </section>

        <section className='mt-16 border-t border-neutral-200 pt-8'>
          <h2 className='text-xl font-semibold tracking-tight text-neutral-950'>How it is built</h2>
          <dl className='mt-6 grid grid-cols-1 gap-y-5 sm:grid-cols-[10rem_1fr] sm:gap-x-8'>
            <dt className='font-mono text-xs uppercase tracking-widest text-neutral-500'>Hosting</dt>
            <dd className='max-w-prose leading-relaxed text-neutral-700'>
              Self-hosted end to end. Assets are served from Rock Science&rsquo;s own Hetzner object storage — no
              managed platform in the path.
            </dd>
            <dt className='font-mono text-xs uppercase tracking-widest text-neutral-500'>Rendering</dt>
            <dd className='max-w-prose leading-relaxed text-neutral-700'>
              Server-rendered and German-language throughout. Restaurant discovery has to be findable, so the document
              comes first.
            </dd>
            <dt className='font-mono text-xs uppercase tracking-widest text-neutral-500'>Live shops</dt>
            <dd className='max-w-prose leading-relaxed text-neutral-700'>
              Four, at the time of writing. <Pending>Named once they have agreed to be named</Pending>.
            </dd>
            <dt className='font-mono text-xs uppercase tracking-widest text-neutral-500'>Source</dt>
            <dd className='max-w-prose leading-relaxed text-neutral-700'>Private.</dd>
            <dt className='font-mono text-xs uppercase tracking-widest text-neutral-500'>Architecture</dt>
            <dd className='max-w-prose leading-relaxed text-neutral-700'>
              <Pending>The decisions worth writing up</Pending> — the schema behind availability, and what self-hosting
              costs when a restaurant calls on a Saturday.
            </dd>
          </dl>
          <p className='mt-8 max-w-prose text-sm leading-relaxed text-neutral-500'>
            There are no screenshots on this page, and there will not be. A screenshot of a booking form proves that a
            booking form exists; the figure above proves the thing that was actually hard.
          </p>
        </section>

        <p className='mt-16'>
          <a
            href='/proto/explorable#work'
            className='inline-flex h-11 items-center text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950 hover:decoration-neutral-900'
          >
            ← All work
          </a>
        </p>
      </main>

      <Colophon />
    </div>
  )
}
