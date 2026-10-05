import { execFileSync } from 'node:child_process'
import { access } from 'node:fs/promises'
import ghpages from 'gh-pages'

const requested = process.argv[2] ?? 'all'
if (!['all', 'review', 'public'].includes(requested)) {
  throw new Error('Choose review, public, or all for deployment.')
}

// Reuse an HTTPS credential from the existing origin without writing it into
// another remote URL, publishing it, or including it in command output.
const origin = execFileSync('git', ['config', '--get', 'remote.origin.url'], { encoding: 'utf8' }).trim()
const redactions = []
if (origin.startsWith('https://')) {
  const url = new URL(origin)
  const credential = decodeURIComponent(url.password || url.username)
  if (url.hostname === 'github.com' && /^(gh[pousr]_|github_pat_)/.test(credential)) {
    const encoded = Buffer.from(`x-access-token:${credential}`).toString('base64')
    const count = Number(process.env.GIT_CONFIG_COUNT ?? 0)
    process.env.GIT_CONFIG_COUNT = String(count + 1)
    process.env[`GIT_CONFIG_KEY_${count}`] = 'http.https://github.com/.extraHeader'
    process.env[`GIT_CONFIG_VALUE_${count}`] = `Authorization: Basic ${encoded}`
    redactions.push(credential, encoded)
  }
}
process.env.GIT_TERMINAL_PROMPT = '0'

const versions = requested === 'all' ? ['review', 'public'] : [requested]
for (const version of versions) await access(`dist/${version}/index.html`)
await access('dist/index.html')

const options = {
  repo: 'https://github.com/pomdp-mirror/pomdp-mirror.github.io.git',
  branch: 'gh-pages',
  dotfiles: true,
  silent: true,
  message: `Publish MIRROR ${requested === 'all' ? 'public and anonymous review pages' : `${requested} page`}`,
}
if (requested !== 'all') {
  options.src = ['.nojekyll', `${requested}/**/*`]
  options.remove = requested
  if (requested === 'public') options.src.push('index.html')
}

try {
  await ghpages.publish('dist', options)
  for (const version of versions) console.log(`Published https://pomdp-mirror.github.io/${version}/`)
} catch (error) {
  let message = error.message
  for (const value of redactions) message = message.replaceAll(value, '[redacted]')
  console.error(`Failed to publish: ${message}`)
  process.exitCode = 1
}
