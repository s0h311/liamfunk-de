/**
 * A prototype is a throwaway sketch, not part of the real site.
 * See ./README.md for the convention.
 */
export type PrototypeMeta = {
  /** Shown on the index. Name the idea, not the file. */
  title: string
  /** Which of the three positionings this sketch argues for. */
  positioning: Positioning
  /** One line: what this sketch is trying to prove. */
  note: string
}

export type Positioning = 'calling-card' | 'hiring-first' | 'playground' | 'scratch'

export const POSITIONINGS: readonly Positioning[] = ['calling-card', 'hiring-first', 'playground', 'scratch']

export const POSITIONING_LABELS: Record<Positioning, string> = {
  'calling-card': 'Calling card',
  'hiring-first': 'Hiring-first',
  playground: 'Playground',
  scratch: 'Scratch',
}
