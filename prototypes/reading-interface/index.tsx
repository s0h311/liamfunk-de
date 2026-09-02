import type { PrototypeMeta } from '../types'
import type { ReactNode } from 'react'
import {
  MatrixBody,
  Out,
  PASSAGES,
  ProjectMatrixBody,
  SmithBody,
  TableyBody,
  ThoughtsBody,
  WorkshopsBody,
} from './content'
import { isOpen, Note, Panel, Pending, Row, SLUG, useSearch, Word, type Search } from './ui'

export const meta: PrototypeMeta = {
  title: 'The Reading Interface',
  positioning: 'calling-card',
  note: 'Round one, concept 2. The whole site is one document and every link opens where it stands, with the URL following it. Transclusion as an enhancement over real links, never a replacement — so it still reads, and still opens, with JavaScript off.',
}

export default function ReadingInterface() {
  const search = useSearch()

  return search['p'] === 'tabley' ? <TableyPage /> : <FrontDoor search={search} />
}

/* ------------------------------------------------------------------ chrome */

const PAGE =
  'min-h-dvh bg-[#f7f5f0] font-serif text-[1.0625rem]/8 text-stone-800 antialiased selection:bg-amber-200 dark:bg-[#15130f] dark:text-stone-300 dark:selection:bg-amber-400/30'
const SHEET = 'mx-auto w-full max-w-[64rem] px-5 sm:px-8'
const COLUMN = 'relative max-w-[38rem]'
const NAV_LINK =
  'inline-flex h-11 items-center underline decoration-stone-400 underline-offset-4 hover:decoration-stone-900 focus-visible:rounded-xs focus-visible:bg-amber-200/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:decoration-stone-500 dark:hover:decoration-stone-200 dark:focus-visible:bg-amber-400/25 dark:focus-visible:outline-stone-200'

/**
 * The two things nobody should have to play along to reach. One tap each, from
 * cold, out of a bar that never leaves the viewport — because the concept's own
 * device (open it here, keep reading) is exactly the kind of thing that could
 * quietly become the only way through the document.
 */
function Masthead({ home }: Readonly<{ home: boolean }>) {
  return (
    <header className='sticky top-0 z-10 border-b border-stone-300 bg-[#f7f5f0]/95 backdrop-blur dark:border-stone-700 dark:bg-[#15130f]/95'>
      <div className={`${SHEET} flex flex-wrap items-center justify-between gap-x-6`}>
        <p className='font-sans text-sm'>
          {home ? (
            <span className='font-medium text-stone-950 dark:text-stone-50'>Liam Funk</span>
          ) : (
            <a
              href={`/proto/${SLUG}`}
              className='font-medium text-stone-950 underline decoration-stone-400 underline-offset-4 dark:text-stone-50 dark:decoration-stone-500'
            >
              Liam Funk
            </a>
          )}
          <span className='ml-2.5 text-stone-500 dark:text-stone-400'>Hamburg</span>
        </p>
        <nav className='flex items-center gap-x-6 font-sans text-sm'>
          <a
            href={home ? '#work' : `/proto/${SLUG}#work`}
            className={NAV_LINK}
          >
            Work
          </a>
          <a
            href='mailto:hi@liamfunk.de'
            className={`${NAV_LINK} font-mono text-stone-950 dark:text-stone-50`}
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
    <footer className='mt-16 border-t border-stone-300 py-10 dark:border-stone-700'>
      <div className={SHEET}>
        <ul className={`${COLUMN} flex flex-wrap gap-x-8 font-sans text-sm`}>
          <li>
            <a
              href='mailto:hi@liamfunk.de'
              className={`${NAV_LINK} font-mono`}
            >
              hi@liamfunk.de
            </a>
          </li>
          <li>
            <a
              href='https://github.com/s0h311'
              className={NAV_LINK}
            >
              GitHub
            </a>
          </li>
          <li className='flex h-11 items-center text-stone-500 dark:text-stone-400'>
            LinkedIn <span className='ml-2'><Pending>the URL</Pending></span>
          </li>
          <li className='flex h-11 items-center text-stone-500 dark:text-stone-400'>
            CV <span className='ml-2'><Pending>the PDF</Pending></span>
          </li>
        </ul>
        <p className={`${COLUMN} mt-4 font-sans text-xs text-stone-500 dark:text-stone-500`}>
          Prototype. The mailbox <span className='font-mono'>hi@liamfunk.de</span> does not exist yet —{' '}
          <Pending>provisioning a real inbox, not a forward</Pending>
        </p>
      </div>
    </footer>
  )
}

