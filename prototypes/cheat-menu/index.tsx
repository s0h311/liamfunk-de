import type { PrototypeMeta } from '../types'
import { readCheats, readTurn } from './cheats'
import { Arcade } from './arcade'
import { Document } from './site'
import { Tabley } from './tabley'
import { Trainer } from './trainer'
import { COLUMN, Colophon, HitboxLegend, HitboxStyles, Masthead, PAGE, useSearch } from './ui'

export const meta: PrototypeMeta = {
  title: 'The Cheat Menu',
  positioning: 'playground',
  note: 'Round one, concept 6. Liam learned to program at eleven by writing hacks for games he was bad at, so the front door is a fight you cannot win honestly and the site ships the trainer. Every cheat is a link and the URL is the save file, so the cheated site is a real server-rendered document.',
}

export default function CheatMenu() {
  const search = useSearch()
  const cheats = readCheats(search)
  const turn = readTurn(search)
  const onTabley = search['p'] === 'tabley'

  return (
    <div
      className={PAGE}
      data-cheats={[...cheats].join(' ')}
    >
      {cheats.has('hitboxes') && <HitboxStyles />}
      <Masthead
        home={!onTabley}
        search={search}
      />

      {onTabley ? (
        <main data-hb='main'>
          <Tabley
            cheats={cheats}
            search={search}
          />
          <div className={`${COLUMN} pb-4`}>
            <div className='max-w-md'>
              <Trainer
                cheats={cheats}
                search={search}
                compact
              />
            </div>
          </div>
        </main>
      ) : (
        <main
          data-hb='main'
          className={`${COLUMN} pt-8 pb-4`}
        >
          {/*
            The origin sentence is the h1 because it is the site's actual opening
            line — and because it makes the game underneath it legible without an
            instruction. "Press ? for help" is an S3 failure; a bio line that
            happens to explain the design is not.
          */}
          <h1 className='max-w-[36ch] text-xl leading-snug font-normal text-balance text-neutral-950 sm:text-2xl lg:text-[1.7rem]'>
            Liam Funk started programming at eleven for an unglamorous reason: he was bad at the computer games he
            wanted to be good at, so he learned to write hacks for them instead.
          </h1>

          <div className='mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:items-stretch'>
            <Arcade
              turn={turn}
              cheats={cheats}
              search={search}
            />
            <Trainer
              cheats={cheats}
              search={search}
            />
          </div>

          {cheats.has('hitboxes') && <HitboxLegend />}

          <Document
            cheats={cheats}
            search={search}
          />

          {cheats.has('noclip') && (
            <section
              data-hb='section'
              className='mt-12 border-t border-neutral-300 pt-8'
            >
              <Tabley
                cheats={cheats}
                search={search}
                inline
              />
            </section>
          )}
        </main>
      )}

      <Colophon />
    </div>
  )
}
