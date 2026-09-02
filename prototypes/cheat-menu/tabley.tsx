import type { CheatId, Search } from './cheats'
import { COLUMN, Fake } from './ui'

const SHOPS = ['Thakali Kitchen', 'Luxor Restaurant & Caffe', 'Bäckerei Allaf', 'Rooster Cafe']

/**
 * The one real case study. It renders as its own document at `?p=tabley`, and
 * NOCLIP renders the same component inline on the front door — same words, one
 * page boundary fewer. A cheat that only re-skinned the page would be a costume;
 * this one actually removes a wall.
 */
export function Tabley({
  cheats,
  inline,
}: Readonly<{ cheats: ReadonlySet<CheatId>; search: Search; inline?: boolean }>) {
  const Heading = inline === true ? 'h3' : 'h2'

  return (
    <article
      data-hb='article'
      className={inline === true ? '' : `${COLUMN} pt-10 pb-4`}
    >
      {inline === true && (
        <p className='mb-3 border-l-2 border-[#7c5cff] pl-3 font-mono text-[0.72rem] tracking-[0.08em] text-[#5b3fd1] uppercase'>
          noclip — the case study at <code>?p=tabley</code>, loaded through the wall
        </p>
      )}

      <Heading className='text-2xl font-semibold tracking-tight text-neutral-950'>tabley</Heading>
      <p className='mt-1 text-sm text-neutral-600'>
        A Rock Science product, not a personal side project. ·{' '}
        <a
          href='https://tabley.de'
          className='underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
        >
          tabley.de
        </a>{' '}
        · source private
      </p>

      <p className='mt-5 max-w-prose leading-relaxed text-neutral-800'>
        Online table reservations for German restaurants. Public discovery and booking on one side; a merchant login —{' '}
        <span lang='de'>Anmelden für Geschäfte</span> — on the other. Self-hosted end to end: assets are served from
        Rock Science's own Hetzner object storage. German-language, server-rendered, real customers.
      </p>

      <h3 className='mt-8 text-sm font-medium text-neutral-500'>Live shops</h3>
      <ul className='mt-2 space-y-1 text-[0.95rem] text-neutral-800'>
        {SHOPS.map((shop) => (
          <li key={shop}>{shop}</li>
        ))}
      </ul>
      <p className='mt-2 text-sm'>
        <Fake
          cheats={cheats}
          missing='whether the four shops have agreed to be named publicly'
        >
          Named here pending their permission.
        </Fake>
      </p>

      <h3 className='mt-8 text-sm font-medium text-neutral-500'>Architecture</h3>
      <p className='mt-2 max-w-prose text-[0.95rem] leading-relaxed'>
        <Fake
          cheats={cheats}
          missing='the architecture notes — decisions, trade-offs, what broke'
        >
          The write-up of how it is built goes here.
        </Fake>
      </p>

      <h3 className='mt-8 text-sm font-medium text-neutral-500'>Screenshots</h3>
      <div className='mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3'>
        {['Booking', 'Dashboard', 'Shop page'].map((shot) => (
          <div
            key={shot}
            className='flex aspect-[4/3] items-center justify-center border border-dashed border-neutral-400 bg-[#efece6] text-center text-[0.8rem] text-neutral-500'
          >
            {shot}
          </div>
        ))}
      </div>
      <p className='mt-2 text-sm'>
        <Fake
          cheats={cheats}
          missing='the screenshots themselves'
        >
          Three frames, none of them taken yet.
        </Fake>
      </p>

      <p className='mt-8 max-w-prose text-[0.95rem] leading-relaxed text-neutral-700'>
        This is the entry that proves shipped-and-maintained rather than built-and-abandoned. If you want the version
        with the parts that are still missing, it is one email:{' '}
        <a
          href='mailto:hi@liamfunk.de'
          className='font-mono underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
        >
          hi@liamfunk.de
        </a>
        .
      </p>
    </article>
  )
}
