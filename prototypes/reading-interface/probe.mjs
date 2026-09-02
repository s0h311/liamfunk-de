/**
 * Evidence for the hard-screen protocol (docs/hard-screens.md), for
 * https://github.com/s0h311/liamfunk-de/issues/16
 *
 *   pnpm dev
 *   PROTO_BASE=http://localhost:3000 node prototypes/reading-interface/probe.mjs
 *
 * It reads and *operates* the document with JavaScript switched off — opens a
 * transclusion in the prose, opens a note, walks to the case study's own page
 * and back — counts the S3 affordances at 390x844 without opening anything,
 * measures every tap target (this concept's real risk: its links are words),
 * checks the server markup against the hydrated DOM, and confirms there is no
 * motion to reduce. Screenshots land next to this file.
 *
 * Needs Playwright, which this repo has only as a transitive dependency of
 * `@vitest/browser-playwright`:
 *
 *   ln -s .pnpm/playwright@1.60.0/node_modules/playwright node_modules/playwright
 *
 * and its system libraries, which this sandbox lacks and cannot install as root
 * (there is no `sudo`). Same workaround as the spike (#12), Art Direction Per
 * Project (#18) and The Cheat Menu (#20): `apt-get download` the libraries
 * `ldd` names missing, `dpkg -x` them into a directory, and put every directory
 * holding a `.so` on LD_LIBRARY_PATH.
 */
import { chromium } from 'playwright'

const BASE = process.env['PROTO_BASE'] ?? 'http://localhost:3000'
const FRONT = `${BASE}/proto/reading-interface`
const PHONE = { width: 390, height: 844 }
const DIR = 'prototypes/reading-interface'

const out = (label, value) => console.log(`\n### ${label}\n${JSON.stringify(value, null, 2)}`)

const browser = await chromium.launch()

/* ------------------------------------------------ S1 — the no-JS verdict */

