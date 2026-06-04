// Wrapper around the Stockfish (lite, single-threaded) WASM engine running in a Web Worker.
// Talks the UCI text protocol. All evaluations are normalised to WHITE's perspective so the
// rest of the app never has to reason about side-to-move sign flips.
//
// The engine file is served statically from /public/engine (see scripts/copy-engine.js), and
// loaded as a classic Worker at runtime — we deliberately pass a string URL (not new URL(...))
// so Vite leaves it alone instead of trying to bundle the emscripten glue code.

// BASE_URL is '/' in dev and '/pawnshop/' in the GitHub Pages build, so the worker resolves either way.
const ENGINE_URL = `${import.meta.env.BASE_URL}engine/stockfish-18-lite-single.js`

export class Engine {
  constructor() {
    this.worker = null
    this.ready = false
    this._listeners = new Set()
    this._initPromise = null
    this._chain = Promise.resolve() // serialises evaluate() calls
  }

  init() {
    if (this._initPromise) return this._initPromise
    this._initPromise = new Promise((resolve, reject) => {
      try {
        this.worker = new Worker(ENGINE_URL)
      } catch (err) {
        reject(new Error('Could not start the engine worker: ' + err.message))
        return
      }
      this.worker.onmessage = (e) => {
        const line = typeof e.data === 'string' ? e.data : (e.data && e.data.data) || ''
        this._listeners.forEach((fn) => fn(line))
      }
      this.worker.onerror = (e) =>
        reject(new Error('Engine failed to load: ' + (e.message || e.filename || 'unknown error')))

      const onHandshake = (line) => {
        if (line === 'uciok') this._post('isready')
        else if (line === 'readyok') {
          this._listeners.delete(onHandshake)
          this.ready = true
          resolve()
        }
      }
      this._listeners.add(onHandshake)
      this._post('uci')
    })
    return this._initPromise
  }

  _post(cmd) {
    this.worker.postMessage(cmd)
  }

  // Run tasks one at a time so concurrent callers can't interleave UCI commands.
  _enqueue(task) {
    const run = this._chain.then(task, task)
    this._chain = run.catch(() => {})
    return run
  }

  /**
   * Evaluate a position. Resolves to { cp, mate, bestMove, pv, depth } from White's view:
   *   cp   – centipawns (null when a forced mate is seen)
   *   mate – mate-in-N (positive = White mates, negative = Black mates; null otherwise)
   *   bestMove – best move in UCI (e.g. "g1f3"), or null
   */
  async evaluate(fen, { depth = 14, movetime = null } = {}) {
    await this.init()
    return this._enqueue(() => this._evaluateNow(fen, { depth, movetime }))
  }

  _evaluateNow(fen, { depth, movetime }) {
    const sideSign = fen.split(' ')[1] === 'w' ? 1 : -1
    let last = { cp: 0, mate: null, pv: [], depth: 0 }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this._listeners.delete(handler)
        reject(new Error('Engine evaluation timed out'))
      }, 30000)

      const handler = (line) => {
        if (line.startsWith('info') && line.includes(' pv ')) {
          const d = line.match(/ depth (\d+)/)
          const cp = line.match(/ score cp (-?\d+)/)
          const mate = line.match(/ score mate (-?\d+)/)
          const pv = line.match(/ pv (.+)$/)
          last = {
            depth: d ? +d[1] : last.depth,
            cp: mate ? null : cp ? +cp[1] * sideSign : last.cp,
            mate: mate ? +mate[1] * sideSign : null,
            pv: pv ? pv[1].trim().split(/\s+/) : last.pv,
          }
        } else if (line.startsWith('bestmove')) {
          clearTimeout(timer)
          this._listeners.delete(handler)
          const bm = line.split(/\s+/)[1]
          resolve({
            cp: last.cp,
            mate: last.mate,
            depth: last.depth,
            pv: last.pv,
            bestMove: !bm || bm === '(none)' ? null : bm,
          })
        }
      }
      this._listeners.add(handler)
      this._post('position fen ' + fen)
      this._post(movetime ? `go movetime ${movetime}` : `go depth ${depth}`)
    })
  }

  quit() {
    if (this.worker) {
      try { this._post('quit') } catch { /* ignore */ }
      this.worker.terminate()
      this.worker = null
      this.ready = false
      this._initPromise = null
    }
  }
}

// One shared engine for the whole app.
let _engine = null
export function getEngine() {
  if (!_engine) _engine = new Engine()
  return _engine
}
