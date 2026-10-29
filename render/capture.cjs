// Screenshots each Earn illustration scene to a transparent PNG. Run with the dev server up.
const { chromium } = require('playwright')
const ARTS = ['upi', 'rent', 'bills', 'emi', 'campaign', 'card', 'streak', 'autopay', 'first', 'recurring']
;(async () => {
  const out = process.argv[2]
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const p = await b.newPage({ viewport: { width: 240, height: 240 }, deviceScaleFactor: 2 })
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  for (const art of ARTS) {
    await p.goto(`http://localhost:5174/render/earn-art.html?art=${art}`)
    await p.waitForFunction(() => window.__ready === true, null, { timeout: 30000 })
    await p.waitForTimeout(400)
    await p.locator('canvas').screenshot({ path: `${out}/${art}.png`, omitBackground: true })
  }
  console.log(errs.join('\n') || 'rendered ' + ARTS.length)
  await b.close()
})()