/**
 * The `curl` check is in the ticket. This is the verdict: a real browser with
 * scripting off, and not only reading the document — *operating* it. If the
 * transclusion is a costume over client-side state, it dies here.
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
        text: element.textContent?.trim().slice(0, 72),
        w: Math.round(box.width),
        h: Math.round(box.height),
        opacity: style.opacity,
        visibility: style.visibility,
      }
    }
    return {
      h1: seen('h1'),
      email: seen('header a[href^="mailto:"]'),
      work: seen('header a[href$="#work"]'),
      firstTransclusion: seen('article a[href*="open=tabley"]'),
      buttons: document.querySelectorAll('button').length,
      inputs: document.querySelectorAll('input, textarea, select').length,
      anchors: document.querySelectorAll('a[href]').length,
      /* `#t-<id>` is a scroll anchor, not state: the same URL without it renders
         the same document. `#work` is a heading. Neither is a hash state store. */
      fragments: [...new Set([...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((href) => href.includes('#'))
        .map((href) => href.slice(href.indexOf('#'))))],
      /* Nothing is hidden behind a JS-only disclosure: closed transclusions are
         genuinely absent from the document, not present-and-collapsed. */
      caseStudyTextWhileClosed: document.body.innerText.includes('Thakali Kitchen'),
    }
  })
  out('S1 — the document at cold load, JavaScript disabled', readable)
  await page.screenshot({ path: `${DIR}/shot-frontdoor-nojs.png`, fullPage: true })

  /* The signature interaction itself, with no JavaScript: open it where it stands. */
  await page.click('article a[href*="open=tabley"]')
  await page.waitForLoadState('load')
  const opened = await page.evaluate(() => ({
    url: location.search + location.hash,
    caseStudyNowReadable: document.body.innerText.includes('Thakali Kitchen'),
    sentenceResumesAfterIt: document.body.innerText.includes(', is a live restaurant reservation platform'),
    realLinkOffered: document.querySelector('#t-tabley a[href*="p=tabley"]')?.textContent?.trim() ?? null,
    closeOffered: document.querySelector('#t-tabley a[href^="/proto/reading-interface#"]')?.textContent?.trim() ?? null,
    panelIsASiblingOfTheParagraph: document.querySelector('#t-tabley')?.previousElementSibling?.tagName ?? null,
  }))
  out('S1 — a transclusion opened in the prose with JavaScript disabled', opened)
  await page.screenshot({ path: `${DIR}/shot-open-nojs.png`, fullPage: true })

  /* A second one, to prove the state composes rather than replacing itself. */
  await page.click('article a[href*="open=tabley,n1"], article a[href*="n1"]')
  await page.waitForLoadState('load')
  const twoOpen = await page.evaluate(() => ({
    url: location.search,
    noteReadable: document.body.innerText.includes('professionally since 2022'),
    caseStudyStillOpen: document.body.innerText.includes('Thakali Kitchen'),
  }))
  out('S1 — two transclusions open at once, JavaScript disabled', twoOpen)

  /* The transclusion is an enhancement over a real link — so follow the real link. */
  await page.click('#t-tabley a[href*="p=tabley"]')
  await page.waitForURL(/p=tabley/)
  const ownPage = await page.evaluate(() => ({
    url: location.search,
    h1: document.querySelector('h1')?.textContent?.trim() ?? null,
    sameWords: document.body.innerText.includes('Thakali Kitchen'),
    backLink: document.querySelector('a[href*="open=tabley"]')?.getAttribute('href') ?? null,
    email: document.querySelector('header a[href^="mailto:"]') !== null,
  }))
  out('S1 — the case study as its own document, reached with JavaScript disabled', ownPage)
  await page.screenshot({ path: `${DIR}/shot-tabley-nojs.png`, fullPage: true })

  await page.click('a[href*="open=tabley"]')
  await page.waitForLoadState('load')
  const backOpen = await page.evaluate(() => ({
    url: location.search + location.hash,
    reopenedInPlace: document.body.innerText.includes('Thakali Kitchen'),
  }))
  out('S1 — back to the document, with the passage re-opened where it was', backOpen)

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
      work: box('header a[href$="#work"]'),
      documentScrollWidth: document.documentElement.scrollWidth,
      horizontalLeak: document.documentElement.scrollWidth > innerWidth,
    }
  })
  out('S3 — affordances at cold load, 390x844, nothing opened', affordances)

  const sticky = await page.evaluate(async () => {
    scrollTo(0, 2000)
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    const r = document.querySelector('header a[href^="mailto:"]').getBoundingClientRect()
    return { scrollY, emailTop: Math.round(r.top), stillOnScreen: r.top >= 0 && r.bottom <= innerHeight }
  })
  out('S3 — the masthead is sticky, so the email never leaves the viewport', sticky)

  /**
   * The concept's own risk, measured rather than asserted: a reading interface's
   * links are words, and words are not 44px tall.
   */
  const targets = await page.evaluate(() => {
    const all = [...document.querySelectorAll('a[href]')].map((a) => {
      const r = a.getBoundingClientRect()
      return { text: a.textContent?.trim().slice(0, 28), w: Math.round(r.width), h: Math.round(r.height) }
    })
    return {
      total: all.length,
      under44: all.filter((t) => t.h < 44).length,
      under24: all.filter((t) => t.h < 24).length,
      smallest: all.toSorted((a, b) => a.h - b.h).slice(0, 6),
      inlineMarkers: all.filter((t) => t.h >= 24 && t.h < 44).length,
    }
  })
  out('S2/S3 — tap-target heights (Liam re-checks these on the phone)', targets)

  await context.close()
}

/* ------------------------- hydration parity and the absence of motion */

