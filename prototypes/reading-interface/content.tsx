import { Pending } from './ui'

/**
 * Every word here comes from `docs/raw-material.md`. Where that document says a
 * fact is missing, the hole is marked with <Pending> rather than filled in.
 */

const LINK =
  'underline decoration-stone-400 underline-offset-4 hover:decoration-stone-900 focus-visible:rounded-xs focus-visible:bg-amber-200/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:decoration-stone-500 dark:hover:decoration-stone-200 dark:focus-visible:bg-amber-400/25 dark:focus-visible:outline-stone-200'

export function Out({ href, children }: Readonly<{ href: string; children: React.ReactNode }>) {
  return (
    <a
      href={href}
      className={LINK}
    >
      {children}
    </a>
  )
}

const DL =
  'grid grid-cols-1 gap-x-4 gap-y-1 font-mono text-xs text-stone-600 [&_dd]:mb-2 sm:grid-cols-[7.5rem_1fr] sm:gap-y-1.5 sm:[&_dd]:mb-0 dark:text-stone-400'

export function TableyBody() {
  return (
    <>
      <p>
        Online table reservations for German restaurants. Public discovery and booking on one side; a merchant login —{' '}
        <span lang='de'>“Anmelden für Geschäfte”</span> — on the other.
      </p>
      <p>
        It is a Rock Science product, not a personal side project: self-hosted end to end, German-language, server
        rendered, with real customers on it today. Assets are served from Rock Science’s own Hetzner object storage.
      </p>
      <dl className={DL}>
        <dt className='text-stone-500 dark:text-stone-500'>live</dt>
        <dd>
          <Out href='https://tabley.de'>tabley.de</Out>
        </dd>
        <dt className='text-stone-500 dark:text-stone-500'>source</dt>
        <dd>private</dd>
        <dt className='text-stone-500 dark:text-stone-500'>shops live</dt>
        <dd>
          Thakali Kitchen, Luxor Restaurant &amp; Caffe, Bäckerei Allaf, Rooster Cafe —{' '}
          <Pending>public naming consent from the four shops</Pending>
        </dd>
        <dt className='text-stone-500 dark:text-stone-500'>owner</dt>
        <dd>Rock Science, one-person product studio</dd>
      </dl>
      <p>
        This is the one entry that proves shipped-and-maintained rather than built-and-abandoned, so it is the one entry
        with a case study: problem, architecture, decisions, screenshots.
      </p>
      <p>
        <Pending>tabley screenshots and architecture notes</Pending>
      </p>
    </>
  )
}

export function MatrixBody() {
  return (
    <>
      <p>
        Spawns AFK agents — each one named Smith — that work through GitHub issues autonomously, one at a time. It runs
        Ralph loops and automated review, and enforces deterministic quality gates between agents:{' '}
        <code>checks.fmt</code>, <code>checks.lint</code>, <code>checks.test</code>.
      </p>
      <p>
        Configured per project in <code>.matrix/config.json</code>. It needs a <code>GH_TOKEN</code>, a Claude Code
        subscription, and a PRD already broken into issues.
      </p>
      <p>This is what runs today. project-matrix is the framework it is becoming — a lineage, not a rivalry.</p>
    </>
  )
}

export function ProjectMatrixBody() {
  return (
    <>
      <p>
        In construction, in Go, and honestly labelled: today it is a thesis. The README carries the problem statement
        and the solution sections are still empty.
      </p>
      <p>The argument it makes, which is also the argument for the tooling around it:</p>
      <ul className='ml-5 list-disc space-y-1.5'>
        <li>One agent over a whole spec leaves the non-dumb zone, roughly 0–100K tokens.</li>
        <li>Implementation without rules returns garbage in, garbage out.</li>
        <li>A 200-file diff cannot be reviewed.</li>
        <li>Agents skip TDD by default.</li>
        <li>
          Ralph-loop tooling helps, and still chains you to a running laptop with no way to monitor or share progress
          remotely.
        </li>
      </ul>
    </>
  )
}

export function SmithBody() {
  return (
    <p>
      Generates an empty TanStack Start project optimised for agentic engineering. It is the scaffold this page was
      built from, which is either a recommendation or a conflict of interest.
    </p>
  )
}

