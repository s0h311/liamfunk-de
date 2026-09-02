/**
 * Evidence for the hard-screen protocol (docs/hard-screens.md), for
 * https://github.com/s0h311/liamfunk-de/issues/18
 *
 *   PROTO_BASE=http://localhost:3001 node prototypes/art-direction/probe.mjs
 *
 * Needs Playwright's Chromium and its system libraries. This sandbox has the
 * browser but not the libraries and cannot install them, so they are fetched with
 * `apt-get download`, unpacked with `dpkg -x`, and every directory holding a `.so`
 * is put on LD_LIBRARY_PATH — the same workaround the spike used (#12).
 */
import { chromium } from 'playwright'

const BASE = process.env['PROTO_BASE'] ?? 'http://localhost:3000'
const FRONT = `${BASE}/proto/art-direction`
const TABLEY = `${FRONT}?p=tabley`
const PHONE = { width: 390, height: 844 }

const out = (label, value) => console.log(`\n### ${label}\n${JSON.stringify(value, null, 2)}`)

const browser = await chromium.launch()

/* ---------------------------------------------------------------- S1, no JS */

{
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: PHONE })
  const page = await context.newPage()
  await page.goto(FRONT, { waitUntil: 'load' })

  const readable = await page.evaluate(() => {
    const visible = (selector) => {
      const element = document.querySelector(selector)
      if (element === null) return null
      const box = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return {
        text: element.textContent?.trim().slice(0, 60),
        w: Math.round(box.width),
        h: Math.round(box.height),
        opacity: style.opacity,
        visibility: style.visibility,
      }
    }
    return {
      h1: visible('h1'),
      email: visible('a[href^="mailto:"]'),
      firstPlate: visible('a[href*="p=tabley"]'),
      buttons: document.querySelectorAll('button').length,
      anchors: document.querySelectorAll('a[href]').length,
      hashLinks: [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h.includes('#') && h !== '#work' && !h.startsWith('/proto/art-direction#')),
    }
  })
  out('S1 — front door, JavaScript disabled', readable)

  await page.screenshot({ path: 'prototypes/art-direction/shot-frontdoor-nojs.png', fullPage: true })

  await page.click('a[href*="p=tabley"]')
  await page.waitForURL(/p=tabley/)
  const tabley = await page.evaluate(() => ({
    url: location.href,
    banner: document.body.innerText.includes('Online table reservations for German restaurants.'),
    houses: ['Thakali Kitchen', 'Luxor Restaurant & Caffe', 'Bäckerei Allaf', 'Rooster Cafe'].every((n) =>
      document.body.innerText.includes(n),
    ),
    email: document.querySelector('a[href^="mailto:"]') !== null,
    scrollHeight: document.documentElement.scrollHeight,
  }))
  out('S1 — navigated to the tabley case study with JavaScript disabled', tabley)
  await page.screenshot({ path: 'prototypes/art-direction/shot-tabley-nojs.png', fullPage: true })

  await page.goto(`${FRONT}?p=matrix`, { waitUntil: 'load' })
  await page.screenshot({ path: 'prototypes/art-direction/shot-matrix-nojs.png', fullPage: true })

  await context.close()
}

/* ----------------------------------------------- S3, count and first viewport */

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
        text: element.textContent?.trim(),
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
        inFirstViewport: r.top >= 0 && r.bottom <= innerHeight,
      }
    }
    return {
      viewport: { w: innerWidth, h: innerHeight },
      email: box('header a[href^="mailto:"]'),
      work: box('header a[href="#work"]'),
      firstPlate: box('a[href*="p=tabley"]'),
      scrollY: scrollY,
    }
  })
  out('S3 — affordances at cold load, 390x844', affordances)

  const stickyAfterScroll = await page.evaluate(async () => {
    scrollTo(0, 1600)
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const r = document.querySelector('header a[href^="mailto:"]').getBoundingClientRect()
    return { scrollY, emailTop: Math.round(r.top), stillOnScreen: r.top >= 0 && r.bottom <= innerHeight }
  })
  out('S3 — the header is sticky, so the email never leaves the viewport', stickyAfterScroll)

  const tapTargets = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')]
      .map((a) => ({
        text: a.textContent?.trim().slice(0, 34),
        h: Math.round(a.getBoundingClientRect().height),
        w: Math.round(a.getBoundingClientRect().width),
      }))
      .filter((t) => t.h < 44 || t.w < 44),
  )
  out('S3/S2 — anchors under 44px in either dimension (Liam re-checks on the phone)', tapTargets)

  await context.close()
}

