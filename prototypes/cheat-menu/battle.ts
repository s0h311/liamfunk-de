import type { CheatId } from './cheats'

/**
 * The fight is a pure function of the turn count and the active cheats, which is
 * why it can live in the URL. No state on the server, none in the client, none
 * in a cookie: `?turn=4` *is* the save file, so the same URL renders the same
 * fight for the crawler, for the phone, and for the browser with scripting off.
 */
export const PLAYER_MAX_HP = 20
const BOSS_START_HP = 9_999
const BOSS_REGEN = 12

export type LogLine = {
  turn: number
  text: string
  tone: 'you' | 'boss' | 'end'
}

export type Battle = {
  turn: number
  bossHp: number
  playerHp: number
  log: readonly LogLine[]
  outcome: 'fighting' | 'defeat' | 'victory'
}

/** Deterministic, so a turn always resolves the same way at the same URL. */
function noise(seed: number): number {
  let x = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b)
  x ^= x >>> 13
  x = Math.imul(x, 0xc2b2ae35)
  x ^= x >>> 16

  return (x >>> 0) / 0x1_0000_0000
}

export function fight(turns: number, cheats: ReadonlySet<CheatId>): Battle {
  const log: LogLine[] = []
  let bossHp = BOSS_START_HP
  let playerHp = PLAYER_MAX_HP
  let outcome: Battle['outcome'] = 'fighting'
  let turn = 0

  while (turn < turns && outcome === 'fighting') {
    turn += 1

    const damage = cheats.has('onehit') ? bossHp : 1 + Math.floor(noise(turn) * 2)
    bossHp -= damage
    log.push({
      turn,
      text: cheats.has('onehit')
        ? `You hit for ${damage.toLocaleString('en-US')}.`
        : `You hit for ${damage}. It does not appear to notice.`,
      tone: 'you',
    })

    if (bossHp <= 0) {
      bossHp = 0
      outcome = 'victory'
      break
    }

    /* The regeneration is the point. You take one or two off a five-figure number
       and it puts twelve back, so the bar you are grinding at goes *up* while you
       play honestly. Nothing has to tell you the fight is unwinnable. */
    bossHp += BOSS_REGEN
    log.push({ turn, text: `THE GAME YOU ARE BAD AT regenerates ${BOSS_REGEN}.`, tone: 'boss' })

    const hit = cheats.has('godmode') ? 0 : 5 + Math.floor(noise(turn * 7 + 1) * 5)
    playerHp = Math.max(0, playerHp - hit)
    log.push({
      turn,
      text: cheats.has('godmode') ? 'It hits you for 0. GOD MODE holds.' : `It hits you for ${hit}.`,
      tone: 'boss',
    })

    if (playerHp === 0) {
      outcome = 'defeat'
      log.push({ turn, text: 'You are eleven and you have lost again.', tone: 'end' })
    }
  }

  return { turn, bossHp, playerHp, log, outcome }
}
