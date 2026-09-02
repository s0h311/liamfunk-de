import {
  CEILING_TOKENS,
  FILE_TOKENS,
  ISSUE_TOKENS,
  PREAMBLE_TOKENS,
  contextRun,
  firstOverflow,
  formatTokens,
  issueCost,
} from './context-model'
import { SERVICE_END, SERVICE_START, countConflicts, formatClock, seatEvening } from './service-model'
import type { Service } from './service-model'
import type { Backlog } from './context-model'

/**
 * Both figures are plain server-rendered markup positioned with percentages —
 * no canvas, no measuring pass, no mount. What you see with JavaScript off is
 * the same figure, at whatever state the URL says.
 */

export function ContextFigure({ issues, filesPerIssue, strategy }: Readonly<Backlog>) {
  const steps = contextRun({ issues, filesPerIssue, strategy })
  const overflowAt = firstOverflow(steps)
  const peak = Math.max(...steps.map((step) => step.tokens))
  const scale = Math.max(peak, CEILING_TOKENS * 1.2)
  const finalTokens = steps.at(-1)?.tokens ?? PREAMBLE_TOKENS

  return (
    <figure className='my-8'>
      {/* Geometry only: the figcaption below carries the same information in words,
          which is what the no-JS screen and the reduced-motion floor both ask for. */}
      <div
        aria-hidden='true'
        className='relative h-56 border-b border-l border-neutral-300'
      >
        <div
          className='absolute inset-x-0 z-10 border-t border-dashed border-red-400'
          style={{ bottom: `${(CEILING_TOKENS / scale) * 100}%` }}
        >
          <span className='absolute -top-2.5 right-0 bg-[#fbfaf8] px-2 font-mono text-[0.65rem] whitespace-nowrap uppercase tracking-widest text-red-500'>
            100K — top of the non-dumb zone
          </span>
        </div>

        <div className='absolute inset-0 flex items-end gap-[2px] px-[2px]'>
          {steps.map((step) => (
            <div
              key={step.issue}
              className={`flex-1 ${step.overCeiling ? 'bg-red-500' : 'bg-neutral-900'}`}
              style={{ height: `${(step.tokens / scale) * 100}%` }}
            />
          ))}
        </div>
      </div>

      <div
        aria-hidden='true'
        className='mt-1 flex gap-[2px] px-[2px]'
      >
        {steps.map((step) => (
          <div
            key={step.issue}
            className={`flex-1 text-center font-mono text-[0.6rem] tabular-nums ${
              step.issue === overflowAt ? 'font-bold text-red-600' : 'text-neutral-400'
            }`}
          >
            {step.issue}
          </div>
        ))}
      </div>

      <figcaption className='mt-4 max-w-prose text-[0.95rem] leading-relaxed text-neutral-700'>
        {strategy === 'one-agent' ? (
          overflowAt === null ? (
            <>
              This spec fits. One agent carries all {issues} {issues === 1 ? 'issue' : 'issues'} and finishes holding{' '}
              <Number>{formatTokens(finalTokens)}</Number>, still inside the zone. Add issues, or files per issue, until
              it doesn&rsquo;t.
            </>
          ) : (
            <>
              <strong className='font-semibold text-neutral-950'>Issue {overflowAt}</strong> is where this run leaves
              the non-dumb zone. Everything after it — {issues - overflowAt} of {issues}{' '}
              {issues - overflowAt === 1 ? 'issue' : 'issues'}, ending at <Number>{formatTokens(finalTokens)}</Number> —
              is written by a model that can no longer properly see the spec it started from. That is the garbage-in
              half of garbage-in garbage-out, and it is not a prompting problem.
            </>
          )
        ) : (
          <>
            Every issue gets its own agent, so the context resets between them: each one is written at a flat{' '}
            <Number>{formatTokens(PREAMBLE_TOKENS + issueCost(filesPerIssue))}</Number>, well inside the zone, however
            long the backlog gets. The diff stays reviewable for the same reason — it arrives one issue at a time.{' '}
            <strong className='font-semibold text-neutral-950'>This is what matrix does.</strong>
          </>
        )}
      </figcaption>

      <p className='mt-3 max-w-prose text-xs leading-relaxed text-neutral-500'>
        The model, so you can disagree with it: {formatTokens(PREAMBLE_TOKENS)} for the repo rules and the spec, read
        once; {formatTokens(ISSUE_TOKENS)} per issue for the issue and its discussion; {formatTokens(FILE_TOKENS)} per
        file touched, covering the read, the write and the review of the diff.
      </p>
    </figure>
  )
}

