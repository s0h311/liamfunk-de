import type { ReactNode } from 'react'
import { CHEATS, toggled, type CheatId, type Search } from './cheats'
import { Fake, StateLink, hrefFor, merge } from './ui'

type Project = {
  name: string
  meta: string
  blurb: string
  href?: string
  external?: boolean
}

const PROJECTS: readonly Project[] = [
  {
    name: 'tabley',
    meta: 'Rock Science · live · case study',
    blurb:
      'Online table reservations for German restaurants. Public booking on one side, a merchant dashboard on the other, self-hosted end to end.',
  },
  {
    name: 'project-matrix',
    meta: 'Go · public · in construction',
    blurb:
      'A framework for AFK agentic development. Today it is a thesis with an honest README: one agent over a whole spec leaves the non-dumb zone, and a 200-file diff cannot be reviewed.',
    href: 'https://github.com/s0h311/project-matrix',
    external: true,
  },
  {
    name: 'matrix',
    meta: 'TypeScript · public · shipping today',
    blurb:
      'Spawns AFK agents — each named Smith — that work through GitHub issues one at a time, with deterministic quality gates between them. What project-matrix is becoming, running now.',
    href: 'https://github.com/s0h311/matrix',
    external: true,
  },
  {
    name: 'smith',
    meta: 'TypeScript · public',
    blurb:
      'Generates an empty TanStack Start project optimised for agentic engineering. The scaffold this very site was built from.',
    href: 'https://github.com/s0h311/smith',
    external: true,
  },
  {
    name: 'Workshops',
    meta: '2024–2025 · history, not an offer',
    blurb:
      'Web Development Workshop at HAW Hamburg, an MCP series, reusable components, server setup and auto-deployment, React 2026. The series is winding down; it stays as evidence, with nothing to book.',
  },
]

type Locked = {
  id: string
  title: string
  requirement: string
  body: ReactNode
}

/**
 * The three locked surfaces. Their unlock requirement is not a puzzle — it is
 * the literal missing content, written in the game's voice. So UNLOCK ALL is a
 * real cheat with a real payoff and an honest one: you get in, and the room is
 * empty, because the lock was never guarding anything.
 */
const LOCKED: readonly Locked[] = [
  {
    id: 'thoughts',
    title: 'Thoughts',
    requirement: 'requires: 1 post',
    body: (
      <div className='border border-dashed border-neutral-400 bg-white/60 px-4 py-8 text-center'>
        <p className='text-[0.95rem] text-neutral-600'>Nothing written yet.</p>
        <p className='mx-auto mt-1 max-w-sm text-sm text-neutral-500'>
          The lock was not hiding a draft. It was hiding the fact that there is no draft, and now you have both the room
          and the reason it is empty.
        </p>
      </div>
    ),
  },
  {
    id: 'books',
    title: 'Books',
    requirement: 'requires: the list',
    body: (
      <div className='border border-dashed border-neutral-400 bg-white/60 px-4 py-6'>
        <p className='text-[0.95rem] text-neutral-900'>
          A Philosophy of Software Design <span className='text-neutral-500'>— John Ousterhout</span>
        </p>
        <p className='mt-0.5 text-sm text-neutral-600'>The only book that made me delete code.</p>
        <p className='mt-4 text-sm text-neutral-500'>
          One entry. The rest of the shelf is not written down anywhere yet.
        </p>
      </div>
    ),
  },
  {
    id: 'travel',
    title: 'Travel',
    requirement: 'requires: the places',
    body: (
      <div className='flex min-h-[8rem] items-center justify-center border border-dashed border-neutral-400 bg-white/60 px-4 py-6 text-center'>
        <p className='max-w-sm text-sm text-neutral-500'>
          A map with no pins on it. Countries-I-have-visited is a cliché, so this surface either does something unusual
          or drops to a bio line — and round one has not decided which.
        </p>
      </div>
    ),
  },
]

