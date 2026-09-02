import type { PrototypeMeta } from '../types'
import { SiteColophon, SiteHeader, href, useQuery, type Query } from './chrome'
import { TheRecord } from './artifact'
import { TableyPage } from './tabley'
import { buildRecord, type Record_, type Surface } from './record'

export const meta: PrototypeMeta = {
  title: 'The Visitor Artifact',
  positioning: 'playground',
  note: "Round one, concept 5. The site keeps a record of everyone who came, and one tap adds your line to it — server-rendered as markup, so the page carries text that exists nowhere else on the web and still reads with JavaScript off. The roster's only concept that asks for a backend; this sketch exists to price one or kill it.",
}

export default function VisitorArtifact() {
  const query = useQuery()
  const record = buildRecord({ fullness: query.fullness, trace: query.trace, at: query.at })

  return query.project === 'tabley' ? (
    <TableyPage
      query={query}
      record={record}
    />
  ) : (
    <FrontDoor
      query={query}
      record={record}
    />
  )
}

/**
 * The front door is the record.
 *
 * Not a hero with a record underneath it: the accumulation is the first thing in
 * the document after the two sentences that say who Liam is, because a concept
 * whose artifact is below the fold is a concept whose artifact nobody sees. The
 * work sits one screen below it and one tap away in the header, which is what
 * keeps the toy from standing between a recruiter and the thing they came for.
 */
function FrontDoor({ query, record }: Readonly<{ query: Query; record: Record_ }>) {
  return (
    <div className='flex min-h-dvh flex-col bg-[#0a0a0b] font-sans text-[#e8e3d9] antialiased [&_[data-proto-chrome]]:opacity-20'>
      <SiteHeader home />

      <main className='mx-auto w-full max-w-5xl grow px-5 pt-12 pb-16'>
        <h1 className='max-w-[34ch] text-2xl leading-snug font-normal text-balance sm:text-[1.75rem]'>
          Liam Funk started programming at eleven for an unglamorous reason: he was bad at the computer games he wanted
          to be good at, so he learned to write hacks for them instead.
        </h1>

        <div className='mt-6 max-w-prose space-y-4 text-[0.975rem] leading-relaxed text-[#a5a096]'>
          <p>
            He has been writing software ever since — professionally since 2022. He works out of Hamburg and runs Rock
            Science, a registered one-person product studio, and is available for building web applications end-to-end
            and for agentic engineering consulting.
          </p>
          <p>This page keeps a record of everyone who reaches it. It is the only thing here he did not write.</p>
        </div>

        <div className='mt-12'>
          <TheRecord
            record={record}
            query={query}
          />
        </div>

        <Work
          query={query}
          record={record}
        />

        <PrototypeNote query={query} />
      </main>

      <SiteColophon />
    </div>
  )
}

type Entry = Readonly<{
  name: string
  surface: Surface
  line: string
  built: boolean
}>

/** Every word from docs/raw-material.md; nothing invented, nothing padded. */
const ENTRIES: readonly Entry[] = [
  {
    name: 'tabley',
    surface: 'tabley',
    line: 'Online table reservations for German restaurants. Four live shops, self-hosted end to end. A Rock Science product, not a side project.',
    built: true,
  },
  {
    name: 'matrix',
    surface: 'matrix',
    line: 'Spawns AFK agents — each named Smith — that work through GitHub issues one at a time, with deterministic quality gates between them.',
    built: false,
  },
  {
    name: 'project-matrix',
    surface: 'project-matrix',
    line: 'A framework for AFK agentic development, in construction. Today it is a thesis with the solution sections still empty, and it says so.',
    built: false,
  },
  {
    name: 'smith',
    surface: 'smith',
    line: 'Generates an empty TanStack Start project optimised for agentic engineering. The scaffold this site was built from.',
    built: false,
  },
  {
    name: 'Workshops',
    surface: 'workshops',
    line: 'HAW Hamburg 2024, the MCP series in 2025, React 2026. History, not an offer — there is no booking path.',
    built: false,
  },
]