function Number({ children }: Readonly<{ children: string }>) {
  return <span className='font-mono tabular-nums text-neutral-950'>{children}</span>
}

const HOURS = [17, 18, 19, 20, 21, 22, 23]
const SPAN = SERVICE_END - SERVICE_START

export function ServiceFigure({ tables, bookings, turnMinutes }: Readonly<Service>) {
  const seatings = seatEvening({ tables, bookings, turnMinutes })
  const conflicts = countConflicts(seatings)

  return (
    <figure className='my-8'>
      <div className='relative mb-1 ml-16 flex text-[0.65rem] tabular-nums text-neutral-400'>
        {HOURS.map((hour) => (
          <span
            key={hour}
            className='absolute -translate-x-1/2 font-mono'
            style={{ left: `${((hour * 60 - SERVICE_START) / SPAN) * 100}%` }}
          >
            {hour}
          </span>
        ))}
        <span className='invisible'>.</span>
      </div>

      <div className='border-y border-neutral-300'>
        {Array.from({ length: tables }, (_, table) => (
          <div
            key={table}
            className='flex items-stretch border-b border-neutral-200 last:border-b-0'
          >
            <div className='flex w-16 shrink-0 items-center pr-3 text-right font-mono text-[0.65rem] uppercase tracking-widest text-neutral-500'>
              <span className='w-full'>T{table + 1}</span>
            </div>
            <div className='relative h-14 grow'>
              {HOURS.map((hour) => (
                <span
                  key={hour}
                  className='absolute inset-y-0 w-px bg-neutral-100'
                  style={{ left: `${((hour * 60 - SERVICE_START) / SPAN) * 100}%` }}
                />
              ))}
              {seatings
                .filter((seating) => seating.table === table)
                .map((seating) => (
                  <span
                    key={seating.id}
                    className={`absolute flex h-7 items-center overflow-hidden whitespace-nowrap px-2 font-mono text-[0.65rem] tabular-nums ${
                      seating.doubleBooks === null
                        ? 'top-1.5 bg-neutral-900 text-neutral-50'
                        : 'top-6 z-10 bg-red-600 text-white ring-2 ring-[#fbfaf8]'
                    }`}
                    style={{
                      left: `${((seating.start - SERVICE_START) / SPAN) * 100}%`,
                      width: `${((Math.min(seating.end, SERVICE_END) - seating.start) / SPAN) * 100}%`,
                    }}
                  >
                    {formatClock(seating.start)}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>

      <figcaption className='mt-4 max-w-prose text-[0.95rem] leading-relaxed text-neutral-700'>
        {conflicts === 0 ? (
          <>
            <span className='font-mono tabular-nums text-neutral-950'>{tables}</span>{' '}
            {tables === 1 ? 'table' : 'tables'}, {turnMinutes}-minute turns, {bookings}{' '}
            {bookings === 1 ? 'booking' : 'bookings'} — and the evening holds. Nobody is promised a table that is still
            occupied.
          </>
        ) : (
          <>
            <span className='font-mono tabular-nums text-neutral-950'>{tables}</span>{' '}
            {tables === 1 ? 'table' : 'tables'}, {turnMinutes}-minute turns, {bookings} bookings —{' '}
            <strong className='font-semibold text-red-700'>
              {conflicts} {conflicts === 1 ? 'party is' : 'parties are'} promised a table that is still occupied
            </strong>{' '}
            (red). Nothing here is a bug: every booking was accepted the moment it was made, which is exactly what a
            restaurant does when the diary is a paper book and the phone is ringing. Shorten the turn or add a table
            until the red disappears.
          </>
        )}
      </figcaption>
    </figure>
  )
}
