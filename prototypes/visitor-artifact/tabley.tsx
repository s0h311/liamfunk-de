import { SiteColophon, SiteHeader, href, type Query } from './chrome'
import { TheRecord } from './artifact'
import type { Record_ } from './record'

/**
 * The one real case study, and the second surface the record reaches.
 *
 * The concept only earns a backend if the accumulation is *about the work*. A
 * record that lives only on the front door is a guestbook; a record that knows
 * which project you opened is a reading of what people come here for. So this
 * page carries its own slice of the record and its own trace — and the trace you
 * leave here is recorded as left here, which is the whole difference.
 */
export function TableyPage({ query, record }: Readonly<{ query: Query; record: Record_ }>) {
  return (
    <div className='flex min-h-dvh flex-col bg-[#0a0a0b] font-sans text-[#e8e3d9] antialiased [&_[data-proto-chrome]]:opacity-20'>
      <SiteHeader home={false} />

      <main className='mx-auto w-full max-w-5xl grow px-5 pt-12 pb-16'>
        <p className='font-mono text-[0.72rem] tracking-[0.14em] text-[#8b867d] uppercase'>Rock Science · live</p>

        <h1 className='mt-3 text-2xl leading-snug font-normal text-balance sm:text-[1.75rem]'>
          tabley — online table reservations for German restaurants.
        </h1>

        <div className='mt-6 max-w-prose space-y-4 text-[0.975rem] leading-relaxed text-[#a5a096]'>
          <p>
            Public discovery and booking on one side; a merchant login — <em>Anmelden für Geschäfte</em> — on the other.
            German-language, server-rendered, with real customers taking real bookings.
          </p>
          <p>
            Four shops are live on it today: Thakali Kitchen, Luxor Restaurant &amp; Caffe, Bäckerei Allaf and Rooster
            Cafe. It is self-hosted end to end, down to the assets, which are served from Rock Science&apos;s own
            Hetzner object storage.
          </p>
          <p>
            It is framed as a Rock Science product rather than a personal side project, and it is the one entry here
            that proves shipped-and-maintained rather than built-and-abandoned.
          </p>
        </div>

        <dl className='mt-8 grid max-w-prose grid-cols-[7rem_1fr] gap-y-2 border-t border-white/10 pt-5 font-mono text-[0.78rem]'>
          <dt className='text-[#5c584f]'>Live</dt>
          <dd>
            <a
              href='https://tabley.de'
              className='underline underline-offset-4 hover:text-[#d9a441]'
            >
              tabley.de
            </a>
          </dd>
          <dt className='text-[#5c584f]'>Source</dt>
          <dd className='text-[#a5a096]'>private</dd>
          <dt className='text-[#5c584f]'>Shops live</dt>
          <dd className='text-[#a5a096]'>4</dd>
          <dt className='text-[#5c584f]'>Hosting</dt>
          <dd className='text-[#a5a096]'>self-hosted, Hetzner</dd>
        </dl>

        {/* Faked visibly: docs/raw-material.md lists screenshots and architecture notes as still needed. */}
        <p className='mt-6 max-w-prose border border-dashed border-white/15 p-4 font-mono text-[0.72rem] leading-relaxed text-[#5c584f]'>
          Screenshots, the architecture diagram and the decision log go here. They do not exist yet — and whether the
          four shops agree to be named publicly is still open — so the case study stops at what is true today rather
          than filling the space.
        </p>

        <div className='mt-14'>
          <TheRecord
            record={record}
            query={query}
            limit={10}
            scopedTo='tabley'
          />
        </div>

        <p className='mt-12'>
          <a
            href={href(query, { project: undefined })}
            className='inline-flex min-h-[44px] items-center text-[0.85rem] text-[#a5a096] underline underline-offset-4 hover:text-[#e8e3d9]'
          >
            ← the whole record
          </a>
        </p>
      </main>

      <SiteColophon />
    </div>
  )
}
