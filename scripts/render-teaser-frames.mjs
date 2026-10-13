// Render the approved layout at each of the 24 paired source angles.
// Set PLAYWRIGHT_MODULE to an installed Playwright ESM entry point if needed.
// Playwright's page.evaluate callbacks execute in the browser.
/* global document: readonly */
import { mkdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

const { values } = parseArgs({ options: { width: { type: 'string', default: '640' } } })
const width = Number(values.width)
if (![640, 720].includes(width)) throw new Error('Width must be 640 or 720')
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = join(root, 'artifacts', 'drawer-teaser')
const framesDirectory = join(output, width === 640 ? 'frames' : `frames-${width}x480`)
const assets = join(root, 'public', 'imgs', 'drawer_open_seed_5_sample_288')
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')

await mkdir(framesDirectory, { recursive: true })
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.TEASER_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1'],
})

try {
  const page = await browser.newPage({ viewport: { width, height: 480 }, deviceScaleFactor: 1 })
  await page.goto(pathToFileURL(join(output, `drawer-opening-first-frame-${width}x480.html`)).href)
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map((image) => image.decode()))
  })

  for (let index = 0; index < 24; index += 1) {
    const images = await Promise.all(['Obs_Group_obs_raw', 'Act_Group_act'].map(async (prefix) => {
      const bytes = await readFile(join(assets, `${prefix}_${index}_agentview_image.png`))
      return `data:image/png;base64,${bytes.toString('base64')}`
    }))
    await page.evaluate(async ({ images, index }) => {
      const observation = document.querySelector('.transformed .observation')
      const action = document.querySelector('.transformed .action')
      observation.src = images[0]
      action.src = images[1]
      observation.alt = `Transformed simulated drawer observation at ${index * 15} degrees`
      action.alt = `Transformed action bar chart at ${index * 15} degrees`
      await Promise.all([observation.decode(), action.decode()])
    }, { images, index })
    await page.screenshot({ path: join(framesDirectory, `frame-${String(index).padStart(2, '0')}.png`) })
    if (index % 6 === 5) console.log(`Rendered ${index + 1}/24 paired frames`)
  }
} finally {
  await browser.close()
}
