/**
 * Evidence for the hard-screen protocol (docs/hard-screens.md), for
 * https://github.com/s0h311/liamfunk-de/issues/19
 *
 *   pnpm dev
 *   PROTO_BASE=http://localhost:3000 node prototypes/visitor-artifact/probe.mjs
 *
 * It runs the S1 no-JS pass in a real browser with scripting off — including the
 * signature interaction itself, since a tap that only works with JavaScript is
 * this concept's fatal failure — counts the S3 affordances at 390x844, and checks
 * that the record renders identically on the server and after hydration, which is
 * the one way a fixture-backed accumulation can quietly stop being server-rendered.
 *
 * Needs Playwright, which this repo has only as a transitive dependency of
 * `@vitest/browser-playwright`:
 *
 *   ln -s .pnpm/playwright@1.60.0/node_modules/playwright node_modules/playwright
 *
 * and its system libraries, which this sandbox lacks and cannot install as root:
 * `apt-get download` the libraries `ldd chrome-linux/headless_shell` names, `dpkg -x`
 * them into a directory, and put every directory holding a `.so` on LD_LIBRARY_PATH.
 */
import { chromium } from 'playwright'

const BASE = process.env['PROTO_BASE'] ?? 'http://localhost:3000'
const FRONT = `${BASE}/proto/visitor-artifact`
const PHONE = { width: 390, height: 844 }
const SHOTS = 'prototypes/visitor-artifact'

const out = (label, value) => console.log(`\n### ${label}\n${JSON.stringify(value, null, 2)}`)

const browser = await chromium.launch()

/* ------------------------------------------------- S1, the whole page, no JS */

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
        text: element.textContent?.trim().slice(0, 64),
        w: Math.round(box.width),
        h: Math.round(box.height),
        opacity: style.opacity,
        visibility: style.visibility,
      }
    }
    return {
      h1: visible('h1'),
      email: visible('header a[href^="mailto:"]'),
      reading: visible('#record p'),
      recordLines: document.querySelectorAll('#record ol > li').length,
      firstLine: document.querySelector('#record ol > li')?.innerText.replace(/\s+/g, ' '),
      lastLineOpacity: getComputedStyle(document.querySelector('#record ol > li:last-child')).opacity,
      traceChoices: [...document.querySelectorAll('a[href*="trace="]')].map((a) => a.textContent?.trim()),
      buttons: document.querySelectorAll('button').length,
      anchors: document.querySelectorAll('a[href]').length,
      hashLinks: [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((href) => href.includes('#') && href !== '#work'),
    }
  })
  out('S1 — front door with JavaScript disabled', readable)
  await page.screenshot({ path: `${SHOTS}/shot-frontdoor-nojs.png`, fullPage: true })

  /* The signature interaction, with scripting off. If this row does not change,
     the concept is dead on S1 and no amount of polish saves it. */
  await page.click('a[href*="trace=hiring"]')
  await page.waitForURL(/trace=hiring/)
  const traced = await page.evaluate(() => ({
    url: location.search,
    yourLine: document.querySelector('#record ol > li')?.innerText.replace(/\s+/g, ' '),
    reading: document.querySelector('#record p')?.textContent?.slice(0, 96),
    confirmation: document.querySelector('#record + *, #record p + *') !== null,
    erasure: [...document.querySelectorAll('a')].some((a) => a.textContent?.includes('Take my line back')),
    traceChoicesLeft: document.querySelectorAll('a[href*="trace="]').length,
  }))
  out('S1 — the signature interaction ran with JavaScript disabled', traced)
  await page.screenshot({ path: `${SHOTS}/shot-traced-nojs.png`, fullPage: true })

  /* And it survives a cross-document navigation, which is what a session cookie
     would buy in the real build. */
  await page.click('a[href*="p=tabley"]')
  await page.waitForURL(/p=tabley/)
  const project = await page.evaluate(() => ({
    url: location.search,
    caseStudy: document.body.innerText.includes('online table reservations for German restaurants'),
    houses: ['Thakali Kitchen', 'Luxor Restaurant & Caffe', 'Bäckerei Allaf', 'Rooster Cafe'].every((name) =>
      document.body.innerText.includes(name),
    ),
    scopedReading: document.querySelector('#record p')?.textContent?.slice(0, 96),
    /* Scoped to this page, so a trace left on the front door is deliberately not here. */
    newestTraceHere: document.querySelector('#record ol > li')?.innerText.replace(/\s+/g, ' '),
    email: document.querySelector('header a[href^="mailto:"]') !== null,
  }))
  out('S1 — tabley, reached and read with JavaScript disabled, trace carried', project)
  await page.screenshot({ path: `${SHOTS}/shot-tabley-nojs.png`, fullPage: true })

  await page.goto(`${FRONT}?record=empty`, { waitUntil: 'load' })
  await page.screenshot({ path: `${SHOTS}/shot-empty-nojs.png`, fullPage: true })

  await context.close()
}