/**
 * The work list, annotated by the record.
 *
 * This is where the artifact stops being a guestbook: the accumulation is not a
 * wall of strangers saying hello, it is a reading of what visitors actually opened.
 * The order is Liam's — attention annotates the list, it never reorders it, or the
 * site's own emphasis becomes a popularity chart.
 */
function Work({ query, record }: Readonly<{ query: Query; record: Record_ }>) {
  return (
    <section
      id='work'
      className='mt-16 scroll-mt-16'
    >
      <h2 className='text-[0.78rem] tracking-[0.14em] text-[#8b867d] uppercase'>Work</h2>

      <ul className='mt-4 border-t border-white/10'>
        {ENTRIES.map((entry) => (
          <li
            key={entry.name}
            className='border-b border-white/10'
          >
            {entry.built ? (
              <a
                href={href(query, { project: 'tabley' })}
                className='block py-5 hover:bg-white/[0.03]'
              >
                <EntryBody
                  entry={entry}
                  opened={record.total === 0 ? undefined : record.bySurface[entry.surface]}
                />
              </a>
            ) : (
              <div className='py-5 opacity-70'>
                <EntryBody
                  entry={entry}
                  opened={record.total === 0 ? undefined : record.bySurface[entry.surface]}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * `opened` is undefined on launch day rather than zero: a work list that says
 * "no arrivals yet" five times is a site telling a recruiter nobody has read it.
 * The record itself is allowed to be empty — it is the point — but the emptiness
 * should be stated once, in the one place that is about it.
 */
function EntryBody({ entry, opened }: Readonly<{ entry: Entry; opened: number | undefined }>) {
  return (
    <>
      <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
        <span className='text-[1.05rem] text-[#e8e3d9]'>{entry.name}</span>
        {opened !== undefined && (
          <span className='font-mono text-[0.72rem] text-[#5c584f] tabular-nums'>
            {opened === 1 ? '1 arrival opened this' : `${opened} arrivals opened this`}
          </span>
        )}
      </div>
      <p className='mt-1 max-w-prose text-[0.9rem] leading-relaxed text-[#a5a096]'>{entry.line}</p>
      {!entry.built && (
        /* Faked visibly, per the round-one bar: one case study is built and the rest say so. */
        <p className='mt-1 font-mono text-[0.7rem] text-[#5c584f]'>page not built in this sketch</p>
      )}
    </>
  )
}

/**
 * Review device, and deliberately marked as one.
 *
 * The two states most likely to kill this concept are not reachable by waiting,
 * so they are reachable by URL: an empty record, and the awkward middle where
 * seven people have been.
 */
function PrototypeNote({ query }: Readonly<{ query: Query }>) {
  const states = [
    { fullness: 'full' as const, label: '148 arrivals' },
    { fullness: 'thin' as const, label: '7 arrivals' },
    { fullness: 'empty' as const, label: 'launch day, nobody' },
  ]

  return (
    <aside className='mt-16 border border-dashed border-white/15 p-4 text-[0.75rem] leading-relaxed text-[#8b867d]'>
      <p className='text-[#a5a096]'>Prototype controls — not site copy.</p>
      <p className='mt-1'>
        Nothing is persisted: the record is a fixture and your line lives in the query string. Look at the concept in
        the state it is most likely to die in:
      </p>
      <ul className='mt-2 flex flex-wrap gap-x-5 gap-y-1'>
        {states.map((state) => (
          <li key={state.fullness}>
            <a
              href={href(query, { fullness: state.fullness, project: undefined })}
              className={`inline-flex min-h-[44px] items-center underline underline-offset-4 ${
                query.fullness === state.fullness ? 'text-[#d9a441]' : 'hover:text-[#e8e3d9]'
              }`}
            >
              {state.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
