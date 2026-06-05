import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chess } from 'chess.js'
import Board from './Board'
import { getEngine } from '../lib/engine'
import { centipawnLoss } from '../lib/analysis'
import { getAll } from '../lib/mistakes'
import { useLocalStorage } from '../hooks/useLocalStorage'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// "Is it safe?" — replays YOUR real blunder positions and trains the blunder-check habit. Unlike
// the SRS Mistakes Trainer (which wants the single best move), this accepts ANY safe move and
// grades it live with Stockfish: did your move lose material / walk into a tactic? That's the
// real-game skill — you don't need the best move, just one that doesn't lose.
export default function BlunderCheck() {
  const positions = useMemo(() => shuffle(getAll()), [])
  const [idx, setIdx] = useState(0)
  const [fen, setFen] = useState(null)
  const [orientation, setOrientation] = useState('white')
  const [status, setStatus] = useState('ready') // ready | grading | graded
  const [message, setMessage] = useState({ type: 'info', text: '' })
  const [arrow, setArrow] = useState([])
  const [stats, setStats] = useLocalStorage('blundercheck-stats', { attempts: 0, safe: 0 })

  const chessRef = useRef(null)
  const beforeRef = useRef({ fen: null, evalObj: null })

  const current = positions.length ? positions[idx % positions.length] : null

  async function prefetch(fen) {
    beforeRef.current = { fen, evalObj: null }
    try {
      const r = await getEngine().evaluate(fen, { movetime: 350 })
      if (beforeRef.current.fen === fen) beforeRef.current.evalObj = { cp: r.cp, mate: r.mate }
    } catch {
      /* engine optional — fallback grading below */
    }
  }

  useEffect(() => {
    if (!current) return
    chessRef.current = new Chess(current.fen)
    setFen(current.fen)
    setOrientation(current.color === 'w' ? 'white' : 'black')
    setStatus('ready')
    setArrow([])
    setMessage({
      type: 'info',
      text: `${current.color === 'w' ? 'White' : 'Black'} to move — is it safe? Play a move that doesn’t lose anything.`,
    })
    prefetch(current.fen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  function safeMoveArrow() {
    if (!current?.bestMove) return
    setArrow([{ startSquare: current.bestMove.slice(0, 2), endSquare: current.bestMove.slice(2, 4), color: '#7cb342' }])
  }

  async function onDrop(from, to) {
    if (status !== 'ready') return false
    const c = chessRef.current
    let move
    try {
      move = c.move({ from, to, promotion: 'q' })
    } catch {
      move = null
    }
    if (!move) return false
    const fenAfter = c.fen()
    setFen(fenAfter)
    setArrow([{ startSquare: from, endSquare: to, color: '#5b8def' }])
    setStatus('grading')
    setMessage({ type: 'info', text: 'Checking if that’s safe…' })

    let loss = null
    try {
      let before = beforeRef.current.fen === current.fen ? beforeRef.current.evalObj : null
      if (!before) {
        const rb = await getEngine().evaluate(current.fen, { movetime: 350 })
        before = { cp: rb.cp, mate: rb.mate }
      }
      const ra = await getEngine().evaluate(fenAfter, { movetime: 350 })
      loss = centipawnLoss(before, { cp: ra.cp, mate: ra.mate }, current.color === 'w')
    } catch {
      /* engine unavailable — loss stays null; we fall back to the stored best/blunder moves below */
    }

    const playedOriginal = move.san === current.played
    let safe
    if (loss == null) {
      // Engine unavailable — fall back to comparing against the known best/blunder moves.
      safe = move.san === current.bestSan
      if (move.san === current.bestSan) setMessage({ type: 'success', text: `✓ Safe — that’s the engine’s move, ${current.bestSan}.` })
      else if (playedOriginal) setMessage({ type: 'error', text: `✗ That’s the move you played in your game — ${current.reason || 'it loses'}. Safe was ${current.bestSan}.` })
      else setMessage({ type: 'info', text: `Couldn’t reach the engine. The safe move here was ${current.bestSan || 'a quiet developing move'}.` })
    } else {
      safe = loss < 120
      const pawns = (loss / 100).toFixed(1)
      if (loss < 60) setMessage({ type: 'success', text: `✓ Safe! Nothing hangs. (Engine’s pick: ${current.bestSan || '—'}.)` })
      else if (loss < 120) setMessage({ type: 'success', text: `✓ Safe enough — a touch loose, but nothing lost. Cleanest was ${current.bestSan || '—'}.` })
      else {
        const desc = loss >= 800 ? 'loses decisive material (or walks into mate)' : `loses about ${pawns} pawns`
        setMessage({ type: 'error', text: `✗ Not safe — that ${desc}${playedOriginal ? ' (the exact move you played in your game!)' : ''}. A safe move was ${current.bestSan || 'the engine line'}.` })
      }
      if (!safe) safeMoveArrow()
    }

    setStats((s) => ({ attempts: s.attempts + 1, safe: s.safe + (safe ? 1 : 0) }))
    setStatus('graded')
    return true
  }

  function reveal() {
    if (status !== 'ready') return
    safeMoveArrow()
    setMessage({ type: 'info', text: `A safe move here is ${current.bestSan || 'a quiet developing move'}${current.reason ? ` — your blunder ${current.reason}` : ''}.` })
    setStatus('graded')
  }

  function next() {
    setIdx((i) => i + 1)
  }

  if (!positions.length) {
    return (
      <div className="trainer-side" style={{ maxWidth: 460, margin: '0 auto' }}>
        <div className="weakness-card muted-card">
          <span className="weakness-eyebrow">🛡️ Blunder Check</span>
          <p className="muted small">
            This drill uses the real positions where you’ve hung pieces. Review a few games in{' '}
            <b>Game Review</b> first to collect them — then come back and train your safety radar.
          </p>
          <Link to="/review" className="btn-primary full">Go to Game Review →</Link>
        </div>
      </div>
    )
  }

  const safeRate = stats.attempts ? Math.round((stats.safe / stats.attempts) * 100) : 0

  return (
    <div className="trainer-layout">
      <div className="board-col">
        <div className="board-area">
          <Board
            fen={fen}
            onDrop={onDrop}
            orientation={orientation}
            allowDragging={status === 'ready'}
            arrows={arrow}
            id="blundercheck-board"
          />
        </div>
        <div className="controls">
          <button onClick={reveal} disabled={status !== 'ready'}>Show a safe move</button>
          {status === 'graded' ? (
            <button className="btn-primary" onClick={next}>Next position →</button>
          ) : (
            <button onClick={next}>Skip</button>
          )}
        </div>
      </div>
      <aside className="trainer-side">
        <div className="wp-head">
          <strong>🛡️ Is it safe?</strong>
          <span className="muted small">Before you move, ask: does this hang anything? What’s the threat?</span>
        </div>
        <div className={`idea-card ${message.type}`}>
          <p>{message.text}</p>
        </div>
        <div className="summary">
          <div className="stat"><span className="stat-n">{stats.attempts}</span><span className="stat-label">Checked</span></div>
          <div className="stat"><span className="stat-n">{stats.safe}</span><span className="stat-label">Stayed safe</span></div>
          <div className="stat accuracy"><span className="stat-n">{safeRate}%</span><span className="stat-label">Safe rate</span></div>
        </div>
        <p className="muted small">
          From your own games. Any move that doesn’t lose counts as safe — in a real game you don’t need the best move,
          just one that doesn’t hang.
        </p>
      </aside>
    </div>
  )
}
