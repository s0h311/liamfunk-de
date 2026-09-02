import type { BuildState, Commit, Event, Moment, Ticket } from './log'
import { clock, day, turnaround } from './log'
import { COLUMN, Cursor, LABEL, MONO } from './ui'

const ISSUE_URL = 'https://github.com/s0h311/liamfunk-de/issues'

/**
 * The signature interaction, and the reason it is a document rather than a widget:
 * every row of the log is a link that moves the cursor, and the cursor is a query
 * parameter, so the page above re-renders as the site stood at that moment — on the
 * server, at any state, with or without JavaScript.
 *
 * Rows after the cursor are dimmed rather than removed. Hiding them would make the
 * control one-way and would take information out of the document, which is exactly
 * what the no-JS and reduced-motion floors both forbid.
 */
export function Timeline({ moments, cursor }: Readonly<{ moments: readonly Moment[]; cursor: number }>) {
  const reversed = moments.toReversed()

  return (
    <ol className='mt-4 border-t border-neutral-200'>
      {reversed.map((moment, position) => {
        const ahead = moment.index > cursor
        const previous = reversed[position - 1]
        const newDay = previous === undefined || day(previous.at) !== day(moment.at)

        return (
          <li key={moment.index}>
            {newDay ? <DayRule at={moment.at} /> : null}

            <div className={`flex gap-3 border-b border-neutral-200 py-2 sm:gap-5 ${ahead ? 'text-neutral-400' : ''}`}>
              <Cursor
                to={moment.index}
                label={`Read the site as it stood at ${clock(moment.at)}`}
                className={`inline-flex h-11 w-14 shrink-0 items-center ${MONO} ${
                  moment.index === cursor
                    ? 'font-semibold text-neutral-950 underline decoration-2 decoration-neutral-900 underline-offset-4'
                    : 'text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950 hover:decoration-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900'
                }`}
              >
                {clock(moment.at)}
              </Cursor>

              <ul className='min-w-0 grow py-1.5'>
                {moment.events.map((event) => (
                  <EventRow
                    key={eventKey(event)}
                    event={event}
                    muted={ahead}
                  />
                ))}
              </ul>
            </div>

            {moment.index === cursor && position > 0 ? <CursorRule /> : null}
          </li>
        )
      })}
    </ol>
  )
}

function eventKey(event: Event): string {
  return event.kind === 'commit' ? event.commit.sha : `${event.kind}-${event.ticket.number}`
}

function DayRule({ at }: Readonly<{ at: string }>) {
  return <p className={`bg-neutral-50 px-3 py-1.5 ${LABEL} border-b border-neutral-200`}>{day(at)}</p>
}

function CursorRule() {
  return (
    <p className='flex items-center gap-3 border-b border-neutral-900 bg-neutral-900 px-3 py-1.5 text-[13px] text-white'>
      You are reading the site as it stood here.
    </p>
  )
}

function EventRow({ event, muted }: Readonly<{ event: Event; muted: boolean }>) {
  if (event.kind === 'commit') {
    return <CommitRow commit={event.commit} />
  }

  return (
    <TicketRow
      ticket={event.ticket}
      closed={event.kind === 'closed'}
      muted={muted}
    />
  )
}

function CommitRow({ commit }: Readonly<{ commit: Commit }>) {
  return (
    <li className='py-1 text-[15px] leading-snug'>
      <span className='align-baseline'>{commit.subject}</span>{' '}
      <span className='whitespace-nowrap'>
        <Actor actor={commit.actor} />
      </span>
      <span className={`mt-0.5 block ${MONO} text-neutral-500`}>
        {commit.sha} · {commit.branch} · +{commit.added.toLocaleString('en-US')}
        {commit.removed > 0 ? ` −${commit.removed.toLocaleString('en-US')}` : ''}
      </span>
    </li>
  )
}

/**
 * Not a decoration: `agent` means the commit carries a Co-Authored-By trailer from
 * a Claude Code session, and `Liam` means it does not. This is the one claim the
 * concept makes about itself that would be worth faking, so it is derived from the
 * commit and nothing else.
 */
function Actor({ actor }: Readonly<{ actor: Commit['actor'] }>) {
  return actor === 'agent' ? (
    <span className='ml-1 rounded-sm bg-neutral-900 px-1.5 py-0.5 text-[11px] text-white'>agent</span>
  ) : (
    <span className='ml-1 rounded-sm border border-neutral-300 px-1.5 py-0.5 text-[11px] text-neutral-600'>Liam</span>
  )
}

function TicketRow({ ticket, closed, muted }: Readonly<{ ticket: Ticket; closed: boolean; muted: boolean }>) {
  const took = turnaround(ticket)

  return (
    <li>
      <a
        href={`${ISSUE_URL}/${ticket.number}`}
        className='flex min-h-11 flex-col justify-center py-1 text-[15px] leading-snug'
      >
        <span>
          <span className={muted ? 'text-neutral-400' : 'text-neutral-500'}>{closed ? 'closed' : 'opened'}</span>{' '}
          <span className='underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'>
            <span className={MONO}>#{ticket.number}</span> {ticket.title}
          </span>
        </span>
        <span className={`${MONO} text-neutral-500`}>
          {ticket.type}
          {closed && took !== null ? ` · open for ${took}` : ''}
        </span>
      </a>
    </li>
  )
}

/* ------------------------------------------------------------------ the state */

