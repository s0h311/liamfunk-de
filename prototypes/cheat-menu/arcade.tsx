import { PLAYER_MAX_HP, fight } from './battle'
import type { CheatId, Search } from './cheats'
import { StateLink, merge } from './ui'

/**
 * The toy. It is a boss fight you cannot win by playing it: you take one or two
 * off a five-figure number and it puts twelve back, so the bar goes *up* while
 * you are honest. Nothing on screen says "unwinnable" — the arithmetic does.
 *
 * Turn-based on purpose. A real-time game would need JavaScript, a keyboard or a
 * cursor, and would fail every hard screen the map set; a turn that is a link is
 * a game a crawler can play.
 */
export function Arcade({
  turn,
  cheats,
  search,
}: Readonly<{ turn: number; cheats: ReadonlySet<CheatId>; search: Search }>) {
  const battle = fight(turn, cheats)
  const tail = battle.log.slice(-4)

  return (
    <section
      data-hb='section'
      aria-labelledby='fight-title'
      className='flex flex-col border border-neutral-900 bg-[#1b1a2e] text-[#f2efe6]'
    >
      <div className='flex items-baseline justify-between border-b border-white/15 px-4 py-2'>
        <h2
          id='fight-title'
          className='font-mono text-[0.8rem] font-semibold tracking-[0.12em] text-[#ffc857] uppercase'
        >
          The game you are bad at
        </h2>
        <p className='font-mono text-[0.72rem] text-white/45 tabular-nums'>turn {battle.turn}</p>
      </div>

      <div className='flex grow flex-col gap-3 px-4 py-4'>
        <Fighter
          name='THE GAME YOU ARE BAD AT'
          hp={battle.bossHp.toLocaleString('en-US')}
          note='regenerates 12 per turn'
          accent='#ff7a6b'
        />
        <Fighter
          name='LIAM FUNK, AGE 11'
          hp={`${battle.playerHp} / ${PLAYER_MAX_HP}`}
          note={cheats.has('godmode') ? 'GOD MODE active' : 'attack 1–2'}
          accent='#7ad3a0'
        />

        <ol className='min-h-[4.5rem] grow space-y-0.5 border-t border-white/10 pt-3 font-mono text-[0.78rem] leading-snug'>
          {tail.length === 0 ? (
            <li className='text-white/40'>No turns taken. It is waiting.</li>
          ) : (
            tail.map((line, index) => (
              <li
                key={`${line.turn}-${index}`}
                className={
                  line.tone === 'you' ? 'text-[#7ad3a0]' : line.tone === 'boss' ? 'text-white/70' : 'text-[#ff7a6b]'
                }
              >
                {line.text}
              </li>
            ))
          )}
        </ol>

        <div className='flex flex-wrap items-center gap-3 border-t border-white/10 pt-3'>
          {battle.outcome === 'fighting' ? (
            <StateLink
              search={merge(search, { turn: turn + 1 })}
              className='inline-flex h-11 items-center border border-[#ffc857] px-5 font-mono text-[0.82rem] font-semibold tracking-[0.1em] text-[#ffc857] uppercase hover:bg-[#ffc857] hover:text-[#1b1a2e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffc857]'
            >
              Attack
            </StateLink>
          ) : (
            <StateLink
              search={merge(search, { turn: undefined })}
              className='inline-flex h-11 items-center border border-white/40 px-5 font-mono text-[0.82rem] tracking-[0.1em] text-white/80 uppercase hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            >
              Continue?
            </StateLink>
          )}

          {battle.outcome === 'defeat' && (
            <p className='text-[0.85rem] leading-snug text-white/70'>
              <strong className='font-semibold text-[#ff7a6b]'>Game over.</strong> He was bad at the computer games he
              wanted to be good at, so he learned to write hacks for them instead. The cheat menu was never hidden.
            </p>
          )}

          {battle.outcome === 'victory' && (
            <p className='text-[0.85rem] leading-snug text-white/70'>
              <strong className='font-semibold text-[#7ad3a0]'>Victory</strong> in {battle.turn}{' '}
              {battle.turn === 1 ? 'turn' : 'turns'}. You are still bad at the game. That was never the point — writing
              the cheat is the part that turned into a career.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function Fighter({ name, hp, note, accent }: Readonly<{ name: string; hp: string; note: string; accent: string }>) {
  return (
    <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5'>
      <p
        className='font-mono text-[0.8rem] tracking-[0.06em]'
        style={{ color: accent }}
      >
        {name}
      </p>
      <p className='font-mono text-[0.8rem] text-white/80 tabular-nums'>
        HP {hp} <span className='text-white/35'>· {note}</span>
      </p>
    </div>
  )
}
