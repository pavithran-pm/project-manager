// Convert the single-file build (dist-artifact/index.html) into a body-only
// fragment (title + inline style + root div + inline module script) suitable
// for hosts that wrap content in their own <html>/<head>/<body> skeleton.
// Usage: node scripts/make-artifact.mjs [outfile]
import { readFileSync, writeFileSync } from 'node:fs'

const out = process.argv[2] ?? 'dist-artifact/fragment.html'
const html = readFileSync('dist-artifact/index.html', 'utf8')

const styles = [...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map((m) => m[0])
const scripts = [...html.matchAll(/<script type="module"[^>]*>[\s\S]*?<\/script>/g)].map(
  (m) => m[0],
)
const title = html.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? ''

if (!styles.length || !scripts.length) {
  console.error('expected inline <style> and <script type="module"> in dist-artifact/index.html')
  process.exit(1)
}

const fragment = `${title}
${styles.join('\n')}
<div id="root"></div>
${scripts.join('\n')}
`
writeFileSync(out, fragment)
console.log(`wrote ${out} (${(fragment.length / 1024).toFixed(0)} KB)`)