export function Dashboard({
  state,
  cursor,
  last,
  latestAt,
}: Readonly<{ state: BuildState; cursor: number; last: number; latestAt: string }>) {
  const now = cursor === last
  const behind = Math.round((new Date(latestAt).getTime() - new Date(state.at).getTime()) / 3_600_000)

  return (
    <div className='border border-neutral-900'>
      <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-neutral-900 bg-neutral-900 px-3 py-1.5 text-white'>
        <p className={MONO}>
          {day(state.at)} {clock(state.at)}
          <span className='ml-2 text-neutral-400'>{now ? 'the site as it stands now' : `${behind}h before now`}</span>
        </p>
        <div className='flex items-center gap-1'>
          <Step
            to={cursor - 1}
            enabled={cursor > 0}
            label='Earlier'
          >
            ← earlier
          </Step>
          <Step
            to={cursor + 1}
            enabled={cursor < last}
            label='Later'
          >
            later →
          </Step>
          {now ? null : (
            <Cursor
              to={last}
              className='ml-1 inline-flex h-11 items-center rounded-sm bg-white px-3 text-[13px] font-medium text-neutral-900'
            >
              now
            </Cursor>
          )}
        </div>
      </div>

      <dl className='grid grid-cols-2 sm:grid-cols-4'>
        <Figure
          label='hours in'
          value={String(Math.round(state.elapsedHours))}
        />
        <Figure
          label='commits'
          value={String(state.commits.length)}
          note={`${state.agentCommits} by an agent`}
        />
        <Figure
          label='decisions closed'
          value={`${state.closedTickets.length} of ${state.closedTickets.length + state.openTickets.length}`}
        />
        <Figure
          label='site pages built'
          value='0'
          note='this one included'
        />
      </dl>
    </div>
  )
}

function Step({
  to,
  enabled,
  label,
  children,
}: Readonly<{ to: number; enabled: boolean; label: string; children: string }>) {
  if (!enabled) {
    return (
      <span
        aria-hidden='true'
        className='inline-flex h-11 items-center px-3 text-[13px] text-neutral-600'
      >
        {children}
      </span>
    )
  }

  return (
    <Cursor
      to={to}
      label={`${label} in the build`}
      className='inline-flex h-11 items-center px-3 text-[13px] text-neutral-200 underline decoration-neutral-600 underline-offset-4 hover:text-white hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
    >
      {children}
    </Cursor>
  )
}

function Figure({ label, value, note }: Readonly<{ label: string; value: string; note?: string }>) {
  return (
    <div className='border-r border-b border-neutral-200 px-3 py-2 last:border-r-0'>
      <dt className={LABEL}>{label}</dt>
      <dd className='font-mono text-xl tabular-nums text-neutral-950'>{value}</dd>
      {note === undefined ? null : <dd className='text-[13px] text-neutral-500'>{note}</dd>}
    </div>
  )
}

/**
 * The tracker, on the site. Not a screenshot of a backlog and not a summary of one —
 * the same issues the work is actually run from, in the state they were in at the
 * cursor, each one a link to the real thing.
 */
export function Backlog({ state, here }: Readonly<{ state: BuildState; here?: number }>) {
  return (
    <div className='mt-8 grid gap-8 sm:grid-cols-2'>
      <section>
        <h3 className='border-b border-neutral-900 pb-1 text-[15px] font-semibold'>
          Still open <span className={`ml-1 ${MONO} font-normal text-neutral-500`}>{state.openTickets.length}</span>
        </h3>
        <ul className='divide-y divide-neutral-200'>
          {state.openTickets.map((ticket) => (
            <TicketLine
              key={ticket.number}
              ticket={ticket}
              decided={false}
              here={ticket.number === here}
            />
          ))}
        </ul>
      </section>

      <section>
        <h3 className='border-b border-neutral-900 pb-1 text-[15px] font-semibold'>
          Decided <span className={`ml-1 ${MONO} font-normal text-neutral-500`}>{state.closedTickets.length}</span>
        </h3>
        {state.closedTickets.length === 0 ? (
          <p className='py-2 text-[15px] text-neutral-500'>Nothing yet. Everything above is still a question.</p>
        ) : (
          <ul className='divide-y divide-neutral-200'>
            {state.closedTickets.toReversed().map((ticket) => (
              <TicketLine
                key={ticket.number}
                ticket={ticket}
                decided
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

/**
 * `decided` comes from the caller rather than from the ticket, because the panel
 * renders the backlog *as of the cursor*: a ticket that is closed today was open
 * then, and telling the reader how long it stayed open would be reading the
 * future back into a moment that did not have it yet.
 */
function TicketLine({ ticket, decided, here = false }: Readonly<{ ticket: Ticket; decided: boolean; here?: boolean }>) {
  const took = decided ? turnaround(ticket) : null

  return (
    <li className='py-1.5 text-[15px] leading-snug'>
      <a
        href={`${ISSUE_URL}/${ticket.number}`}
        className='inline-flex min-h-11 items-center underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
      >
        <span>
          <span className={`${MONO} text-neutral-500`}>#{ticket.number}</span> {ticket.title}
        </span>
      </a>
      <span className={`block ${MONO} text-neutral-500`}>
        {ticket.type}
        {took === null ? '' : ` · closed after ${took}`}
        {here ? ' · this page is what it asked for' : ''}
      </span>
    </li>
  )
}

export { COLUMN }