{
  const context = await browser.newContext({ viewport: PHONE })
  const page = await context.newPage()
  const url = `${FRONT}?open=tabley,n2,w-smith`

  const served = await (await fetch(url)).text()
  await page.goto(url, { waitUntil: 'networkidle' })
  const hydrated = await page.evaluate(() => document.querySelector('main').outerHTML)
  const servedMain = served.slice(served.indexOf('<main'), served.indexOf('</main>') + 7)
  out('Hydration — server markup vs hydrated DOM, three passages open', {
    servedBytes: servedMain.length,
    hydratedBytes: hydrated.length,
    identical: servedMain === hydrated,
  })

  /* And the same document with the scroll anchor stripped: the fragment is not state. */
  const main = (html) => html.slice(html.indexOf('<main'), html.indexOf('</main>') + 7)
  const withAnchor = await (await fetch(`${url}#t-tabley`)).text()
  out('The `#t-<id>` fragment is a scroll anchor, not state', {
    /* The dev shell carries a timestamp, so this compares the document itself. */
    sameDocumentWithAndWithoutTheFragment: main(withAnchor) === main(served),
  })

  const motion = await page.evaluate(() => ({
    runningAnimations: document.getAnimations().length,
    elementsWithTransition: [...document.querySelectorAll('*')]
      .filter((element) => {
        const style = getComputedStyle(element)
        return style.transitionProperty !== 'none' && style.transitionDuration !== '0s'
      })
      .map((element) => (element.hasAttribute('data-proto-chrome') ? 'harness chrome, not the sketch' : element.tagName)),
    viewTransitionRule: [...document.styleSheets].some((sheet) => {
      try {
        return [...sheet.cssRules].some((rule) => rule.cssText.includes('view-transition'))
      } catch {
        return false
      }
    }),
  }))
  out('Reduced motion — what there is to reduce', motion)

  /* Scroll preservation is the cost this concept pays per tap. Measure both paths. */
  await page.goto(FRONT, { waitUntil: 'networkidle' })
  /* Wait for hydration: before it lands, the marker is a plain anchor and the
     click is a document navigation, which is the JavaScript-off path measured
     above rather than the one under test here. */
  await page.waitForFunction(() => document.querySelector('article a[href*="open=travel"]')?.href !== undefined)
  await page.waitForTimeout(600)
  const kept = await page.evaluate(async () => {
    const marker = document.querySelector('article a[href*="open=travel"]')
    marker.scrollIntoView({ block: 'center' })
    const before = scrollY
    marker.click()
    await new Promise((resolve) => setTimeout(resolve, 700))
    await new Promise((resolve) => setTimeout(resolve, 300))
    const panel = document.querySelector('#t-travel')?.getBoundingClientRect()
    return {
      scrollBefore: Math.round(before),
      scrollAfter: Math.round(scrollY),
      documentNavigation: false,
      openedPassageInView: panel === undefined ? null : panel.top >= 0 && panel.top < innerHeight,
      url: location.search + location.hash,
    }
  })
  out('With JavaScript on, one tap opens the passage and the anchor brings it into view', kept)

  await context.close()
}

/* ------------------------------------------------------ screenshots */

for (const [scheme, suffix] of [
  ['light', ''],
  ['dark', '-dark'],
]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme })
  const page = await context.newPage()
  for (const [name, query] of [
    ['frontdoor', ''],
    ['open', '?open=tabley'],
    ['tabley', '?p=tabley'],
  ]) {
    await page.goto(`${FRONT}${query}`, { waitUntil: 'load' })
    await page.screenshot({ path: `${DIR}/shot-${name}${suffix}.png`, fullPage: true })
  }
  const phone = await browser.newContext({ viewport: PHONE, colorScheme: scheme })
  const phonePage = await phone.newPage()
  await phonePage.goto(`${FRONT}?open=w-tabley`, { waitUntil: 'load' })
  await phonePage.screenshot({ path: `${DIR}/shot-phone${suffix}.png`, fullPage: true })
  await phone.close()
  await context.close()
}

await browser.close()
