import { chromium } from 'playwright'

const BASE = process.env.SPIKE_BASE ?? 'http://localhost:3000'
const out = (k, v) => console.log(`${k}: ${JSON.stringify(v)}`)

const browser = await chromium.launch()

// Instrument before any page script: record every real document load and any
// view transition handed to pagereveal.
const INIT = `
  window.__docId = Math.random().toString(36).slice(2)
  window.__vt = { reveals: 0, withTransition: 0 }
  window.addEventListener('pagereveal', (e) => {
    window.__vt.reveals++
    if (e.viewTransition) window.__vt.withTransition++
  })
`

// ---------- 1. JS ENABLED: plain <a> ----------
{
  const ctx = await browser.newContext()
  await ctx.addInitScript(INIT)
  const page = await ctx.newPage()
  const docLoads = []
  page.on('framenavigated', (f) => { if (f === page.mainFrame()) docLoads.push(f.url()) })

  await page.goto(`${BASE}/spike/a`, { waitUntil: 'networkidle' })
  const idBefore = await page.evaluate(() => window.__docId)
  out('js.chromiumVersion', browser.version())
  out('js.supportsCrossDocVT', await page.evaluate(() => 'onpagereveal' in window && CSS.supports('view-transition-name', 'x')))

  await page.getByTestId('plain-anchor').click()
  await page.waitForURL('**/spike/b')
  await page.waitForLoadState('networkidle')

  const idAfter = await page.evaluate(() => window.__docId)
  out('js.plainAnchor.newDocument', idBefore !== idAfter)
  out('js.plainAnchor.url', page.url())
  out('js.plainAnchor.vt', await page.evaluate(() => window.__vt))
  out('js.plainAnchor.bodyText', (await page.getByTestId('card-body').textContent())?.trim())

  // query params survive a plain-anchor navigation and reach the server
  await page.getByTestId('plain-anchor-query').click()
  await page.waitForURL(/spike\/a\?/)
  await page.waitForLoadState('networkidle')
  out('js.queryAnchor.url', page.url())
  out('js.queryAnchor.state', (await page.getByTestId('search-state').textContent())?.trim())
  out('js.queryAnchor.vt', await page.evaluate(() => window.__vt))

  // the hash trap: does the server ever see it?
  await page.goto(`${BASE}/spike/a`, { waitUntil: 'networkidle' })
  const hashReq = []
  page.on('request', (r) => { if (r.resourceType() === 'document') hashReq.push(r.url()) })
  await page.getByTestId('hash-anchor').click()
  await page.waitForURL(/#pane=work/)
  out('js.hashAnchor.url', page.url())
  out('js.hashAnchor.documentRequestsSeenByServer', hashReq)

  await ctx.close()
}

// ---------- 2. JS DISABLED ----------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/spike/a`)
  out('nojs.a.title', (await page.locator('h1').textContent())?.trim())
  out('nojs.a.cardBody', (await page.getByTestId('card-body').textContent())?.trim())

  await page.goto(`${BASE}/spike/a?pane=work&open=tabley`)
  out('nojs.a.searchState', (await page.getByTestId('search-state').textContent())?.trim())

  await page.getByTestId('plain-anchor').click()
  await page.waitForURL('**/spike/b')
  out('nojs.navigate.url', page.url())
  out('nojs.navigate.cardBody', (await page.getByTestId('card-body').textContent())?.trim())

  // the harness index, i.e. the shape prototypes actually ship in
  await page.goto(`${BASE}/proto`)
  out('nojs.proto.text', (await page.locator('body').innerText()).slice(0, 200).replace(/\s+/g, ' '))
  await ctx.close()
}

await browser.close()