export function Document({ cheats, search }: Readonly<{ cheats: ReadonlySet<CheatId>; search: Search }>) {
  const unlocked = cheats.has('unlockall')

  return (
    <>
      <section
        data-hb='section'
        className='mt-12'
      >
        <div className='max-w-prose space-y-4 text-[0.975rem] leading-relaxed text-neutral-700'>
          <p>
            He has been writing software ever since — professionally since 2022. He works out of Hamburg and runs Rock
            Science, a registered one-person product studio.
          </p>
          <p>
            He is available for{' '}
            <strong className='font-medium text-neutral-900'>building web applications end to end</strong> and for{' '}
            <strong className='font-medium text-neutral-900'>agentic engineering consulting</strong>. tabley is the
            proof of the first; matrix, smith and project-matrix are the proof of the second. He studied Business
            Information Systems at HAW Hamburg and finished in April 2025.
          </p>
        </div>
      </section>

      <section
        data-hb='section'
        aria-labelledby='work'
        className='mt-12'
      >
        <h2
          id='work'
          className='scroll-mt-16 text-sm font-medium text-neutral-500'
        >
          Work
        </h2>

        <ul
          data-hb='ul'
          className='mt-4 divide-y divide-neutral-300 border-y border-neutral-300'
        >
          {PROJECTS.map((project) => (
            <li
              key={project.name}
              className='py-4'
            >
              <div className='flex flex-wrap items-baseline gap-x-3 gap-y-0.5'>
                {project.name === 'tabley' ? (
                  <a
                    href={hrefFor(search, { p: 'tabley' })}
                    className='text-[1.05rem] font-semibold tracking-tight text-neutral-950 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
                  >
                    tabley
                  </a>
                ) : project.href === undefined ? (
                  <span className='text-[1.05rem] font-semibold tracking-tight text-neutral-950'>{project.name}</span>
                ) : (
                  <a
                    href={project.href}
                    className='text-[1.05rem] font-semibold tracking-tight text-neutral-950 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
                  >
                    {project.name}
                  </a>
                )}
                <span className='font-mono text-[0.72rem] tracking-[0.05em] text-neutral-500 uppercase'>
                  {project.meta}
                </span>
              </div>
              <p className='mt-1 max-w-prose text-[0.92rem] leading-relaxed text-neutral-600'>{project.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        data-hb='section'
        aria-labelledby='more'
        className='mt-12'
      >
        <h2
          id='more'
          className='text-sm font-medium text-neutral-500'
        >
          The rest of the site
        </h2>

        <p className='mt-2 max-w-prose text-[0.92rem] leading-relaxed text-neutral-600'>
          Three surfaces, all sealed, and none of the requirements is met.{' '}
          {unlocked ? (
            <StateLink
              search={merge(search, toggled(cheats, 'unlockall'))}
              className='underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
            >
              Lock them again.
            </StateLink>
          ) : (
            <StateLink
              search={merge(search, toggled(cheats, 'unlockall'))}
              className='underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
            >
              {CHEATS.find((cheat) => cheat.id === 'unlockall')?.name} opens them anyway.
            </StateLink>
          )}
        </p>

        <ul className='mt-5 space-y-5'>
          {LOCKED.map((surface) => (
            <li key={surface.id}>
              <div className='flex flex-wrap items-baseline gap-x-3 gap-y-0.5'>
                <h3 className='text-[1.05rem] font-semibold tracking-tight text-neutral-950'>{surface.title}</h3>
                <span
                  className={`font-mono text-[0.72rem] tracking-[0.05em] uppercase ${
                    unlocked ? 'text-[#8a6d00]' : 'text-neutral-500'
                  }`}
                >
                  {unlocked ? 'unlocked' : `locked · ${surface.requirement}`}
                </span>
              </div>
              {unlocked && <div className='mt-2'>{surface.body}</div>}
            </li>
          ))}
        </ul>
      </section>

      <section
        data-hb='section'
        aria-labelledby='contact'
        className='mt-12'
      >
        <h2
          id='contact'
          className='text-sm font-medium text-neutral-500'
        >
          Contact
        </h2>
        <ul className='mt-1 text-[0.95rem]'>
          <li>
            <a
              href='mailto:hi@liamfunk.de'
              className='inline-flex min-h-11 items-center font-mono text-neutral-950 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
            >
              hi@liamfunk.de
            </a>
          </li>
          <li>
            <a
              href='https://github.com/s0h311'
              className='inline-flex min-h-11 items-center text-neutral-800 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
            >
              github.com/s0h311
            </a>
          </li>
          <li>
            <Fake
              cheats={cheats}
              missing='the LinkedIn URL'
            >
              LinkedIn — link pending
            </Fake>
          </li>
          <li>
            <Fake
              cheats={cheats}
              missing='the CV PDF — it has not been written'
            >
              CV (PDF) — pending
            </Fake>
          </li>
        </ul>
        <p className='mt-3 max-w-prose text-sm text-neutral-500'>
          <Fake
            cheats={cheats}
            missing='the mailbox itself — hi@liamfunk.de is not provisioned yet'
          >
            The address is the one the site will use.
          </Fake>
        </p>
      </section>
    </>
  )
}