/* ------------------------------------------------- unique view-transition names */

/**
 * A duplicate `view-transition-name` skips the whole transition rather than just
 * that element, with no console warning, so it is checked rather than assumed.
 */
{
  const context = await browser.newContext({ viewport: PHONE })
  const page = await context.newPage()
  const duplicates = {}
  for (const url of [FRONT, TABLEY, `${FRONT}?p=matrix`, `${FRONT}?p=smith`]) {
    await page.goto(url, { waitUntil: 'load' })
    duplicates[url.replace(BASE, '')] = await page.evaluate(() => {
      const seen = new Map()
      for (const element of document.querySelectorAll('*')) {
        const name = getComputedStyle(element).viewTransitionName
        if (name && name !== 'none') seen.set(name, (seen.get(name) ?? 0) + 1)
      }
      return { names: [...seen.keys()].toSorted((a, b) => a.localeCompare(b)), duplicated: [...seen].filter(([, n]) => n > 1).map(([name]) => name) }
    })
  }
  out('Signature interaction — view-transition-name uniqueness per document', duplicates)
  await context.close()
}

/* ------------------------------------- the signature interaction, front → tabley */

const recordTransitions = async (context) => {
  await context.addInitScript(() => {
    const push = (entry) => {
      const log = JSON.parse(sessionStorage.getItem('vt') ?? '[]')
      log.push(entry)
      sessionStorage.setItem('vt', JSON.stringify(log))
    }
    addEventListener('pageswap', (event) =>
      push({
        event: 'pageswap',
        from: location.pathname + location.search,
        viewTransition: event.viewTransition !== null && event.viewTransition !== undefined,
      }),
    )
    addEventListener('pagereveal', (event) => {
      push({
        event: 'pagereveal',
        at: location.pathname + location.search,
        viewTransition: event.viewTransition !== null && event.viewTransition !== undefined,
      })
      if (event.viewTransition) {
        void event.viewTransition.ready.then(() => {
          push({
            event: 'animations',
            pseudos: [
              ...new Set(
                document
                  .getAnimations()
                  .map((a) => a.effect?.pseudoElement)
                  .filter(Boolean),
              ),
            ].toSorted((a, b) => a.localeCompare(b)),
          })
        })
      }
    })
  })
}

for (const reducedMotion of ['no-preference', 'reduce']) {
  const context = await browser.newContext({ viewport: PHONE, reducedMotion })
  await recordTransitions(context)
  const page = await context.newPage()
  await page.goto(FRONT, { waitUntil: 'load' })
  await page.evaluate(() => sessionStorage.setItem('vt', '[]'))
  await page.click('a[href*="p=tabley"]')
  await page.waitForURL(/p=tabley/)
  await page.waitForTimeout(900)
  const log = await page.evaluate(() => JSON.parse(sessionStorage.getItem('vt') ?? '[]'))
  out(`Signature interaction — prefers-reduced-motion: ${reducedMotion}`, log)
  await context.close()
}

/* --------------------------------------------- the same jump, but world to world */

{
  const context = await browser.newContext({ viewport: PHONE })
  await recordTransitions(context)
  const page = await context.newPage()
  await page.goto(TABLEY, { waitUntil: 'load' })
  await page.evaluate(() => sessionStorage.setItem('vt', '[]'))
  await page.click('a[href*="p=matrix"]')
  await page.waitForURL(/p=matrix/)
  await page.waitForTimeout(900)
  out(
    'Signature interaction — printed menu to black console',
    await page.evaluate(() => JSON.parse(sessionStorage.getItem('vt') ?? '[]')),
  )
  await context.close()
}

/* --------------------------------------------------------- desktop screenshots */

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  for (const [name, url] of [
    ['frontdoor', FRONT],
    ['tabley', TABLEY],
    ['matrix', `${FRONT}?p=matrix`],
    ['smith', `${FRONT}?p=smith`],
  ]) {
    await page.goto(url, { waitUntil: 'load' })
    await page.screenshot({ path: `prototypes/art-direction/shot-${name}.png`, fullPage: true })
  }
  await context.close()
}

await browser.close()