/**
 * One paragraph of the document, plus whatever it currently has open.
 *
 * The passages render *after* the paragraph rather than inside it, because an
 * <aside> inside a <p> is hoisted out by the HTML parser and the hydrated DOM
 * then diverges from the markup the server sent. The wrapper is the positioning
 * context for the margin notes, which stay inside the paragraph — a <span> is
 * phrasing content whatever CSS does to it.
 */
function Passage({
  search,
  opens,
  children,
}: Readonly<{ search: Search; opens: readonly string[]; children: ReactNode }>) {
  return (
    <div className='relative mt-5'>
      <p>{children}</p>
      {opens
        .filter((id) => isOpen(search, id))
        .map((id) => (
          <Panel
            key={id}
            search={search}
            id={id}
            source={PASSAGES[id]?.source}
            label={PASSAGES[id]?.label ?? id}
          >
            {PASSAGES[id]?.body()}
          </Panel>
        ))}
    </div>
  )
}

/* -------------------------------------------------------------- front door */

function FrontDoor({ search }: Readonly<{ search: Search }>) {
  return (
    <div className={PAGE}>
      <Masthead home />
      <main className={`${SHEET} pt-10 pb-4`}>
        <article className={COLUMN}>
          <h1 className='max-w-[30rem] text-2xl/9 font-medium text-balance text-stone-950 sm:text-[1.75rem]/10 dark:text-stone-50'>
            Liam Funk builds web products end-to-end from Hamburg.
          </h1>

          <Passage
            search={search}
            opens={[]}
          >
            He started programming at eleven for an unglamorous reason: he was bad at the computer games he wanted to
            be good at, so he learned to write hacks for them instead.
            <Note
              search={search}
              id='n1'
              n={1}
            >
              He has been writing software ever since, and professionally since 2022.
            </Note>
          </Passage>

          <Passage
            search={search}
            opens={['tabley']}
          >
            He works out of Hamburg and runs{' '}
            <strong className='font-medium text-stone-950 dark:text-stone-50'>Rock Science</strong>, a registered
            one-person product studio. Its product,{' '}
            <Word
              search={search}
              id='tabley'
              label='the tabley case study'
            >
              tabley
            </Word>
            , is a live restaurant reservation platform serving real German restaurants: public booking on one side, a
            merchant dashboard on the other, self-hosted end to end.
            <Note
              search={search}
              id='n2'
              n={2}
            >
              Self-hosted down to the assets, which come off Rock Science’s own Hetzner object storage.
            </Note>
          </Passage>

          <Passage
            search={search}
            opens={['matrix', 'project-matrix', 'smith']}
          >
            Alongside the product work he builds tooling for agentic engineering — systems that let coding agents work
            through a backlog while nobody is at the keyboard, and that keep the output reviewable when they do.{' '}
            <Word
              search={search}
              id='matrix'
              label='matrix'
            >
              matrix
            </Word>{' '}
            is what runs today;{' '}
            <Word
              search={search}
              id='project-matrix'
              label='project-matrix'
            >
              project-matrix
            </Word>{' '}
            is the framework it is becoming; and{' '}
            <Word
              search={search}
              id='smith'
              label='smith'
            >
              smith
            </Word>{' '}
            is the scaffold this page was built from.
          </Passage>

          <Passage
            search={search}
            opens={['workshops']}
          >
            He studied Business Information Systems at HAW Hamburg and finished in April 2025. He has{' '}
            <Word
              search={search}
              id='workshops'
              label='the workshop history'
            >
              taught some of this
            </Word>
            , though that is history rather than an offer.
            <Note
              search={search}
              id='n3'
              n={3}
            >
              <span lang='de'>BSc Wirtschaftsinformatik</span>, HAW Hamburg — the University of Applied Sciences.
            </Note>
          </Passage>

          <Passage
            search={search}
            opens={['available']}
          >
            He is{' '}
            <Word
              search={search}
              id='available'
              label='what he is available for'
            >
              available for work
            </Word>
            : building web applications end-to-end, and agentic engineering consulting.
          </Passage>

          <Passage
            search={search}
            opens={['travel', 'books']}
          >
            He plays music — nothing recorded, nothing embedded. He{' '}
            <Word
              search={search}
              id='travel'
              label='travel'
            >
              travels
            </Word>
            . He{' '}
            <Word
              search={search}
              id='books'
              label='the book list'
            >
              reads
            </Word>
            , and keeps a list of the ones that mattered.
          </Passage>
        </article>

        <section className={`${COLUMN} mt-14`}>
          <h2
            id='work'
            className='scroll-mt-16 font-sans text-sm font-medium tracking-tight text-stone-950 dark:text-stone-50'
          >
            Work
          </h2>
          <p className='mt-1 font-sans text-sm text-stone-500 dark:text-stone-400'>
            Five entries. Each one opens here; the one with a case study also has a page of its own.
          </p>
          <ul className='mt-3 border-t border-stone-300 font-sans text-sm dark:border-stone-700'>
            <Row
              search={search}
              id='w-tabley'
              title='tabley'
              aside='live · rock science'
              gloss='Table reservations for German restaurants, self-hosted end to end. Four shops on it today.'
              source={{ href: `/proto/${SLUG}?p=tabley`, label: 'read it as its own page', internal: true }}
            >
              <TableyBody />
            </Row>
            <Row
              search={search}
              id='w-matrix'
              title='matrix'
              aside='typescript · public'
              gloss='Spawns AFK agents that work through GitHub issues one at a time.'
              source={{ href: 'https://github.com/s0h311/matrix', label: 'github.com/s0h311/matrix' }}
            >
              <MatrixBody />
            </Row>
            <Row
              search={search}
              id='w-project-matrix'
              title='project-matrix'
              aside='go · in construction'
              gloss='A framework for AFK agentic development. Today it is a thesis, and says so.'
              source={{ href: 'https://github.com/s0h311/project-matrix', label: 'github.com/s0h311/project-matrix' }}
            >
              <ProjectMatrixBody />
            </Row>
            <Row
              search={search}
              id='w-smith'
              title='smith'
              aside='typescript · public'
              gloss='Generates an empty TanStack Start project optimised for agentic engineering.'
              source={{ href: 'https://github.com/s0h311/smith', label: 'github.com/s0h311/smith' }}
            >
              <SmithBody />
            </Row>
            <Row
              search={search}
              id='w-workshops'
              title='Workshops'
              aside='2024 – 2026 · history'
              gloss='Evidence that he can teach. No booking path at the end of it.'
            >
              <WorkshopsBody />
            </Row>
          </ul>
        </section>

        <section className={`${COLUMN} mt-14`}>
          <h2
            id='thoughts'
            className='scroll-mt-16 font-sans text-sm font-medium tracking-tight text-stone-950 dark:text-stone-50'
          >
            Thoughts
          </h2>
          <ul className='mt-3 border-t border-stone-300 font-sans text-sm dark:border-stone-700'>
            <Row
              search={search}
              id='thoughts'
              title='Nothing published yet'
              aside='the format, not the archive'
              gloss='The surface a post will use is the surface you have been reading in.'
            >
              <ThoughtsBody />
            </Row>
          </ul>
        </section>
      </main>
      <Colophon />
    </div>
  )
}

