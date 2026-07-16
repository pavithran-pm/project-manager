// Capture a full-page screenshot of the running dev server for visual review.
// Usage: node scripts/screenshot.mjs [url] [outfile]
import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:5173'
const out = process.argv[3] ?? 'screenshot.png'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1010 } })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.screenshot({ path: out })
await browser.close()
console.log(`saved ${out}`)
