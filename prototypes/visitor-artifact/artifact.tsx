import { href, type Query } from './chrome'
import {
  REASONS,
  REASON_LABELS,
  REASON_PROMPTS,
  composeReading,
  composeReadingFor,
  type Arrival,
  type Record_,
  type Surface,
} from './record'

/**
 * The signature interaction: one tap adds a line to a record the server renders
 * as markup.
 *
 * Every part of it is a plain `<a href>` carrying the choice in the query string,
 * so the whole thing works with JavaScript off — which is not a nicety here but
 * the concept's survival condition. An accumulation fetched on the client is a
 * page whose only unique content is invisible to a crawler, and this concept's
 * entire claim is that the page contains text existing nowhere else on the web.
 *
 * The known defect, named rather than hidden: a link that writes is a `GET` that
 * mutates. Nothing mutates in this sketch (the record is a fixture), but in the
 * real build the same markup would let every crawler, prefetcher and link-preview
 * bot author the artifact. The fix is a `<form method="post">`, which needs a
 * route handler in `app/` — off-limits to a sketch by the harness rules, and
 * priced in the resolution instead.
 */
export function TraceRow({ query, at }: Readonly<{ query: Query; at: Surface }>) {
  if (query.trace !== undefined) {
    /* A trace belongs to the page it was left on, so on any other page the
       confirmation has to say where it went — otherwise "your line is at the top"
       points at a stranger's. */
    const here = query.at === at

    return (
      <div className='mt-8 border-t border-white/10 pt-6'>
        <p className='text-[0.95rem] text-[#e8e3d9]'>
          {here
            ? 'Your line is at the top. It stays after you go — and it is the only part of this site nobody wrote.'
            : `Your line is on the record, left at the ${query.at}. It stays after you go.`}
        </p>
        {/*
          Erasure as a link. Three characters of markup, and it is the honest
          answer to the two hardest questions this concept has to survive: a
          visitor who regrets their trace, and a German site storing records of
          who came. See the GDPR paragraph in the resolution.
        */}
        <a
          href={href(query, { trace: undefined })}
          className='mt-3 inline-flex min-h-[44px] items-center text-[0.8rem] text-[#8b867d] underline underline-offset-4 hover:text-[#e8e3d9]'
        >
          Take my line back off the record
        </a>
      </div>
    )
  }

  return (
    <div className='mt-8 border-t border-white/10 pt-6'>
      <h3 className='text-[0.95rem] text-[#e8e3d9]'>
        {at === 'tabley' ? 'Leave your trace on tabley' : 'Leave your trace'}
      </h3>
      {/*
        No instruction line. Four labelled doors are the instruction; a sentence
        explaining the metaphor before the visitor can act is an S3 failure by
        the protocol's own wording.
      */}
      <ul className='mt-4 grid gap-2 sm:grid-cols-2'>
        {REASONS.map((reason) => (
          <li key={reason}>
            <a
              href={href(query, { trace: reason, at })}
              className='flex min-h-[56px] items-center rounded-sm border border-white/15 px-4 text-[0.9rem] text-[#e8e3d9] hover:border-[#d9a441] hover:bg-white/[0.04]'
            >
              {REASON_PROMPTS[reason]}
            </a>
          </li>
        ))}
      </ul>
      <p className='mt-3 text-[0.72rem] text-[#5c584f]'>
        Four choices, no text field. That is the whole moderation policy.
      </p>
    </div>
  )
}

/**
 * The record, rendered as a stratum rather than a comment list.
 *
 * Depth is carried by falling opacity, which is a static property of the markup:
 * no motion, no JavaScript, nothing to remove under `prefers-reduced-motion` and
 * nothing to lose with scripting off. What the fade says — "older" — the date on
 * every line says too, so the dimming is decoration over information that is
 * already written down.
 */
