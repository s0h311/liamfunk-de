import { createFileRoute } from '@tanstack/react-router'
import { SpikePage, viewTransitionCss } from '../../spike/shared'

export const Route = createFileRoute('/spike/a')({
  // The @view-transition rule lives in <head>, so it is parsed before the
  // first render opportunity on the incoming document.
  head: () => ({ styles: [{ children: viewTransitionCss }] }),
  // Server-side search parsing: if this shows up in the SSR'd HTML, URL state
  // can live in the query string rather than the client-only hash.
  validateSearch: (search: Record<string, unknown>) => ({
    pane: typeof search['pane'] === 'string' ? search['pane'] : undefined,
    open: typeof search['open'] === 'string' ? search['open'] : undefined,
  }),
  component: PageA,
})

function PageA() {
  const { pane, open } = Route.useSearch()

  return (
    <SpikePage page='A' other='B' note='Route A. Deep-linkable state is read from the query string.'>
      <p data-testid='search-state'>
        pane={String(pane)} open={String(open)}
      </p>
    </SpikePage>
  )
}
