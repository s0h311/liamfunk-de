import type { CSSProperties, ReactNode } from 'react'
import { WORLDS, type World } from './worlds'

export const SLUG = 'art-direction'

/** Front door. A world is the same document plus `?p=<slug>` — query string, never the hash. */
export const FRONT_DOOR = `/proto/${SLUG}`

export function worldHref(world: World): string {
  return `${FRONT_DOOR}?p=${world.slug}`
}

/**
 * The signature interaction, in full.
 *
 * `@view-transition { navigation: auto }` is the whole opt-in: it fires only on a
 * real cross-document navigation, which is why every link between worlds here is
 * a plain `<a>` and not a `<Link>`. No JavaScript runs. The browser snapshots the
 * plate you tapped, snapshots the banner it became, and morphs one into the other
 * — so falling from a printed menu into a black console never loses your place.
 *
 * Rendered as a `<style>` inside the sketch rather than hoisted into `<head>`,
 * deliberately: `@view-transition` is document-scoped, and a hoisted stylesheet
 * survives unmount, which would silently switch cross-document transitions on for
 * every *other* prototype the reviewer visits in the same session.
 *
 * The per-world rules are generated from WORLDS, which is the linear cost again:
 * a sixth project is a sixth palette *and* two more transition groups.
 */
export const transitionCss: string = [
  '@view-transition { navigation: auto; }',
  '::view-transition-old(root), ::view-transition-new(root) { animation-duration: 380ms; animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }',
  /* The constant does not travel: the header is the one thing that must not move or blink. */
  '::view-transition-group(site-header) { animation-duration: 1ms; }',
  ...WORLDS.flatMap((world) => [
    `::view-transition-group(plate-${world.slug}), ::view-transition-group(name-${world.slug}) { animation-duration: 640ms; animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }`,
    `::view-transition-old(plate-${world.slug}), ::view-transition-new(plate-${world.slug}), ::view-transition-old(name-${world.slug}), ::view-transition-new(name-${world.slug}) { animation-duration: 640ms; animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }`,
  ]),
  /*
   * The reduced-motion floor, hand-written because the platform suppresses
   * nothing on its own (#12). `navigation: none` drops the whole transition back
   * to a plain document swap — and loses no information, because the morph only
   * ever said "this is the same object" and the constant header says that too.
   */
  '@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none; } }',
  '@media (prefers-reduced-motion: reduce) { ::view-transition-group(site-header) { animation: none; } }',
].join('\n')

export function TransitionStyles() {
  return <style>{transitionCss}</style>
}

/**
 * The one boring thing.
 *
 * Identical markup, identical position, identical colours in every world — it is
 * never art directed, which is what stops five different-looking pages from
 * reading as five different websites. Sticky, so the email is in the first
 * viewport at any scroll position, and so the transition always has it on screen
 * to hold still.
 */
export function SiteHeader({ home }: Readonly<{ home: boolean }>) {
  return (
    <header
      style={{ viewTransitionName: 'site-header' }}
      className='sticky top-0 z-50 border-b border-neutral-300 bg-white font-sans text-neutral-900'
    >
      <div className='mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 px-5 py-1.5'>
        {home ? (
          <span className='text-[0.95rem] font-semibold tracking-tight'>Liam Funk</span>
        ) : (
          <a
            href={FRONT_DOOR}
            className='inline-flex h-11 items-center text-[0.95rem] font-semibold tracking-tight underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
          >
            Liam Funk
          </a>
        )}
        <nav className='flex items-center gap-5 text-sm'>
          <a
            href={home ? '#work' : `${FRONT_DOOR}#work`}
            className='inline-flex h-11 min-w-11 items-center justify-center underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
          >
            Work
          </a>
          <a
            href='mailto:hi@liamfunk.de'
            className='inline-flex h-11 items-center font-mono text-neutral-950 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900'
          >
            hi@liamfunk.de
          </a>
        </nav>
      </div>
    </header>
  )
}

/** Constant too, and for the same reason. */
export function SiteColophon() {
  return (
    <footer className='border-t border-neutral-300 bg-white font-sans text-neutral-900'>
      <div className='mx-auto w-full max-w-5xl px-5 py-6'>
        <ul className='flex flex-wrap items-center gap-x-8 text-sm'>
          <li>
            <a
              href='mailto:hi@liamfunk.de'
              className='inline-flex h-11 items-center font-mono underline decoration-neutral-400 underline-offset-4'
            >
              hi@liamfunk.de
            </a>
          </li>
          <li>
            <a
              href='https://github.com/s0h311'
              className='inline-flex h-11 items-center underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900'
            >
              GitHub
            </a>
          </li>
          <li className='py-2'>
            <Pending>LinkedIn</Pending>
          </li>
          <li className='py-2'>
            <Pending>CV (PDF)</Pending>
          </li>
        </ul>
        <p className='mt-4 max-w-prose text-xs leading-relaxed text-neutral-500'>
          Prototype. Every word comes from <code>docs/raw-material.md</code>; the dashed items are holes in that
          document, left visible rather than invented.
        </p>
      </div>
    </footer>
  )
}

/** A hole in docs/raw-material.md, shown as a hole rather than filled in. */
export function Pending({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className='border-b border-dashed border-current opacity-70'>
      {children}
      <span className='ml-1 align-super text-[0.6rem] tracking-widest uppercase opacity-70'>pending</span>
    </span>
  )
}

/**
 * The project name, in its world's voice. The same element on both sides of the morph.
 *
 * `carry` is not a style switch — it is the one hard rule the whole interaction
 * rests on. A `view-transition-name` must be unique in the document, and a
 * duplicate does not degrade: Chrome skips the *entire* transition, silently, on
 * both pages. So a name set in running prose passes `carry={false}` and stays out
 * of the morph. Cost of learning this: the tabley page named matrix twice, and the
 * signature interaction quietly stopped happening everywhere.
 */
export function WorldName({
  world,
  className,
  carry = true,
}: Readonly<{ world: World; className: string; carry?: boolean }>) {
  const style: CSSProperties = {
    viewTransitionName: carry ? `name-${world.slug}` : undefined,
    fontFamily: world.display,
    color: world.accent,
    ...world.voice,
  }

  return (
    <span
      style={style}
      className={className}
    >
      {world.name}
    </span>
  )
}

/** Paints a world's paper. Used at plate size on the front door and full-bleed inside it. */
export function worldSurface(world: World): CSSProperties {
  return {
    background: world.texture === undefined ? world.paper : `${world.texture}, ${world.paper}`,
    color: world.ink,
    fontFamily: world.body,
  }
}
