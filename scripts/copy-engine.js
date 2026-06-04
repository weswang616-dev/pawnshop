// Copies the Stockfish "lite, single-threaded" WASM engine out of node_modules and
// into public/engine/ so Vite serves it as a static Web Worker at /engine/...
//
// We use the lite single-threaded build on purpose: it is ~7 MB (vs >100 MB for the
// full build) and needs NO SharedArrayBuffer / COOP-COEP headers, so it runs on any
// static host and in the Vite dev server with zero extra config.
//
// Runs automatically on `npm install` (postinstall) and before `npm run dev` / `build`.
import { mkdirSync, copyFileSync, existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'node_modules', 'stockfish', 'bin')
const destDir = join(root, 'public', 'engine')
const files = ['stockfish-18-lite-single.js', 'stockfish-18-lite-single.wasm']

if (!existsSync(join(srcDir, files[0]))) {
  console.warn('[copy-engine] stockfish package not found yet — skipping (run `npm install` first).')
  process.exit(0)
}

mkdirSync(destDir, { recursive: true })
for (const file of files) {
  const dest = join(destDir, file)
  // Skip the copy if an up-to-date file is already in place.
  if (existsSync(dest) && statSync(dest).size === statSync(join(srcDir, file)).size) continue
  copyFileSync(join(srcDir, file), dest)
  console.log('[copy-engine] copied', file)
}
console.log('[copy-engine] engine ready at public/engine/')
