// Runs before every build: fails it when the Content-Security-Policy in vercel.json would block part of
// the site in production. Each inline <script> in the pages runs only if the policy lists its sha256
// hash, and the app can call its API only if VITE_API_URL's origin is in connect-src.
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const file = name => new URL(`../${name}`, import.meta.url)
const csp = JSON.parse(readFileSync(file('vercel.json'), 'utf8')).headers
  .flatMap(rule => rule.headers)
  .find(header => header.key === 'Content-Security-Policy').value
const directive = name => (csp.split(';').map(d => d.trim().split(/\s+/)).find(([n]) => n === name) || []).slice(1)

const problems = []

for (const page of ['index.html', 'app.html']) {
  const html = readFileSync(file(page), 'utf8')
  for (const [, attrs = '', body] of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    // external scripts, modules (Vite bundles them) and data blocks need no hash
    if (/\ssrc=/.test(attrs) || /type=["']?(module|application\/(ld\+)?json)/.test(attrs) || !body.trim()) continue
    const hash = `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`
    if (!directive('script-src').includes(hash)) {
      problems.push(`${page}: the inline script "${body.trim().slice(0, 40)}..." needs ${hash} in script-src`)
    }
  }
}

// the API origin the build will call (Vercel sets VITE_API_URL in its settings; locally it comes from .env)
const envUrl = globalThis.process?.env?.VITE_API_URL
  || (existsSync(file('.env')) && (readFileSync(file('.env'), 'utf8').match(/^VITE_API_URL=(.+)$/m) || [])[1])
if (envUrl && !/^https?:\/\/localhost/.test(envUrl)) {
  const origin = new URL(envUrl.trim()).origin
  if (!directive('connect-src').includes(origin)) problems.push(`the API at ${origin} needs to be in connect-src`)
}

if (problems.length) {
  throw new Error(`vercel.json Content-Security-Policy is out of date:\n  - ${problems.join('\n  - ')}`)
}
console.log('check-csp: vercel.json allows every inline script and the API origin')
