/**
 * Art direction, per project, as data.
 *
 * The concept's whole claim is that there is *no shared template* — each project
 * page looks like the world it serves. This file is where that claim is priced:
 * every project owes a full palette and a type voice before it can appear
 * anywhere, including as a one-line entry on the front door. That is the "cost
 * is linear in the number of projects" risk, written down instead of argued
 * about.
 */
export type World = {
  slug: string
  /** The project's name, set in its own display voice. */
  name: string
  /** What it is, in one line. Straight from docs/raw-material.md. */
  line: string
  /** Where it stands today — the front door's second line. */
  status: string
  paper: string
  ink: string
  /** The one colour each world is allowed. */
  accent: string
  rule: string
  display: string
  body: string
  /** Applied to the project name in both the plate and the world's banner. */
  voice: DisplayVoice
  /** Painted behind the world so the plate is a window onto it, not a swatch. */
  texture: string | undefined
}

export type DisplayVoice = {
  fontWeight: number
  letterSpacing: string
  textTransform: 'none' | 'uppercase' | 'lowercase'
  fontStyle: 'normal' | 'italic'
}

const SERIF = "Georgia, 'Iowan Old Style', 'Times New Roman', serif"
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace"
const SANS = "system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"

/**
 * A printed Speisekarte: warm paper, one burgundy, leader dots. tabley serves
 * German restaurants and its guests are standing in one when they book, so this
 * is the world the product already lives in.
 */
const TABLEY: World = {
  slug: 'tabley',
  name: 'tabley',
  line: 'Online table reservations for German restaurants.',
  status: 'Live, four houses, one full case study.',
  paper: '#f4ede0',
  ink: '#2a211a',
  accent: '#8a2b26',
  rule: '#cbb99b',
  display: SERIF,
  body: SERIF,
  voice: { fontWeight: 400, letterSpacing: '-0.02em', textTransform: 'none', fontStyle: 'italic' },
  texture: 'repeating-linear-gradient(90deg, rgba(138,43,38,0.05) 0 1px, transparent 1px 5px)',
}

/**
 * A drafting sheet. project-matrix is a thesis with its solution sections still
 * empty, so it wears the language of a proposal rather than a product.
 */
const PROJECT_MATRIX: World = {
  slug: 'project-matrix',
  name: 'project-matrix',
  line: 'A framework for AFK agentic development.',
  status: 'In construction — a problem statement, honestly labelled.',
  paper: '#dfe6ec',
  ink: '#1b2a3a',
  accent: '#1f5f8b',
  rule: '#9fb4c7',
  display: MONO,
  body: MONO,
  voice: { fontWeight: 500, letterSpacing: '-0.01em', textTransform: 'none', fontStyle: 'normal' },
  texture:
    'repeating-linear-gradient(0deg, rgba(31,95,139,0.14) 0 1px, transparent 1px 16px), repeating-linear-gradient(90deg, rgba(31,95,139,0.14) 0 1px, transparent 1px 16px)',
}

/** An ops console — a readout, deliberately not a prompt. See the note in matrix.tsx. */
const MATRIX: World = {
  slug: 'matrix',
  name: 'matrix',
  line: 'Spawns AFK agents — each named Smith — that work through GitHub issues one at a time.',
  status: 'Shipping today. Ralph loops and automated review.',
  paper: '#0b0f0d',
  ink: '#cfe8d8',
  accent: '#5fd39a',
  rule: '#1f3a2c',
  display: MONO,
  body: MONO,
  voice: { fontWeight: 500, letterSpacing: '0.02em', textTransform: 'lowercase', fontStyle: 'normal' },
  texture: 'repeating-linear-gradient(0deg, rgba(95,211,154,0.05) 0 1px, transparent 1px 3px)',
}

/** A blank sheet: smith generates empty projects, so its world is the emptiest one here. */
const SMITH: World = {
  slug: 'smith',
  name: 'smith',
  line: 'Generates an empty TanStack Start project optimised for agentic engineering.',
  status: 'The scaffold this very site was built from.',
  paper: '#fdfdfd',
  ink: '#111111',
  accent: '#111111',
  rule: '#d8d8d8',
  display: SANS,
  body: SANS,
  voice: { fontWeight: 600, letterSpacing: '-0.045em', textTransform: 'none', fontStyle: 'normal' },
  texture: undefined,
}

/** Archival: history, not an offer, so it is printed like something already filed away. */
const WORKSHOPS: World = {
  slug: 'workshops',
  name: 'Workshops',
  line: 'Web development, the MCP series, React — taught, then wound down.',
  status: 'History, not an offer — no booking path.',
  paper: '#e4dccb',
  ink: '#4a4436',
  accent: '#6b5f45',
  rule: '#bdb298',
  display: SERIF,
  body: SERIF,
  voice: { fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase', fontStyle: 'normal' },
  texture: undefined,
}

export const WORLDS: readonly World[] = [TABLEY, PROJECT_MATRIX, MATRIX, SMITH, WORKSHOPS]

/** Only these two are built this round; the rest open onto their art direction and an empty body. */
export const BUILT: readonly string[] = ['tabley', 'matrix']

export function findWorld(slug: string): World | undefined {
  return WORLDS.find((world) => world.slug === slug)
}
