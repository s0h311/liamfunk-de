/**
 * Evidence for the hard-screen protocol (docs/hard-screens.md), for
 * https://github.com/s0h311/liamfunk-de/issues/20
 *
 *   pnpm dev
 *   PROTO_BASE=http://localhost:3000 node prototypes/cheat-menu/probe.mjs
 *
 * It plays the signature interaction with JavaScript switched off — takes a
 * turn, dies, then flips a cheat and watches the site rewrite itself — counts
 * the S3 affordances at 390x844 without touching the game, checks that the
 * server markup matches the hydrated DOM, and confirms there is no motion to
 * reduce. Screenshots land next to this file.
 *
 * Needs Playwright, which this repo has only as a transitive dependency of
 * `@vitest/browser-playwright`:
 *
 *   ln -s .pnpm/playwright@1.60.0/node_modules/playwright node_modules/playwright
 *
 * and its system libraries, which this sandbox lacks and cannot install as root.
 * Same workaround as the spike (#12) and Art Direction Per Project (#18):
 * `apt-get download` the libraries `ldd` names missing, `dpkg -x` them into a
 * directory, and put every directory holding a `.so` on LD_LIBRARY_PATH.
 */
import { chromium } from 'playwright'

const BASE = process.env['PROTO_BASE'] ?? 'http://localhost:3000'
const FRONT = `${BASE}/proto/cheat-menu`
const PHONE = { width: 390, height: 844 }
const DIR = 'prototypes/cheat-menu'

const out = (label, value) => console.log(`\n### ${label}\n${JSON.stringify(value, null, 2)}`)

const browser = await chromium.launch()

/* ------------------------------------------------ S1 — the no-JS verdict */

/**
 * The fast `curl` check is in the ticket. This is the verdict: a real browser
 * with scripting off, and not only reading the page — *playing* it. If the
 * trainer is a costume over client-side state, it dies here.
 */
{
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: PHONE })
  const page = await context.newPage()
  await page.goto(FRONT, { waitUntil: 'load' })

  const readable = await page.evaluate(() => {
    const seen = (selector) => {
      const element = document.querySelector(selector)
      if (element === null) return null
      const box = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return {
        text: element.textContent?.trim().slice(0, 64),
        w: Math.round(box.width),
        h: Math.round(box.height),
        opacity: style.opacity,
        visibility: style.visibility,
      }
    }
    return {
      h1: seen('h1'),
      email: seen('header a[href^="mailto:"]'),
      firstCheat: seen('aside a[href*="cheats="]'),
      attack: seen('section a[href*="turn="]'),
      buttons: document.querySelectorAll('button').length,
      inputs: document.querySelectorAll('input, textarea, select').length,
      anchors: document.querySelectorAll('a[href]').length,
      hashHrefs: [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((href) => href.includes('#')),
    }
  })
  out('S1 — front door, JavaScript disabled', readable)
  await page.screenshot({ path: `${DIR}/shot-frontdoor-nojs.png`, fullPage: true })

  /* Play the game with no JavaScript: three turns is enough to lose. */
  const turns = []
  for (let i = 0; i < 3; i += 1) {
    await page.click('section a[href*="turn="]')
    await page.waitForLoadState('load')
    turns.push(
      await page.evaluate(() => ({
        url: location.search,
        bossHp: document.body.innerText.match(/HP ([\d,]+) · regenerates/)?.[1] ?? null,
        yourHp: document.body.innerText.match(/HP (\d+) \/ 20/)?.[1] ?? null,
        lastLog: [...document.querySelectorAll('ol li')].at(-1)?.textContent?.trim() ?? null,
      })),
    )
  }
  out('S1 — three turns taken with JavaScript disabled', turns)
  await page.screenshot({ path: `${DIR}/shot-gameover-nojs.png`, fullPage: true })

  /* Now the signature interaction itself: flip a cheat and watch the site change. */
  await page.click('a[href*="cheats=unlockall"], a[href*=",unlockall"]')
  await page.waitForLoadState('load')
  const unlocked = await page.evaluate(() => ({
    url: location.search,
    blogRoomOpened: document.body.innerText.includes('Nothing written yet.'),
    theLockSaysWhy: document.body.innerText.includes('The lock was not hiding a draft'),
    bookEntry: document.body.innerText.includes('A Philosophy of Software Design'),
  }))
  out('S1 — UNLOCK ALL, clicked with JavaScript disabled', unlocked)

  await page.click('a[href*="wallhack"]')
  await page.waitForLoadState('load')
  const wallhack = await page.evaluate(() => ({
    url: location.search,
    marks: [...document.querySelectorAll('span')]
      .map((s) => s.textContent?.trim())
      .filter((t) => t?.startsWith('missing:')),
  }))
  out('S1 — WALLHACK, clicked with JavaScript disabled', wallhack)
  await page.screenshot({ path: `${DIR}/shot-cheated-nojs.png`, fullPage: true })

  /* And the cross-document jump to the one real case study. */
  await page.goto(FRONT, { waitUntil: 'load' })
  await page.click('a[href*="p=tabley"]')
  await page.waitForURL(/p=tabley/)
  const tabley = await page.evaluate(() => ({
    url: location.search,
    lede: document.body.innerText.includes('Online table reservations for German restaurants.'),
    shops: ['Thakali Kitchen', 'Luxor Restaurant & Caffe', 'Bäckerei Allaf', 'Rooster Cafe'].every((shop) =>
      document.body.innerText.includes(shop),
    ),
    trainerStillThere: document.querySelector('aside a[href*="cheats="]') !== null,
    email: document.querySelector('a[href^="mailto:"]') !== null,
  }))
  out('S1 — the tabley case study, reached with JavaScript disabled', tabley)
  await page.screenshot({ path: `${DIR}/shot-tabley-nojs.png`, fullPage: true })

  await context.close()
}

