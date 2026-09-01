import { chromium } from 'playwright'

const BASE = process.env.SPIKE_BASE ?? 'http://localhost:3000'
const out = (k, v) => console.log(`${k}: ${JSON.stringify(v)}`)
const INIT = `
  window.__docId = Math.random().toString(36).slice(2)
  window.__vt = { reveals: 0, withTransition: 0, sameDocStarts: 0 }
  if (document.startViewTransition) {
    const orig = document.startViewTransition.bind(document)
    document.startViewTransition = (...a) => { window.__vt.sameDocStarts++; return orig(...a) }
  }
  window.addEventListener('pagereveal', (e) => {
    window.__vt.reveals++
    if (e.viewTransition) window.__vt.withTransition++
  })
`
const browser = await chromium.launch()
const ctx = await browser.newContext()
await ctx.addInitScript(INIT)
const page = await ctx.newPage()

// plain <a> — cross-document
await page.goto(`${BASE}/spike/a`, { waitUntil: 'networkidle' })
const id0 = await page.evaluate(() => window.__docId)
await page.getByTestId('plain-anchor').click()
await page.waitForURL('**/spike/b'); await page.waitForLoadState('networkidle')
out('plainAnchor.newDocument', id0 !== (await page.evaluate(() => window.__docId)))
out('plainAnchor.vt', await page.evaluate(() => window.__vt))

// TanStack <Link> — single-document
const id1 = await page.evaluate(() => window.__docId)
await page.evaluate(() => { window.__vt.reveals = 0; window.__vt.withTransition = 0; window.__vt.sameDocStarts = 0 })
await page.getByTestId('router-link').click()
await page.waitForURL('**/spike/a'); await page.waitForTimeout(400)
out('routerLink.url', page.url())
out('routerLink.newDocument', id1 !== (await page.evaluate(() => window.__docId)))
out('routerLink.vt', await page.evaluate(() => window.__vt))
out('routerLink.bodyText', (await page.getByTestId('card-body').textContent())?.trim())

// hydration sanity: no console errors on the cross-document page
const errs = []
page.on('pageerror', (e) => errs.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
await page.goto(`${BASE}/spike/b?pane=work&open=tabley`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
out('hydration.errors', errs)
out('hydration.state', (await page.getByTestId('search-state').textContent())?.trim())

await browser.close()