export function WorkshopsBody() {
  return (
    <>
      <p>
        History, not an offer. The workshop series is winding down; it stays here as portfolio evidence that he can
        teach, with no booking path at the end of it.
      </p>
      <ul className='ml-5 list-disc space-y-1.5'>
        <li>Web Development Workshop 2024 — HAW Hamburg</li>
        <li>MCP series, 2025 — MCP Server; MCP Server over Streamable HTTP; MCP Client</li>
        <li>Reusable components: API and layout design</li>
        <li>Server setup and auto-deployment</li>
        <li>React 2026</li>
      </ul>
    </>
  )
}

export function BooksBody() {
  return (
    <>
      <p>Title, author, and one line on why it mattered. That is the whole format:</p>
      <p className='border-l-2 border-stone-300 pl-4 font-mono text-xs/6 text-stone-600 dark:border-stone-700 dark:text-stone-400'>
        A Philosophy of Software Design — John Ousterhout
        <br />
        <span className='text-stone-500 dark:text-stone-500'>The only book that made me delete code.</span>
      </p>
      <p>
        That entry is the shape, not the list. The list itself is five to fifteen books and every one of them owes a
        line. <Pending>the book list</Pending>
      </p>
      <p>
        Rejected on the way here: a bare list, which has no voice; reading-now / read / want-to-read, which goes
        visibly stale; and ratings.
      </p>
    </>
  )
}

export function TravelBody() {
  return (
    <>
      <p>He travels. The places are not written down yet. <Pending>the places the map plots</Pending></p>
      <p>
        “Countries I’ve visited” is a cliché, and a map is a picture — a picture that opens inline is just an image with
        a caption, which is the one thing this document cannot make interesting. Until the places exist and one of them
        is worth a paragraph, travel stays the sentence you just read.
      </p>
    </>
  )
}

export function ThoughtsBody() {
  return (
    <>
      <p className='text-lg/8 text-stone-800 dark:text-stone-200'>Nothing published yet.</p>
      <p>
        This document is the format. Every passage you have opened on this page — the case study, the notes beside the
        column, the list of workshops — was rendered in the surface a post will use, by the mechanism a post will use.
      </p>
      <p>
        So there is no archive to look empty. When there is something to read it opens here, in place, exactly as
        everything else just did.
      </p>
    </>
  )
}

export function AvailableBody() {
  return (
    <>
      <p>Two things, and the proof for each:</p>
      <dl className={DL}>
        <dt className='text-stone-500 dark:text-stone-500'>web apps</dt>
        <dd>End to end. React and TanStack at the front, Postgres at the back, self-hosted. tabley is the proof.</dd>
        <dt className='text-stone-500 dark:text-stone-500'>agentic eng.</dt>
        <dd>AFK agent workflows, skills, automated review loops. matrix, smith and project-matrix are the proof.</dd>
      </dl>
      <p>
        Not part of the pitch: workshops and teaching. That is history on this page, deliberately, and there is no
        booking form at the end of it.
      </p>
      <p>
        <Out href='mailto:hi@liamfunk.de'>hi@liamfunk.de</Out> — a real mailbox, not a forward to a personal Gmail.
      </p>
    </>
  )
}

/* ------------------------------------------------------------- the corpus */

/**
 * Every passage the document can open, in one place. A transclusion is looked
 * up here rather than written at the point it is mentioned, which is what lets
 * the same passage appear twice — once inline in the prose, once in the work
 * list — without being written twice, and lets tabley also stand up as its own
 * document without a third copy.
 */
export type Passage = {
  label: string
  source?: { href: string; label: string; internal?: boolean }
  body: () => React.ReactNode
}

export const PASSAGES: Record<string, Passage> = {
  tabley: {
    label: 'the tabley case study',
    source: { href: '/proto/reading-interface?p=tabley', label: 'read it as its own page', internal: true },
    body: TableyBody,
  },
  matrix: {
    label: 'matrix',
    source: { href: 'https://github.com/s0h311/matrix', label: 'github.com/s0h311/matrix' },
    body: MatrixBody,
  },
  'project-matrix': {
    label: 'project-matrix',
    source: { href: 'https://github.com/s0h311/project-matrix', label: 'github.com/s0h311/project-matrix' },
    body: ProjectMatrixBody,
  },
  smith: {
    label: 'smith',
    source: { href: 'https://github.com/s0h311/smith', label: 'github.com/s0h311/smith' },
    body: SmithBody,
  },
  workshops: { label: 'the workshop history', body: WorkshopsBody },
  available: { label: 'what he is available for', body: AvailableBody },
  travel: { label: 'travel', body: TravelBody },
  books: { label: 'the book list', body: BooksBody },
}
