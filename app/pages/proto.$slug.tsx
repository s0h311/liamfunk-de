import { Component, type ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { findPrototype, prototypes } from '../../prototypes/registry'

export const Route = createFileRoute('/proto/$slug')({
  head: ({ params }) => ({
    meta: [
      { title: `${findPrototype(params.slug)?.title ?? params.slug} — prototype` },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: PrototypePage,
})

function PrototypePage() {
  const { slug } = Route.useParams()
  const prototype = findPrototype(slug)

  if (prototype === undefined) {
    return <UnknownPrototype slug={slug} />
  }

  return (
    <>
      <SketchBoundary key={slug}>
        <prototype.Sketch />
      </SketchBoundary>
      <BackToIndex />
    </>
  )
}

/**
 * The only chrome the harness imposes on a sketch. A sketch that needs the corner
 * can hide it with `[data-proto-chrome] { display: none }`.
 */
function BackToIndex() {
  return (
    <Link
      to='/proto'
      data-proto-chrome=''
      className='fixed bottom-3 left-3 z-[9999] rounded-full bg-neutral-900/70 px-3 py-1.5 text-xs text-white opacity-40 backdrop-blur transition-opacity hover:opacity-100 focus-visible:opacity-100'
    >
      ← prototypes
    </Link>
  )
}

function UnknownPrototype({ slug }: Readonly<{ slug: string }>) {
  return (
    <main className='mx-auto max-w-3xl px-6 py-12 text-neutral-900'>
      <h1 className='text-xl font-semibold'>
        No prototype called <code>{slug}</code>
      </h1>
      <p className='mt-2 text-sm text-neutral-600'>
        {prototypes.length === 0
          ? 'There are no prototypes yet.'
          : `Try one of: ${prototypes.map((prototype) => prototype.slug).join(', ')}.`}
      </p>
      <Link
        to='/proto'
        className='mt-4 inline-block text-sm underline'
      >
        Back to the index
      </Link>
    </main>
  )
}

/**
 * One broken sketch shouldn't blank the screen mid-comparison.
 */
class SketchBoundary extends Component<Readonly<{ children: ReactNode }>, { error: Error | null }> {
  override state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  override render() {
    const { error } = this.state

    if (error !== null) {
      return (
        <main className='mx-auto max-w-3xl px-6 py-12 text-neutral-900'>
          <h1 className='text-xl font-semibold'>This sketch threw.</h1>
          <pre className='mt-4 overflow-x-auto rounded bg-neutral-100 p-4 text-xs'>{error.stack ?? error.message}</pre>
        </main>
      )
    }

    return this.props.children
  }
}
