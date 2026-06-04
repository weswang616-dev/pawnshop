import { useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board from './Board'
import SpeakButton from './SpeakButton'
import { endgames } from '../lib/endgames'
import { getEngine } from '../lib/engine'
import { uciToMove } from '../lib/analysis'

// You play the strong side (White); the engine defends at full strength.
export default function EndgameTrainer() {
  const [idx, setIdx] = useState(0)
  const eg = endgames[idx]
  const chessRef = useRef(new Chess(eg.fen))
  const busyRef = useRef(false)
  const [fen, setFen] = useState(eg.fen)
  const [status, setStatus] = useState('playing') // playing | thinking | won | failed
  const [note, setNote] = useState('')

  function load(i) {
    const e = endgames[i]
    chessRef.current = new Chess(e.fen)
    busyRef.current = false
    setIdx(i)
    setFen(e.fen)
    setStatus('playing')
    setNote('')
  }

  function outcome() {
    const c = chessRef.current
    if (c.isCheckmate()) {
      if (c.turn() !== 'w') {
        setStatus('won')
        setNote('Checkmate — beautifully done! 🎉')
      } else {
        setStatus('failed')
        setNote('You got checkmated. Reset and try the technique again.')
      }
      return true
    }
    if (c.isStalemate()) {
      setStatus('failed')
      setNote('Stalemate — that’s only a draw! Always leave the king one legal square until the mating move. Reset to retry.')
      return true
    }
    if (c.isInsufficientMaterial()) {
      setStatus('failed')
      setNote('You lost your winning material — it’s a draw now. Reset to retry.')
      return true
    }
    return false
  }

  async function engineMove() {
    busyRef.current = true
    setStatus('thinking')
    try {
      const r = await getEngine().evaluate(chessRef.current.fen(), { skill: 20, movetime: 600 })
      if (r.bestMove) {
        chessRef.current.move(uciToMove(r.bestMove))
        setFen(chessRef.current.fen())
      }
    } catch {
      /* ignore */
    }
    busyRef.current = false
    if (!outcome()) setStatus('playing')
  }

  function onDrop(from, to) {
    if (status !== 'playing' || busyRef.current) return false
    if (chessRef.current.turn() !== 'w') return false
    let m
    try {
      m = chessRef.current.move({ from, to, promotion: 'q' })
    } catch {
      m = null
    }
    if (!m) return false
    setFen(chessRef.current.fen())
    if (eg.goal === 'promote' && (m.flags.includes('p') || m.promotion)) {
      setStatus('won')
      setNote('Promoted! 🎉 You escorted the pawn home — now it’s an easy win.')
      return true
    }
    if (outcome()) return true
    engineMove()
    return true
  }

  return (
    <div>
      <div className="variation-row">
        <span className="muted small">Endgame:</span>
        <div className="seg">
          {endgames.map((e, i) => (
            <button key={e.id} className={idx === i ? 'on' : ''} onClick={() => load(i)}>
              {e.name}
            </button>
          ))}
        </div>
      </div>
      <div className="trainer-layout">
        <div className="board-col">
          <Board fen={fen} onDrop={onDrop} orientation="white" allowDragging={status === 'playing'} id="endgame-board" />
          <div className="controls">
            <button onClick={() => load(idx)}>↺ Reset</button>
            <span className="muted small">Goal: {eg.goal === 'mate' ? 'checkmate the king' : 'promote your pawn'}</span>
          </div>
        </div>
        <aside className="trainer-side">
          <div className={`idea-card ${status === 'won' ? 'success' : status === 'failed' ? 'error' : 'info'}`}>
            <strong>{eg.name}</strong>
            <p>{status === 'thinking' ? 'Engine defends…' : note || eg.blurb}</p>
          </div>
          <div className="why-card">
            <strong>Technique</strong>
            <p>{eg.tips}</p>
            <SpeakButton text={`${eg.name}. ${eg.tips}`} label="Explain the technique" />
          </div>
        </aside>
      </div>
    </div>
  )
}
