import { useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board from './Board'
import { fetchPuzzle, PUZZLE_DIFFICULTY } from '../lib/lichess'
import { uciToMove } from '../lib/analysis'
import { loadSet, saveSet, clearSet, fmtTime } from '../lib/woodpecker'

function buildFromPgn(pgn) {
  const c = new Chess()
  for (const tok of pgn.trim().split(/\s+/)) {
    try {
      c.move(tok)
    } catch {
      /* skip */
    }
  }
  return c
}
const matches = (uci, from, to) => uci.slice(0, 2) === from && uci.slice(2, 4) === to
const SIZES = [10, 20, 30]

export default function Woodpecker() {
  const [set, setSet] = useState(() => loadSet())
  const [building, setBuilding] = useState(false)
  const [buildCount, setBuildCount] = useState(0)
  const [size, setSize] = useState(20)
  const [difficulty, setDifficulty] = useState('normal')
  const [buildError, setBuildError] = useState('')

  const [idx, setIdx] = useState(0)
  const [fen, setFen] = useState(null)
  const [orientation, setOrientation] = useState('white')
  const [message, setMessage] = useState({ type: 'info', text: '' })
  const [status, setStatus] = useState('solving') // solving | solved | cycledone
  const [hintArrow, setHintArrow] = useState([])

  const chessRef = useRef(null)
  const solRef = useRef([])
  const solIdxRef = useRef(0)
  const busyRef = useRef(false)
  const cleanRef = useRef(true)
  const startRef = useRef(null) // cycle start time (ms)
  const correctRef = useRef(0) // clean solves this cycle
  const puzRef = useRef(0)

  function setPuz(n) {
    puzRef.current = n
    setIdx(n)
  }

  // Load the current puzzle whenever we move to a new index or start a new cycle.
  useEffect(() => {
    if (!set || building || idx >= set.size) return
    const p = set.puzzles[idx]
    const c = buildFromPgn(p.pgn)
    chessRef.current = c
    solRef.current = p.solution
    solIdxRef.current = 0
    busyRef.current = false
    cleanRef.current = true
    setFen(c.fen())
    setOrientation(c.turn() === 'w' ? 'white' : 'black')
    setStatus('solving')
    setMessage({ type: 'info', text: `${c.turn() === 'w' ? 'White' : 'Black'} to move — find the best move.` })
    setHintArrow([])
    if (startRef.current == null) startRef.current = Date.now()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, set?.cycle])

  async function buildSet() {
    setBuilding(true)
    setBuildError('')
    setBuildCount(0)
    const puzzles = []
    const seen = new Set()
    let attempts = 0
    try {
      while (puzzles.length < size && attempts < size * 3) {
        attempts++
        const data = await fetchPuzzle({ difficulty })
        const id = data?.puzzle?.id
        if (!id || seen.has(id)) continue
        seen.add(id)
        puzzles.push({ id, rating: data.puzzle.rating, pgn: data.game.pgn, solution: data.puzzle.solution })
        setBuildCount(puzzles.length)
      }
      if (puzzles.length < 3) throw new Error('Could not fetch enough puzzles — check your connection.')
      const s = { puzzles, cycle: 1, size: puzzles.length, difficulty, history: [] }
      correctRef.current = 0
      startRef.current = null
      saveSet(s)
      setPuz(0)
      setSet(s)
    } catch (e) {
      setBuildError(e.message || 'Failed to build the set.')
    }
    setBuilding(false)
  }

  function newSet() {
    clearSet()
    setSet(null)
    setBuildError('')
  }

  function solved() {
    setStatus('solved')
    if (cleanRef.current) correctRef.current += 1
    setMessage({ type: 'success', text: cleanRef.current ? '✓ Solved — first try!' : '✓ Solved.' })
    setTimeout(advance, 650)
  }

  function advance() {
    const next = puzRef.current + 1
    if (next >= set.size) finishCycle()
    else setPuz(next)
  }

  function finishCycle() {
    const ms = startRef.current ? Date.now() - startRef.current : 0
    const entry = { cycle: set.cycle, ms, correct: correctRef.current, total: set.size }
    const updated = { ...set, history: [...set.history, entry] }
    saveSet(updated)
    setSet(updated)
    setStatus('cycledone')
  }

  function startNextCycle() {
    const updated = { ...set, cycle: set.cycle + 1 }
    correctRef.current = 0
    startRef.current = null
    saveSet(updated)
    setSet(updated)
    setStatus('solving')
    setPuz(0)
  }

  function onDrop(from, to) {
    if (status !== 'solving' || busyRef.current) return false
    const c = chessRef.current
    const expected = solRef.current[solIdxRef.current]
    const promo = expected && matches(expected, from, to) ? expected.slice(4) || undefined : 'q'
    let move
    try {
      move = c.move({ from, to, promotion: promo })
    } catch {
      move = null
    }
    if (!move) return false
    const correct = (expected && matches(expected, from, to)) || c.isCheckmate()
    if (!correct) {
      c.undo()
      cleanRef.current = false
      setMessage({ type: 'error', text: '✗ Not the move — try again.' })
      return false
    }
    setFen(c.fen())
    setHintArrow([])
    solIdxRef.current += 1
    if (c.isCheckmate() || solIdxRef.current >= solRef.current.length) {
      solved()
      return true
    }
    busyRef.current = true
    const reply = solRef.current[solIdxRef.current]
    setMessage({ type: 'success', text: 'Good — keep going.' })
    setTimeout(() => {
      c.move(uciToMove(reply))
      setFen(c.fen())
      solIdxRef.current += 1
      busyRef.current = false
      if (solIdxRef.current >= solRef.current.length) solved()
    }, 300)
    return true
  }

  function showHint() {
    const expected = solRef.current[solIdxRef.current]
    if (!expected || status !== 'solving') return
    cleanRef.current = false
    setHintArrow([{ startSquare: expected.slice(0, 2), endSquare: expected.slice(2, 4), color: '#e8974f' }])
  }

  function revealSkip() {
    if (status !== 'solving') return
    cleanRef.current = false
    setMessage({ type: 'info', text: 'Revealed — counts as missed. Next puzzle…' })
    setStatus('solved')
    setTimeout(advance, 700)
  }

  // ----- Build screen -----
  if (building) {
    return (
      <div className="trainer-side" style={{ maxWidth: 460, margin: '0 auto' }}>
        <div className="idea-card info">
          <p>Building your set… fetched <b>{buildCount}</b> / {size} puzzles.</p>
          <div className="progress thin"><div className="progress-bar" style={{ width: `${Math.round((buildCount / size) * 100)}%` }} /></div>
        </div>
      </div>
    )
  }
  if (!set) {
    return (
      <div className="wp-build">
        <div className="idea-card info">
          <strong>🪵 The Woodpecker Method</strong>
          <p className="muted small">
            Solve one set of puzzles, then repeat the <b>same</b> set again and again — faster each cycle. The
            repetition turns calculation into instant pattern recognition, the #1 driver of rating at your level.
          </p>
        </div>
        <div className="filters">
          <label>
            Set size
            <div className="seg">
              {SIZES.map((n) => (
                <button key={n} className={size === n ? 'on' : ''} onClick={() => setSize(n)}>{n}</button>
              ))}
            </div>
          </label>
          <label>
            Difficulty
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {PUZZLE_DIFFICULTY.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </label>
          <button className="btn-primary full" onClick={buildSet}>Build my set →</button>
          {buildError && <p className="error small">{buildError}</p>}
          <p className="muted small">Puzzles come from Lichess. Your set and cycle times are saved on this device.</p>
        </div>
      </div>
    )
  }

  const lastTimes = set.history.slice(-6)

  // ----- Cycle-done screen -----
  if (status === 'cycledone') {
    const me = set.history[set.history.length - 1]
    const prev = set.history[set.history.length - 2]
    const faster = prev && me ? prev.ms - me.ms : 0
    return (
      <div className="memorize-done">
        <div className="done-card big">
          <h2>Cycle {me.cycle} complete! 🪵</h2>
          <p>
            Time <b>{fmtTime(me.ms)}</b> · solved clean <b>{me.correct}/{me.total}</b>
            {faster > 0 && <> · <span className="accent">{fmtTime(faster)} faster than last cycle ⚡</span></>}
          </p>
          <CycleHistory history={lastTimes} />
          <div className="controls" style={{ justifyContent: 'center', marginTop: 12 }}>
            <button className="btn-primary" onClick={startNextCycle}>Start cycle {set.cycle + 1} →</button>
            <button onClick={newSet}>New set</button>
          </div>
        </div>
      </div>
    )
  }

  // ----- Solving screen -----
  return (
    <div className="trainer-layout">
      <div className="board-col">
        <div className="board-area">
          <Board
            fen={fen}
            onDrop={onDrop}
            orientation={orientation}
            allowDragging={status === 'solving'}
            arrows={hintArrow}
            id="woodpecker-board"
          />
        </div>
        <div className="controls">
          <button onClick={showHint} disabled={status !== 'solving'}>💡 Hint</button>
          <button onClick={revealSkip} disabled={status !== 'solving'}>Reveal & skip</button>
        </div>
        <div className="progress thin"><div className="progress-bar" style={{ width: `${Math.round((idx / set.size) * 100)}%` }} /></div>
      </div>
      <aside className="trainer-side">
        <div className="wp-head">
          <strong>🪵 Cycle {set.cycle}</strong>
          <span className="muted small">Puzzle {Math.min(idx + 1, set.size)} / {set.size} · clean {correctRef.current}</span>
        </div>
        <div className={`idea-card ${message.type}`}>
          <p>{message.text}</p>
        </div>
        {set.history.length > 0 && (
          <div className="filters">
            <span className="muted small">Cycle times (aim to drop each round):</span>
            <CycleHistory history={lastTimes} />
          </div>
        )}
        <button className="btn-ghost full" onClick={newSet}>Build a new set</button>
      </aside>
    </div>
  )
}

function CycleHistory({ history }) {
  if (!history || !history.length) return null
  const best = Math.min(...history.map((h) => h.ms))
  return (
    <ul className="cycle-history">
      {history.map((h) => (
        <li key={h.cycle} className={h.ms === best ? 'best' : ''}>
          <span>Cycle {h.cycle}</span>
          <span className="mono">{fmtTime(h.ms)}</span>
          <span className="muted">{h.correct}/{h.total}</span>
        </li>
      ))}
    </ul>
  )
}
