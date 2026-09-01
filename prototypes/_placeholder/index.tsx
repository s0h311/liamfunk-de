import type { PrototypeMeta } from '../types'

export const meta: PrototypeMeta = {
  title: 'Placeholder',
  positioning: 'scratch',
  note: 'Proves the harness renders, on desktop and on a phone. Copy this directory to start a real sketch; delete it once real ones exist.',
}

export default function Placeholder() {
  return (
    <main className='flex min-h-dvh flex-col items-center justify-center gap-4 bg-neutral-950 p-8 text-center text-neutral-100'>
      <h1 className='text-3xl font-semibold tracking-tight'>The harness works.</h1>
      <p className='max-w-prose text-balance text-neutral-400'>
        This text was server-rendered. If you can read it with JavaScript disabled, a prototype built this way can pass
        the SEO/GEO hard screen.
      </p>
      <p className='text-sm text-neutral-500'>
        Viewport: <span className='tabular-nums'>check this on your phone too.</span>
      </p>
    </main>
  )
}
