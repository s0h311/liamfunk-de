import type { CSSProperties, ReactNode } from 'react'
import { Pending, SiteColophon, SiteHeader, WorldName, worldHref, worldSurface } from './chrome'
import { BUILT, type World } from './worlds'

/**
 * A plate is a window onto a world, at front-door size.
 *
 * It carries the world's real paper, ink, type and texture — not a swatch of them —
 * and it lays its contents out exactly the way that world's banner does. That is
 * what makes the morph read as one object growing rather than two boxes
 * cross-fading, and it is also why every project owes a full art direction before
 * it can appear on the front door at all.
 */
export function WorldPlate({ world, size }: Readonly<{ world: World; size: 'plate' | 'banner' }>) {
  const banner = size === 'banner'
  const surface: CSSProperties = { ...worldSurface(world), viewTransitionName: `plate-${world.slug}` }
  const inner = (
    <div className={banner ? 'mx-auto w-full max-w-5xl' : ''}>
      <div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
        <WorldName
          world={world}
          className={banner ? 'text-5xl leading-none sm:text-7xl' : 'text-3xl leading-none sm:text-4xl'}
        />
        <span
          className={banner ? 'text-sm opacity-80' : 'text-xs opacity-70'}
          style={{ color: world.ink }}
        >
          {world.status}
        </span>
      </div>
      <p
        className={banner ? 'mt-5 max-w-prose text-lg leading-snug' : 'mt-3 max-w-prose text-sm leading-snug'}
        style={{ color: world.ink }}
      >
        {world.line}
      </p>
    </div>
  )

  if (banner) {
    return (
      <div
        style={{ ...surface, borderBottom: `1px solid ${world.rule}` }}
        className='px-5 pt-12 pb-14'
      >
        {inner}
      </div>
    )
  }

  return (
    <a
      href={worldHref(world)}
      style={{ ...surface, border: `1px solid ${world.rule}` }}
      className='block px-5 py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900'
    >
      {inner}
    </a>
  )
}

/** The frame every world shares: the boring header, the world, the boring colophon. */
export function WorldPage({ world, children }: Readonly<{ world: World; children: ReactNode }>) {
  return (
    <div
      style={worldSurface(world)}
      className='flex min-h-dvh flex-col antialiased [&_[data-proto-chrome]]:opacity-20'
    >
      <SiteHeader home={false} />
      <WorldPlate
        world={world}
        size='banner'
      />
      <main className='mx-auto w-full max-w-5xl grow px-5 pt-12 pb-20'>{children}</main>
      <SiteColophon />
    </div>
  )
}

/**
 * A world nobody built this round. Its banner is real — generated from the same
 * art direction the plate uses — and its body is an honest hole. Three of the five
 * projects land here; only tabley has a case study, per the round-one bar.
 */
export function StubWorld({ world }: Readonly<{ world: World }>) {
  return (
    <WorldPage world={world}>
      <p
        className='max-w-prose text-base leading-relaxed'
        style={{ color: world.ink }}
      >
        <Pending>The case study for {world.name}</Pending>. Round one builds one case study — tabley — so this world
        exists only as far as its art direction, which is the part the comparison is actually judging.
      </p>
      {BUILT.includes(world.slug) ? null : (
        <p
          className='mt-6 text-sm opacity-70'
          style={{ color: world.ink }}
        >
          The plate you tapped and this banner are the same object. That is the whole concept: five pages that look
          nothing alike, and one constant along the top so you always know whose site you are on.
        </p>
      )}
    </WorldPage>
  )
}

/** A ruled section head, set in the world's own voice rather than a generic label. */
export function Section({ world, title, children }: Readonly<{ world: World; title: string; children: ReactNode }>) {
  return (
    <section className='mt-12 first:mt-0'>
      <h2
        className='pb-2 text-xl'
        style={{
          color: world.accent,
          fontFamily: world.display,
          borderBottom: `1px solid ${world.rule}`,
          ...world.voice,
        }}
      >
        {title}
      </h2>
      <div
        className='mt-5 max-w-prose text-base leading-relaxed'
        style={{ color: world.ink }}
      >
        {children}
      </div>
    </section>
  )
}
