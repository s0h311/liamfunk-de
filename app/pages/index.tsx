import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main>
      <h1>H1</h1>

      <h2>The Beginnings</h2>
      <h2>Work</h2>
      <h2>Travel</h2>
      <h2>Books</h2>
      <h2>Music</h2>
    </main>
  )
}
