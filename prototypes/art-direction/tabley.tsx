import type { ReactNode } from 'react'
import { Pending, WorldName } from './chrome'
import { Section, WorldPage, WorldPlate } from './world-page'
import { findWorld, type World } from './worlds'

/**
 * tabley's world is a printed Speisekarte, because that is the room its users are
 * standing in when they book. The leader dots, the burgundy and the italic serif
 * are not decoration for a portfolio — they are the argument that the product was
 * designed for German restaurants rather than for a developer's screenshot.
 */
export function TableyWorld({ world }: Readonly<{ world: World }>) {
  const next = findWorld('matrix')

  return (
    <WorldPage world={world}>
      <Section
        world={world}
        title='Two sides of one product'
      >
        <p>
          Public discovery and booking for guests on one side; a merchant login — <em>Anmelden für Geschäfte</em> — on
          the other. A Rock Science product, not a personal side project.
        </p>
        <p className='mt-4'>
          <a
            href='https://tabley.de'
            style={{ color: world.accent }}
            className='inline-flex h-11 items-center underline decoration-2 underline-offset-4'
          >
            tabley.de
          </a>
          <span className='ml-6 opacity-70'>Source: private.</span>
        </p>
      </Section>

      <Section
        world={world}
        title='The four houses'
      >
        <ul>
          <Leader
            world={world}
            label='Thakali Kitchen'
          >
            live
          </Leader>
          <Leader
            world={world}
            label='Luxor Restaurant & Caffe'
          >
            live
          </Leader>
          <Leader
            world={world}
            label='Bäckerei Allaf'
          >
            live
          </Leader>
          <Leader
            world={world}
            label='Rooster Cafe'
          >
            live
          </Leader>
        </ul>
        <p className='mt-5 text-sm opacity-75'>
          <Pending>Whether the four houses have agreed to be named publicly</Pending> — printed here anyway so the hole
          is visible, and removable in one line if the answer is no.
        </p>
      </Section>

      <Section
        world={world}
        title='How it is built'
      >
        <p>
          Self-hosted end to end. Assets are served from Rock Science&rsquo;s own Hetzner object storage.
          Server-rendered, German-language, and carrying real customers rather than a demo seed.
        </p>
        <p className='mt-4'>
          <Pending>Architecture notes and the decisions behind them</Pending>.
        </p>
        <figure
          className='mt-6 flex h-56 items-center justify-center'
          style={{ border: `1px dashed ${world.rule}` }}
        >
          <figcaption className='px-6 text-center text-sm opacity-70'>
            <Pending>Screenshots of the booking flow and the merchant dashboard</Pending>
          </figcaption>
        </figure>
      </Section>

      <Section
        world={world}
        title='Why this one is the flagship'
      >
        <p>
          It is the entry that proves shipped-and-maintained rather than built-and-abandoned: four houses take real
          bookings through it today, in German, on infrastructure Rock Science runs itself.
        </p>
      </Section>

      {next === undefined ? null : (
        <section className='mt-16'>
          <p
            className='mb-3 text-sm opacity-70'
            style={{ color: world.ink }}
          >
            Next in the work
          </p>
          <WorldPlate
            world={next}
            size='plate'
          />
          <p
            className='mt-3 max-w-prose text-sm opacity-70'
            style={{ color: world.ink }}
          >
            A printed menu to a black console, in one tap and no JavaScript — with{' '}
            <WorldName
              world={next}
              className='text-sm'
              carry={false}
            />{' '}
            carrying you across so the jump reads as a move, not a different website.
          </p>
        </section>
      )}
    </WorldPage>
  )
}

/** Menu leader dots. A restaurant device, doing a real job: name on the left, state on the right. */
function Leader({ world, label, children }: Readonly<{ world: World; label: string; children: ReactNode }>) {
  return (
    <li className='flex items-baseline gap-2 py-2'>
      <span>{label}</span>
      <span
        aria-hidden='true'
        className='grow translate-y-[-0.2em] border-b border-dotted'
        style={{ borderColor: world.rule }}
      />
      <span
        className='text-sm'
        style={{ color: world.accent }}
      >
        {children}
      </span>
    </li>
  )
}
