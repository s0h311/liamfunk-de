import { createFileRoute, Link } from '@tanstack/react-router'
import { prototypes } from '../../prototypes/registry'
import { POSITIONINGS, POSITIONING_LABELS } from '../../prototypes/types'

export const Route = createFileRoute('/proto/')({
  head: () => ({
    meta: [{ title: 'Prototypes — liamfunk.de' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: PrototypeIndexPage,
})

function PrototypeIndexPage() {
  return (
    <main className='mx-auto min-h-dvh max-w-3xl px-6 py-12 font-sans text-neutral-900'>
      <header className='mb-10'>
        <h1 className='text-2xl font-semibold tracking-tight'>Prototypes</h1>
        <p className='mt-2 text-sm text-neutral-600'>
          Throwaway sketches for the concept comparison. They live in <code>prototypes/</code> and are not part of the
          site. The convention is in <code>prototypes/README.md</code>.
        </p>
        <p className='mt-2 text-sm text-neutral-600'>
          Review each one on desktop <em>and</em> on a phone — open the Network URL that <code>pnpm dev</code> prints.
        </p>
      </header>

      {prototypes.length === 0 ? (
        <p className='text-neutral-600'>
          No prototypes yet. Copy <code>prototypes/_placeholder/</code> to start one.
        </p>
      ) : (
        POSITIONINGS.map((positioning) => {
          const group = prototypes.filter((prototype) => prototype.positioning === positioning)

          if (group.length === 0) {
            return null
          }

          return (
            <section
              key={positioning}
              className='mb-10'
            >
              <h2 className='mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500'>
                {POSITIONING_LABELS[positioning]}
              </h2>
              <ul className='divide-y divide-neutral-200 border-y border-neutral-200'>
                {group.map((prototype) => (
                  <li key={prototype.slug}>
                    <Link
                      to='/proto/$slug'
                      params={{ slug: prototype.slug }}
                      className='block py-4 hover:bg-neutral-50'
                    >
                      <span className='font-medium'>{prototype.title}</span>
                      <span className='ml-2 text-xs text-neutral-400'>/proto/{prototype.slug}</span>
                      <span className='mt-1 block text-sm text-neutral-600'>{prototype.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}
    </main>
  )
}
