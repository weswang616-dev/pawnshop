import { useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board from './Board'
import { getEngine } from '../lib/engine'
import { uciToMove } from '../lib/analysis'

// Skill is Stockfish's "Skill Level" (0–20). Stockfish is far stronger than 750 even at the floor,
// so "Easy" also plays an occasional random move to be genuinely beatable.
const LEVELS = [
  { key: 'easy', label: 'Easy', skill: 2, movetime: 300, blunder: 0.35 },
  { key: 'medium', label: 'Medium', skill: 6, movetime: 500, blunder: 0.12 },
  { key: 'hard', label: 'Hard', skill: 12, movetime: 700, blunder: 0 },
  { key: 'max', label: 'Max', skill: 20, movetime: 1000, blunder: 0 },
]

export default function PlayEngine() {
  const chessRef = useRef(new Chess())
  const busyRef = useRef(false)
  const [fen, setFen] = useState(chessRef.current.fen())
  const [userColor, setUserColor] = useState('white')
  const [level, setLevel] = useState('easy')
  const [status, setStatus] = useState('idle') // idle | playing | thinking | over
  const [result, setResult] = useState('')

  const me = userColor === 'white' ? 'w' : 'b'

  function checkOver() {
    const c = chessRef.current
    if (c.isCheckmate()) {
      setStatus('over')
      setResult(c.turn() === me ? 'Checkmate — you lost. 😬' : 'Checkmate — you win! 🎉')
      return true
    }
    if (c.isStalemate()) {
      setStatus('over')
      setResult('Stalemate — draw.')
      return true
    }
    if (c.isInsufficientMaterial() || c.isThreefoldRepetition() || c.isDraw()) {
      setStatus('over')
      setResult('Draw.')
      return true
    }
    return false
  }

  async function engineMove() {
    busyRef.current = true
    setStatus('thinking')
    const lv = LEVELS.find((l) => l.key === level) || LEVELS[0]
    try {
      if (lv.blunder && Math.random() < lv.blunder) {
        const moves = chessRef.current.moves({ verbose: true })
        if (moves.length) chessRef.current.move(moves[Math.floor(Math.random() * moves.length)])
      } else {
        const r = await getEngine().evaluate(chessRef.current.fen(), { skill: lv.skill, movetime: lv.movetime })
        if (r.bestMove) chessRef.current.move(uciToMove(r.bestMove))
      }
      setFen(chessRef.current.fen())
    } catch {
      /* ignore */
    }
    busyRef.current = false
    if (!checkOver()) setStatus('playing')
  }

  function newGame(color) {
    chessRef.current = new Chess()
    busyRef.current = false
    setFen(chessRef.current.fen())
    setResult('')
    setUserColor(color)
    setStatus('playing')
    if (color === 'black') engineMove() // engine (White) moves first
  }

  function onDrop(from, to) {
    if (status !== 'playing' || busyRef.current) return false
    if (chessRef.current.turn() !== me) return false
    let m
    try {
      m = chessRef.current.move({ from, to, promotion: 'q' })
    } catch {
      m = null
    }
    if (!m) return false
    setFen(chessRef.current.fen())
    if (!checkOver()) engineMove()
    return true
  }

  const turnText =
    status === 'thinking'
      ? 'Engine is thinking…'
      : status === 'over'
        ? result
        : status === 'playing'
          ? chessRef.current.turn() === me
            ? 'Your move.'
            : 'Engine to move…'
          : 'Pick a side below to start a game.'

  return (
    <div className="trainer-layout">
      <div className="board-col">
        <Board fen={fen} onDrop={onDrop} orientation={userColor} allowDragging={status === 'playing'} id="play-board" />
        <div className="controls">
          <button onClick={() => newGame('white')}>♔ New game as White</button>
          <button onClick={() => newGame('black')}>♚ as Black</button>
        </div>
      </div>
      <aside className="trainer-side">
        <div className="seg">
          {LEVELS.map((l) => (
            <button key={l.key} className={level === l.key ? 'on' : ''} onClick={() => setLevel(l.key)}>
              {l.label}
            </button>
          ))}
        </div>
        <div className={`idea-card ${status === 'over' ? (result.includes('win') ? 'success' : 'info') : 'info'}`}>
          <p>{turnText}</p>
        </div>
        <p className="muted small">
          Play full games at your level (click or drag). Lost? Import the game in <b>Game Review</b> to see exactly
          where it went wrong — and it'll feed your mistake flashcards.
        </p>
      </aside>
    </div>
  )
}
