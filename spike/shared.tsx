/**
 * Throwaway spike for https://github.com/s0h311/liamfunk-de/issues/12
 * Delete the whole `spike/` directory and `app/pages/spike.*.tsx` when it is answered.
 */
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

/**
 * Opts the *document* into cross-document view transitions. This is the whole
 * question: `navigation: auto` only ever fires on a real cross-document
 * navigation, so if the router intercepts the click, nothing happens here.
 */
export const viewTransitionCss = `
@view-transition { navigation: auto; }
.spike-card { view-transition-name: spike-card; contain: layout; }
.spike-title { view-transition-name: spike-title; }
`

export function SpikePage({
  page,
  other,
  note,
  children,
}: Readonly<{ page: string; other: string; note: string; children?: ReactNode }>) {
  return (
    <main style={{ fontFamily: 'ui-monospace, monospace', padding: '2rem', maxWidth: '40rem' }}>
      
      <h1 className='spike-title'>Spike page {page}</h1>
      <p>{note}</p>
      <div
        className='spike-card'
        style={{
          border: '2px solid currentColor',
          padding: '1rem',
          margin: '1rem 0',
          background: page === 'A' ? '#fdf3d0' : '#d0e8fd',
        }}
      >
        <p data-testid='card-body'>Shared element on page {page}.</p>
      </div>
      {children}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        <a data-testid='plain-anchor' href={`/spike/${other.toLowerCase()}`}>
          Plain &lt;a&gt; to page {other} (cross-document candidate)
        </a>
        <a data-testid='plain-anchor-query' href={`/spike/${other.toLowerCase()}?pane=work&open=tabley`}>
          Plain &lt;a&gt; to page {other} with ?pane=work&amp;open=tabley
        </a>
        <a data-testid='hash-anchor' href={`/spike/${other.toLowerCase()}#pane=work`}>
          Plain &lt;a&gt; to page {other} with #pane=work (the hash trap)
        </a>
        <Link data-testid='router-link' to={other === 'B' ? '/spike/b' : '/spike/a'} search={{}}>
          TanStack &lt;Link&gt; to page {other} (single-document candidate)
        </Link>
      </nav>
    </main>
  )
}
