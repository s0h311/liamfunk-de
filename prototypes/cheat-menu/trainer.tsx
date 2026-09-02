import { CHEATS, toggled, type CheatId, type Search } from './cheats'
import { StateLink, merge } from './ui'

/**
 * The cheat menu.
 *
 * It is open. There is no Konami code, no hidden key sequence, nothing to
 * discover — deliberately, and the refusal is the design decision worth arguing
 * about. A hidden trainer would be the obvious joke and it fails all three hard
 * screens at once: a key sequence is not an `<a href>` (S1), a phone has no
 * keyboard to type it on (S2), and a site whose navigation must be *discovered*
 * is a site that blocked you (S3). So the site hands you the cheats on arrival,
 * which is also funnier, and truer to an eleven-year-old who would rather look
 * up the code than get good.
 */
export function Trainer({
  cheats,
  search,
  compact,
}: Readonly<{ cheats: ReadonlySet<CheatId>; search: Search; compact?: boolean }>) {
  const on = CHEATS.filter((cheat) => cheats.has(cheat.id)).length

  return (
    <aside
      data-hb='aside'
      aria-labelledby='trainer-title'
      className='border border-neutral-400 bg-white'
    >
      <div className='flex items-baseline justify-between border-b border-neutral-300 bg-[#efece6] px-3 py-2'>
        <h2
          id='trainer-title'
          className='font-mono text-[0.8rem] font-semibold tracking-[0.12em] text-neutral-900 uppercase'
        >
          Cheat menu
        </h2>
        <p className='font-mono text-[0.72rem] text-neutral-500 tabular-nums'>{on} / 6 enabled</p>
      </div>

      <ul className='divide-y divide-neutral-200'>
        {CHEATS.map((cheat) => {
          const active = cheats.has(cheat.id)

          return (
            <li key={cheat.id}>
              <StateLink
                search={merge(search, toggled(cheats, cheat.id))}
                label={`${active ? 'Disable' : 'Enable'} ${cheat.name}`}
                className={`flex min-h-11 w-full items-baseline gap-3 px-3 py-2 text-left ${
                  active ? 'bg-[#fff8e0]' : 'bg-white'
                } hover:bg-[#eef1ff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-neutral-900`}
              >
                <span
                  aria-hidden
                  className={`mt-0.5 font-mono text-[0.85rem] ${active ? 'text-[#8a6d00]' : 'text-neutral-400'}`}
                >
                  {active ? '[x]' : '[ ]'}
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='font-mono text-[0.8rem] font-semibold tracking-[0.06em] text-neutral-900'>
                    {cheat.name}
                  </span>
                  <span className='sr-only'>{active ? ' — on. ' : ' — off. '}</span>
                  <span className='block text-[0.82rem] leading-snug text-neutral-600'>{cheat.effect}</span>
                </span>
                <span
                  className={`shrink-0 font-mono text-[0.7rem] tracking-[0.1em] ${
                    active ? 'text-[#8a6d00]' : 'text-neutral-400'
                  }`}
                >
                  {active ? 'ON' : 'OFF'}
                </span>
              </StateLink>
            </li>
          )
        })}
      </ul>

      {compact !== true && (
        <p className='border-t border-neutral-200 px-3 py-2 text-[0.75rem] leading-relaxed text-neutral-500'>
          {on === 6
            ? 'Every cheat on. The site has nothing left to hide, which took six taps and no skill whatsoever. That is the argument.'
            : 'Each of these is a link, and the URL is the save file. Copy it and the person you send it to gets the site in exactly this state.'}
        </p>
      )}
    </aside>
  )
}
