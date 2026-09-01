import { chromium } from 'playwright'
const BASE = process.env.SPIKE_BASE ?? 'http://localhost:3000'
const out = (k, v) => console.log(`${k}: ${JSON.stringify(v)}`)

const INIT = `
  // pageswap fires on the OUTGOING document, so stash it where the next one can read it.
  window.addEventListener('pageswap', (e) => {
    sessionStorage.setItem('swap', JSON.stringify({ fired: true, hadTransition: !!e.viewTransition }))
  })
  window.__probe = { revealed: false, hadTransition: false, pseudos: [], sampledAt: null }
  window.addEventListener('pagereveal', (e) => {
    window.__probe.revealed = true
    if (!e.viewTransition) return
    window.__probe.hadTransition = true
    // Pseudo-elements only exist once the transition is ready — one frame after pagereveal.
    e.viewTransition.ready.then(() => {
      window.__probe.pseudos = document.getAnimations()
        .map((a) => a.effect?.pseudoElement).filter(Boolean)
      window.__probe.sampledAt = 'ready'
    })
  })
`
const run = async (browser, opts, label) => {
  const ctx = await browser.newContext(opts)
  await ctx.addInitScript(INIT)
  const page = await ctx.newPage()
  await page.goto(`${BASE}/spike/a`, { waitUntil: 'networkidle' })
  await page.getByTestId('plain-anchor').click()
  await page.waitForURL('**/spike/b')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(300)
  out(`${label}.pageswap`, await page.evaluate(() => JSON.parse(sessionStorage.getItem('swap') ?? 'null')))
  const p = await page.evaluate(() => window.__probe)
  out(`${label}.pagereveal.hadTransition`, p.hadTransition)
  out(`${label}.animatedPseudoElements`, [...new Set(p.pseudos)].sort())
  await ctx.close()
}

const browser = await chromium.launch()
await run(browser, {}, 'default')
await run(browser, { reducedMotion: 'reduce' }, 'reducedMotion')
await browser.close()