/* ------------------------------------- S3 — count and first viewport, cold */

{
  const context = await browser.newContext({ viewport: PHONE })
  const page = await context.newPage()
  await page.goto(FRONT, { waitUntil: 'load' })

  const affordances = await page.evaluate(() => {
    const box = (selector) => {
      const element = document.querySelector(selector)
      if (element === null) return null
      const r = element.getBoundingClientRect()
      return {
        text: element.textContent?.trim().slice(0, 40),
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
        inFirstViewport: r.top >= 0 && r.bottom <= innerHeight,
      }
    }
    return {
      viewport: { w: innerWidth, h: innerHeight },
      scrollY,
      email: box('header a[href^="mailto:"]'),
      work: box('header a[href="#work"]'),
      /* The trainer is not needed for either count — but if it is below the fold
         the concept is discoverable only by scrolling, which is its own problem. */
      cheatMenuHeading: box('#trainer-title'),
      firstCheatRow: box('aside li a'),
    }
  })
  out('S3 — affordances at cold load, 390x844, nothing played', affordances)

  const sticky = await page.evaluate(async () => {
    scrollTo(0, 2400)
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    const r = document.querySelector('header a[href^="mailto:"]').getBoundingClientRect()
    return { scrollY, emailTop: Math.round(r.top), stillOnScreen: r.top >= 0 && r.bottom <= innerHeight }
  })
  out('S3 — the masthead is sticky, so the email never leaves the viewport', sticky)

  const small = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')]
      .map((a) => {
        const r = a.getBoundingClientRect()
        return { text: a.textContent?.trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }
      })
      .filter((t) => t.h < 44),
  )
  out('S2/S3 — anchors under 44px tall (Liam re-checks on the phone)', small)

  await context.close()
}

/* ------------------------- hydration parity and the absence of motion */

{
  const context = await browser.newContext({ viewport: PHONE })
  const page = await context.newPage()

  const served = await (await fetch(`${FRONT}?cheats=wallhack,unlockall&turn=3`)).text()
  await page.goto(`${FRONT}?cheats=wallhack,unlockall&turn=3`, { waitUntil: 'networkidle' })
  const hydrated = await page.evaluate(() => document.querySelector('main').outerHTML)
  const servedMain = served.slice(served.indexOf('<main'), served.indexOf('</main>') + 7)
  out('Hydration — server markup vs hydrated DOM, cheats on', {
    servedBytes: servedMain.length,
    hydratedBytes: hydrated.length,
    identical: servedMain === hydrated,
  })

  const motion = await page.evaluate(() => ({
    runningAnimations: document.getAnimations().length,
    elementsWithTransition: [...document.querySelectorAll('*')].filter((element) => {
      const property = getComputedStyle(element).transitionProperty
      return property !== 'none' && property !== 'all' && getComputedStyle(element).transitionDuration !== '0s'
    }).length,
    viewTransitionRule: [...document.styleSheets].some((sheet) => {
      try {
        return [...sheet.cssRules].some((rule) => rule.cssText.includes('view-transition'))
      } catch {
        return false
      }
    }),
  }))
  out('Reduced motion — what there is to reduce', motion)

  await context.close()
}

/* ------------------------------------------------------ desktop screenshots */

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  for (const [name, query] of [
    ['frontdoor', ''],
    ['gameover', '?turn=4'],
    ['cheated', '?cheats=noclip,wallhack,unlockall&turn=4'],
    ['hitboxes', '?cheats=hitboxes'],
    ['tabley', '?p=tabley'],
  ]) {
    await page.goto(`${FRONT}${query}`, { waitUntil: 'load' })
    await page.screenshot({ path: `${DIR}/shot-${name}.png`, fullPage: true })
  }
  await context.close()
}

await browser.close()
