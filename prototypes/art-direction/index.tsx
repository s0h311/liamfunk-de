import { useRouterState } from '@tanstack/react-router'
import type { PrototypeMeta } from '../types'
import { SiteColophon, SiteHeader, TransitionStyles } from './chrome'
import { MatrixWorld } from './matrix'
import { TableyWorld } from './tabley'
import { StubWorld, WorldPlate } from './world-page'
import { WORLDS, findWorld } from './worlds'

export const meta: PrototypeMeta = {
  title: 'Art Direction Per Project',
  positioning: 'calling-card',
  note: 'Round one, concept 4. No shared template — every project page looks like the world it serves, and a cross-document view transition morphs the plate you tapped into the page it becomes, so a printed menu and a black console still feel like one site. Zero JavaScript: the interaction is a plain <a> and a CSS at-rule.',
}

export default function ArtDirectionPerProject() {
  const project = useRouterState({
    select: (state) => (state.location.search as Record<string, unknown>)['p'],
  })
  const world = typeof project === 'string' ? findWorld(project) : undefined

  return (
    <>
      <TransitionStyles />
      {world === undefined ? <FrontDoor /> : <World slug={world.slug} />}
    </>
  )
}

function World({ slug }: Readonly<{ slug: string }>) {
  const world = findWorld(slug)

  if (world === undefined) {
    return <FrontDoor />
  }

  if (world.slug === 'tabley') {
    return <TableyWorld world={world} />
  }

  if (world.slug === 'matrix') {
    return <MatrixWorld world={world} />
  }

  return <StubWorld world={world} />
}

/**
 * The label wall.
 *
 * The front door is the one surface that is deliberately *not* art directed:
 * black on white, one column, no display type stunt. It has to be, because it is
 * the only page where all five worlds sit next to each other — anything with a
 * voice of its own here would be a sixth world competing with the five it is
 * meant to introduce.
 *
 * There is no line telling you what to do with the plates. An instruction is an
 * S3 failure, and a plate that has to be explained is not a plate.
 */
function FrontDoor() {
  return (
    <div className='flex min-h-dvh flex-col bg-white font-sans text-neutral-900 antialiased [&_[data-proto-chrome]]:opacity-20'>
      <SiteHeader home />

      <main className='mx-auto w-full max-w-5xl grow px-5 pt-12 pb-20'>
        <h1 className='max-w-[34ch] text-2xl leading-snug font-normal text-balance text-neutral-950 sm:text-[1.75rem]'>
          Liam Funk started programming at eleven for an unglamorous reason: he was bad at the computer games he wanted
          to be good at, so he learned to write hacks for them instead.
        </h1>

        <div className='mt-6 max-w-prose space-y-4 text-[0.975rem] leading-relaxed text-neutral-700'>
          <p>
            He has been writing software ever since — professionally since 2022. He works out of Hamburg and runs Rock
            Science, a registered one-person product studio.
          </p>
          <p>
            He is available for building web applications end-to-end, and for agentic engineering consulting. tabley is
            the proof of the first; matrix, smith and project-matrix are the proof of the second.
          </p>
        </div>

        <h2
          id='work'
          className='mt-12 scroll-mt-16 text-sm font-medium text-neutral-500'
        >
          Work
        </h2>

        <ul className='mt-4 space-y-3'>
          {WORLDS.map((world) => (
            <li key={world.slug}>
              <WorldPlate
                world={world}
                size='plate'
              />
            </li>
          ))}
        </ul>

        <p className='mt-8 max-w-prose text-xs leading-relaxed text-neutral-400'>
          Prototype note, not site copy: round one builds one case study — tabley — plus matrix as a second world, so
          the transition can be judged between two pages that look nothing alike. The remaining three plates open onto
          their real art direction and an empty body.
        </p>
      </main>

      <SiteColophon />
    </div>
  )
}