export function TheRecord({
  record,
  query,
  limit = 22,
  scopedTo,
}: Readonly<{ record: Record_; query: Query; limit?: number; scopedTo?: Surface }>) {
  const scoped =
    scopedTo === undefined ? record.arrivals : record.arrivals.filter((arrival) => arrival.surface === scopedTo)
  const shown = scoped.slice(0, limit)

  return (
    <section
      id='record'
      className='scroll-mt-16'
    >
      <h2 className='text-[0.78rem] tracking-[0.14em] text-[#8b867d] uppercase'>
        {scopedTo === undefined ? 'The record' : 'The record, here'}
      </h2>

      <p className='mt-3 max-w-prose text-[1.05rem] leading-relaxed text-balance text-[#e8e3d9]'>
        {scopedTo === undefined ? composeReading(record) : composeReadingFor(record, scopedTo)}
      </p>

      {scoped.length === 0 ? (
        <EmptyRecord />
      ) : (
        <ol className='mt-7 max-w-3xl border-t border-white/10'>
          {shown.map((arrival, index) => (
            <RecordLine
              key={arrival.ordinal}
              arrival={arrival}
              depth={index / Math.max(1, shown.length - 1)}
              showSurface={scopedTo === undefined}
            />
          ))}
        </ol>
      )}

      {shown.length < scoped.length && (
        <p className='mt-3 text-[0.72rem] text-[#5c584f]'>
          {scoped.length - shown.length} older{' '}
          {scopedTo === undefined ? 'arrivals are in the record' : 'traces are on this page'} and not shown here.
        </p>
      )}

      <TraceRow
        query={query}
        at={scopedTo ?? 'front door'}
      />
    </section>
  )
}

function RecordLine({
  arrival,
  depth,
  showSurface,
}: Readonly<{ arrival: Arrival; depth: number; showSurface: boolean }>) {
  return (
    <li
      className={`flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-white/[0.07] py-2 font-mono text-[0.78rem] ${
        arrival.you ? '-ml-3 border-l-2 border-l-[#d9a441] pl-3' : ''
      }`}
      /* 0.95 → 0.32: the oldest line on screen is still legible, because a record
         you cannot read is a decoration pretending to be a document. */
      style={{ opacity: 0.95 - depth * 0.63 }}
    >
      <span className='w-9 shrink-0 text-right tabular-nums text-[#8b867d]'>{arrival.ordinal}</span>
      {/*
        On a phone the timestamp drops to its own line under the reason rather
        than forcing a third row per arrival: 22 arrivals at three rows each is a
        record you scroll past instead of read.
      */}
      <span className='order-last w-full pl-12 tabular-nums text-[#5c584f] sm:order-none sm:w-24 sm:pl-0'>
        {arrival.you ? 'just now' : `${arrival.day} ${arrival.time}`}
      </span>
      <span className='min-w-0 flex-1 text-[#e8e3d9]'>
        {REASON_LABELS[arrival.reason]}
        {arrival.you && <span className='ml-2 text-[#d9a441]'>— you</span>}
      </span>
      {showSurface && <span className='shrink-0 text-[#5c584f] sm:w-28 sm:text-right'>{arrival.surface}</span>}
    </li>
  )
}

/**
 * The state the survey said would kill this concept: nobody has come.
 *
 * It is drawn as ruled but unwritten lines — a ledger waiting, not a feed with
 * nothing in it. Being the first arrival is a better offer than being the 149th,
 * and this is the one version of the empty state that says so out loud.
 */
function EmptyRecord() {
  return (
    <div className='mt-7 max-w-3xl border-t border-white/10'>
      {[0, 1, 2, 3, 4, 5].map((line) => (
        <div
          key={line}
          className='h-8 border-b border-white/[0.07]'
          style={{ opacity: 0.9 - line * 0.14 }}
        />
      ))}
      <p className='mt-4 max-w-prose text-[0.85rem] text-[#8b867d]'>
        Six ruled lines and nothing on them. The record starts the day the site does.
      </p>
    </div>
  )
}