/* ---------------------------------------- S3, interaction count and viewport */

{
  const context = await browser.newContext({ viewport: PHONE })
  const page = await context.newPage()
  await page.goto(FRONT, { waitUntil: 'load' })

  const affordances = await page.evaluate(() => {
    const box = (selector) => {
      const element = document.querySelector(selector)
      if (element === null) return null
      const rect = element.getBoundingClientRect()
      return {
        text: element.textContent?.trim(),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
        inFirstViewport: rect.top >= 0 && rect.bottom <= innerHeight,
      }
    }
    return {
      viewport: { w: innerWidth, h: innerHeight },
      email: box('header a[href^="mailto:"]'),
      work: box('header a[href="#work"]'),
      scrollY,
    }
  })
  out('S3 — affordances at cold load, 390x844', affordances)

  const sticky = await page.evaluate(async () => {
    scrollTo(0, 2400)
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    const rect = document.querySelector('header a[href^="mailto:"]').getBoundingClientRect()
    return { scrollY, emailTop: Math.round(rect.top), stillOnScreen: rect.top >= 0 && rect.bottom <= innerHeight }
  })
  out('S3 — the header is sticky, so the email survives the length of the record', sticky)

  const small = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')]
      .map((a) => ({
        text: a.textContent?.trim().slice(0, 40),
        w: Math.round(a.getBoundingClientRect().width),
        h: Math.round(a.getBoundingClientRect().height),
      }))
      .filter((target) => target.h < 44 || target.w < 44),
  )
  out('S2/S3 — anchors under 44px in either dimension (Liam re-checks on the phone)', small)

  await context.close()
}

/* ------------------------------------------- the record survives hydration */

/**
 * The concept's quiet failure mode: a server-rendered accumulation that the
 * client re-renders differently, so the markup a crawler reads is not the page a
 * human sees. Compared line for line, and any hydration warning is captured.
 */
{
  const context = await browser.newContext({ viewport: PHONE })
  const page = await context.newPage()
  const problems = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.text().toLowerCase().includes('hydrat')) {
      problems.push(message.text().slice(0, 200))
    }
  })
  page.on('pageerror', (error) => problems.push(`pageerror: ${String(error).slice(0, 200)}`))

  const served = await page.request.get(`${FRONT}?trace=code`)
  const html = await served.text()
  /* Scoped to the record's own list: the page has other `<li>`s (the trace choices,
     the work list, the prototype controls) and comparing all of them compares noise. */
  const servedRecord = /<ol[^>]*>.*?<\/ol>/s.exec(html)?.[0] ?? ''
  /* The served markup carries entities (`wouldn&#x27;t`) where `innerText` carries
     the character, and that difference is the encoding, not the render. */
  const decode = (text) =>
    text
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
  const servedLines = [...servedRecord.matchAll(/<li[^>]*>(?:(?!<\/li>).)*<\/li>/gs)].map((match) =>
    decode(match[0].replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ')
      .trim(),
  )

  await page.goto(`${FRONT}?trace=code`, { waitUntil: 'networkidle' })
  const hydratedLines = await page.evaluate(() =>
    [...document.querySelectorAll('#record ol > li')].map((li) => li.innerText.replace(/\s+/g, ' ').trim()),
  )

  out('S1 — server markup vs. the hydrated DOM', {
    servedLineCount: servedLines.length,
    hydratedLineCount: hydratedLines.length,
    /* Whitespace-insensitive: `innerText` and stripped markup disagree about the
       space around an em dash, which is not a hydration difference. */
    identical:
      servedLines.length === hydratedLines.length &&
      servedLines.every((line, index) => line.replace(/\s/g, '') === hydratedLines[index]?.replace(/\s/g, '')),
    firstServed: servedLines[0],
    firstHydrated: hydratedLines[0],
    consoleProblems: problems,
  })

  await context.close()
}

/* ------------------------------------------------------------- screenshots */

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  for (const [name, url] of [
    ['frontdoor', FRONT],
    ['traced', `${FRONT}?trace=hiring`],
    ['tabley', `${FRONT}?p=tabley&trace=hiring`],
    ['empty', `${FRONT}?record=empty`],
    ['thin', `${FRONT}?record=thin`],
  ]) {
    await page.goto(url, { waitUntil: 'load' })
    await page.screenshot({ path: `${SHOTS}/shot-${name}.png`, fullPage: true })
  }
  await context.close()
}

await browser.close()
