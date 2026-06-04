import { useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board from '../components/Board'
import { fetchPuzzle, PUZZLE_THEMES, PUZZLE_DIFFICULTY } from '../lib/lichess'
import { uciToMove } from '../lib/analysis'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { topWeakness } from '../lib/weakness'

// Replay the puzzle's PGN; the resulting side-to-move is the solver.
function buildFromPgn(pgn) {
  const c = new Chess()
  for (const tok of pgn.trim().split(/\s+/)) {
    if (!tok) continue
    try {
      c.move(tok)
    } catch {
      /* skip stray tokens */
    }
  }
  return c
}

function matches(uci, from, to) {
  return uci.slice(0, 2) === from && uci.slice(2, 4) === to
}

export default function Tactics() {
  const [theme, setTheme] = useLocalStorage('puzzle-theme', '')
  const [difficulty, setDifficulty] = useLocalStorage('puzzle-difficulty', 'normal')
  const [puzzle, setPuzzle] = useState(null)
  const [status, setStatus] = useState('loading') // loading | solving | solved | error
  const [error, setError] = useState('')
  const [message, setMessage] = useState({ type: 'info', text: '' })
  const [fen, setFen] = useState(() => new Chess().fen())
  const [orientation, setOrientation] = useState('white')
  const [hintArrow, setHintArrow] = useState([])
  const [stats, setStats] = useLocalStorage('puzzle-stats', { solved: 0, streak: 0, attempts: 0 })
  const [weakness] = useState(() => topWeakness()) // computed from Game Review findings

  const chessRef = useRef(null)
  const solRef = useRef([])
  const idxRef = useRef(0)
  const busyRef = useRef(false)
  const cleanRef = useRef(true)

  async function loadWith(themeVal, diffVal) {
    setStatus('loading')
    setError('')
    setHintArrow([])
    setMessage({ type: 'info', text: '' })
    try {
      const data = await fetchPuzzle({ theme: themeVal, difficulty: diffVal })
      const c = buildFromPgn(data.game.pgn)
      chessRef.current = c
      solRef.current = data.puzzle.solution
      idxRef.current = 0
      busyRef.current = false
      cleanRef.current = true
      setPuzzle({ id: data.puzzle.id, rating: data.puzzle.rating, themes: data.puzzle.themes || [] })
      setFen(c.fen())
      setOrientation(c.turn() === 'w' ? 'white' : 'black')
      setStatus('solving')
      setMessage({ type: 'info', text: `${c.turn() === 'w' ? 'White' : 'Black'} to move — find the best move.` })
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  function newPuzzle() {
    loadWith(theme, difficulty)
  }

  function trainWeakness() {
    if (!weakness) return
    setTheme(weakness.angle)
    loadWith(weakness.angle, difficulty)
  }

  useEffect(() => {
    newPuzzle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finishSolved() {
    setStatus('solved')
    setMessage({ type: 'success', text: cleanRef.current ? '✓ Solved — first try!' : '✓ Solved.' })
    setStats((s) => ({
      solved: s.solved + 1,
      attempts: s.attempts + 1,
      streak: cleanRef.current ? s.streak + 1 : 0,
    }))
  }

  function onDrop(from, to) {
    if (status !== 'solving' || busyRef.current) return false
    const c = chessRef.current
    const expected = solRef.current[idxRef.current]
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
      setMessage({ type: 'error', text: '✗ Not the best move — try again.' })
      return false
    }

    setFen(c.fen())
    setHintArrow([])
    idxRef.current += 1

    if (c.isCheckmate() || idxRef.current >= solRef.current.length) {
      finishSolved()
      return true
    }

    // auto-play the opponent's reply
    busyRef.current = true
    const reply = solRef.current[idxRef.current]
    setMessage({ type: 'success', text: 'Good — keep going.' })
    setTimeout(() => {
      c.move(uciToMove(reply))
      setFen(c.fen())
      idxRef.current += 1
      busyRef.current = false
      if (idxRef.current >= solRef.current.length) finishSolved()
    }, 350)
    return true
  }

  function showHint() {
    const expected = solRef.current[idxRef.current]
    if (!expected || status !== 'solving') return
    cleanRef.current = false
    setHintArrow([{ startSquare: expected.slice(0, 2), endSquare: expected.slice(2, 4), color: '#e8974f' }])
  }

  const accuracy = stats.attempts ? Math.round((stats.solved / stats.attempts) * 100) : 0

  return (
    <div className="page">
      <div className="page-head">
        <h1>Tactics</h1>
        <p className="muted">
          Real rated puzzles from Lichess. Pattern recognition is the single biggest driver of rating at your
          level — a few of these a day compounds fast.
        </p>
      </div>

      <div className="trainer-layout">
        <div className="board-col">
          <div className="board-area">
            <Board
              fen={fen}
              onDrop={onDrop}
              orientation={orientation}
              allowDragging={status === 'solving'}
              arrows={hintArrow}
              id="tactics-board"
            />
          </div>
          <div className="controls">
            <button onClick={showHint} disabled={status !== 'solving'}>💡 Hint</button>
            {status === 'solved' ? (
              <button className="btn-primary" onClick={newPuzzle}>Next puzzle →</button>
            ) : (
              <button onClick={newPuzzle} disabled={status === 'loading'}>↷ Skip</button>
            )}
          </div>
        </div>

        <aside className="trainer-side">
          <div className={`idea-card ${message.type}`}>
            <p>{status === 'loading' ? 'Loading a puzzle…' : message.text}</p>
          </div>
          {status === 'error' && <p className="error small">{error}</p>}

          {weakness ? (
            <div className="weakness-card">
              <span className="weakness-eyebrow">🎯 Your biggest leak (from Game Review)</span>
              <strong className="weakness-title">{weakness.label}</strong>
              <p className="muted small">{weakness.tip}</p>
              <button className="btn-primary full" onClick={trainWeakness} disabled={status === 'loading'}>
                Train this weakness ({weakness.count} flagged)
              </button>
            </div>
          ) : (
            <div className="weakness-card muted-card">
              <p className="muted small">
                💡 Review a few games in <b>Game Review</b> and we'll spot your most common blunder type, then serve
                puzzles for exactly that.
              </p>
            </div>
          )}

          {puzzle && (
            <div className="puzzle-meta">
              <span>Rating <b>{puzzle.rating}</b></span>
              <a href={`https://lichess.org/training/${puzzle.id}`} target="_blank" rel="noreferrer">
                view on Lichess ↗
              </a>
            </div>
          )}

          <div className="summary">
            <div className="stat"><span className="stat-n">{stats.solved}</span><span className="stat-label">Solved</span></div>
            <div className="stat"><span className="stat-n">{stats.streak}</span><span className="stat-label">Streak</span></div>
            <div className="stat"><span className="stat-n">{accuracy}%</span><span className="stat-label">Accuracy</span></div>
          </div>

          <div className="filters">
            <label>
              Theme
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                {PUZZLE_THEMES.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </label>
            <label>
              Difficulty
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {PUZZLE_DIFFICULTY.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </label>
            <button className="btn-ghost full" onClick={newPuzzle} disabled={status === 'loading'}>
              Apply &amp; load new
            </button>
            <p className="muted small">Theme filters use Lichess; if a theme needs login it may fall back to mixed.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