/* -------------------------------------------------------- the page it has */

/**
 * The transclusion is an *enhancement over a real link*, so the real link has to
 * go somewhere. This is that somewhere: the same case study, rendered as its own
 * document, reached with a plain `<a>` — a cross-document navigation, per the
 * house rule. Coming back re-opens it in place, where you left it.
 */
function TableyPage() {
  return (
    <div className={PAGE}>
      <Masthead home={false} />
      <main className={`${SHEET} pt-10 pb-4`}>
        <article className={COLUMN}>
          <p className='font-sans text-sm'>
            <a
              href={`/proto/${SLUG}?open=tabley#t-tabley`}
              className={NAV_LINK}
            >
              ← back to the document
            </a>
          </p>
          <h1 className='mt-6 text-2xl/9 font-medium text-stone-950 sm:text-[1.75rem]/10 dark:text-stone-50'>tabley</h1>
          <p className='mt-2 font-sans text-sm text-stone-500 dark:text-stone-400'>
            A Rock Science product · <Out href='https://tabley.de'>tabley.de</Out>
          </p>
          <div className='mt-6 [&>*+*]:mt-4'>
            <TableyBody />
          </div>
          <p className='mt-8 font-sans text-sm text-stone-500 dark:text-stone-400'>
            Nothing on this page is hidden from the document that transcludes it — it is the same passage, read on its
            own instead of in place.
          </p>
        </article>
      </main>
      <Colophon />
    </div>
  )
}
