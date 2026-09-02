import type { ReactNode } from 'react'
import { Pending } from './chrome'
import { Section, WorldPage, WorldPlate } from './world-page'
import { findWorld, type World } from './worlds'

/**
 * matrix's world is an ops console: a readout of a machine that runs while nobody
 * is watching.
 *
 * Deliberately *not* a terminal — no prompt, no caret, no typed command, because
 * "terminal portfolio" is a named anti-target and the moment a page asks you to
 * type at it, it has become one. What is borrowed is the readout: mono, phosphor
 * on black, key over value, thin rules. The page is still read, not operated.
 */
export function MatrixWorld({ world }: Readonly<{ world: World }>) {
  const lineage = findWorld('project-matrix')

  return (
    <WorldPage world={world}>
      <Section
        world={world}
        title='what it does'
      >
        <p>
          Each agent is named Smith, and it works through GitHub issues autonomously, one at a time. It currently runs
          Ralph loops and automated review, with nobody at the keyboard.
        </p>
      </Section>

      <Section
        world={world}
        title='gates'
      >
        <p className='mb-5'>
          Configured per project in <code style={{ color: world.accent }}>.matrix/config.json</code>. The gates are
          deterministic, and they are enforced between agents rather than trusted to them.
        </p>
        <dl>
          <Row
            world={world}
            term='checks.fmt'
          >
            formatting, enforced
          </Row>
          <Row
            world={world}
            term='checks.lint'
          >
            lint, enforced
          </Row>
          <Row
            world={world}
            term='checks.test'
          >
            tests, enforced
          </Row>
        </dl>
      </Section>

      <Section
        world={world}
        title='what it needs from you'
      >
        <dl>
          <Row
            world={world}
            term='GH_TOKEN'
          >
            repository access
          </Row>
          <Row
            world={world}
            term='claude code'
          >
            an active subscription
          </Row>
          <Row
            world={world}
            term='a PRD'
          >
            already broken into issues
          </Row>
        </dl>
      </Section>

      <Section
        world={world}
        title='where the case study goes'
      >
        <p>
          <Pending>The matrix case study</Pending>. Round one builds one — tabley. This page exists to prove the jump: a
          printed menu and a black console, one tap apart, and you never lost the header.
        </p>
        <p className='mt-4'>
          <a
            href='https://github.com/s0h311/matrix'
            style={{ color: world.accent }}
            className='inline-flex h-11 items-center underline decoration-2 underline-offset-4'
          >
            github.com/s0h311/matrix
          </a>
        </p>
      </Section>

      {lineage === undefined ? null : (
        <section className='mt-16'>
          <p
            className='mb-3 text-sm opacity-70'
            style={{ color: world.ink }}
          >
            Lineage — matrix is what runs now; this is the framework it is becoming. Not rivals.
          </p>
          <WorldPlate
            world={lineage}
            size='plate'
          />
        </section>
      )}
    </WorldPage>
  )
}

/** Key over value, ruled. A readout, not a prompt. */
function Row({ world, term, children }: Readonly<{ world: World; term: string; children: ReactNode }>) {
  return (
    <div
      className='flex flex-wrap items-baseline gap-x-6 gap-y-1 py-2.5'
      style={{ borderTop: `1px solid ${world.rule}` }}
    >
      <dt
        className='w-44 shrink-0'
        style={{ color: world.accent }}
      >
        {term}
      </dt>
      <dd className='opacity-85'>{children}</dd>
    </div>
  )
}
