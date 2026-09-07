import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className='prose dark:prose-invert'>
      <h1>
        I build <i>intuitive</i> applications that understand your business
      </h1>

      <h2>The Beginnings</h2>

      <p>
        I started with programming at age 11 due to an unglamarous reason: I was utterly bad at computer games. So I
        wrote hacks that made me rich in{' '}
        <a
          href='https://en.wikipedia.org/wiki/Dragon_City'
          target='_blank'
        >
          Dragon City
        </a>{' '}
        or enabled me to shoot through walls in{' '}
        <a
          href='https://en.wikipedia.org/wiki/Counter-Strike'
          target='_blank'
        >
          Counter Strike
        </a>
        .
      </p>

      <h2>Work</h2>
      <p>WIP 🚧</p>
      <h2>Thoughts</h2>
      <p>WIP 🚧</p>
      <h2>Travel</h2>
      <p>WIP 🚧</p>
      <h2>Books</h2>
      <p>WIP 🚧</p>
      <h2>Music</h2>
      <p>WIP 🚧</p>
    </main>
  )
}
