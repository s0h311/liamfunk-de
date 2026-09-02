/**
 * The model behind the front door: what happens to one agent's context window
 * when it is pointed at a whole spec.
 *
 * The numbers are a stated model, not a measurement — the page prints its own
 * assumptions so a reader can disagree with them. The claim being modelled is
 * project-matrix's, from docs/raw-material.md: one agent over a whole spec
 * leaves the "non-dumb zone" of roughly 0–100K tokens.
 */

/** Repo rules plus the spec itself, read once before any work starts. */
export const PREAMBLE_TOKENS = 12_000
/** The issue and its discussion. */
export const ISSUE_TOKENS = 4_000
/** Reading a file, writing it back, and reviewing the diff. */
export const FILE_TOKENS = 3_000
/** The top of the non-dumb zone. */
export const CEILING_TOKENS = 100_000

export type Strategy = 'one-agent' | 'agent-per-issue'

export type Backlog = {
  issues: number
  filesPerIssue: number
  strategy: Strategy
}

export type Step = {
  issue: number
  tokens: number
  overCeiling: boolean
}

export function issueCost(filesPerIssue: number): number {
  return ISSUE_TOKENS + filesPerIssue * FILE_TOKENS
}

/**
 * One entry per issue, carrying the context the agent is holding *while working
 * that issue*. Under `one-agent` the context accumulates because the run never
 * ends; under `agent-per-issue` every issue starts from the preamble again.
 */
export function contextRun({ issues, filesPerIssue, strategy }: Backlog): Step[] {
  const perIssue = issueCost(filesPerIssue)
  const steps: Step[] = []
  let carried = PREAMBLE_TOKENS

  for (let issue = 1; issue <= issues; issue++) {
    if (strategy === 'one-agent') {
      carried += perIssue
    }

    const tokens = strategy === 'one-agent' ? carried : PREAMBLE_TOKENS + perIssue

    steps.push({ issue, tokens, overCeiling: tokens > CEILING_TOKENS })
  }

  return steps
}

/** The issue at which the run leaves the non-dumb zone, or null if it never does. */
export function firstOverflow(steps: Step[]): number | null {
  return steps.find((step) => step.overCeiling)?.issue ?? null
}

export function formatTokens(tokens: number): string {
  return `${Math.round(tokens / 1000)}K`
}
