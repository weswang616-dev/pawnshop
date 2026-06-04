import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chess } from 'chess.js'
import Board from './Board'
import SpeakButton from './SpeakButton'
import { getQueue, grade, stats, Rating } from '../lib/mistakes'

// Drill YOUR blunders (captured by Game Review) on spaced repetition until you stop making them.
export default function MistakesTrainer() {
  const [queue, setQueue] = useState(() => getQueue())
  const [idx, setIdx] = useState(0)
  const [st, setSt] = useState(() => stats())
  const [status, setStatus] = useState('review') // review | correct | revealed
  const [fen, setFen] = useState(null)
  const [arrow, setArrow] = useState([])
  const [note, setNote] = useState('')
  const chessRef = useRef(null)
  const attemptsRef = useRef(0)
  const current = queue[idx] || null

  useEffect(() => {
    if (!current) return
    chessRef.current = new Chess(current.meta.fen)
    setFen(current.meta.fen)
    setArrow([])
    setNote('')
    setStatus('review')
    attemptsRef.current = 0
  }, [current])

  function matches(from, to) {
    const u = current.meta.bestMove
    return u.slice(0, 2) === from && u.slice(2, 4) === to
  }

  function onDrop(from, to) {
    if (!current || status !== 'review') return false
    const promo = matches(from, to) ? current.meta.bestMove.slice(4) || undefined : 'q'
    let m
    try {
      m = chessRef.current.move({ from, to, promotion: promo })
    } catch {
      m = null
    }
    if (!m) return false
    const correct = matches(from, to) || chessRef.current.isCheckmate()
    if (!correct) {
      chessRef.current.undo()
      attemptsRef.current += 1
      setNote('✗ Not the move — try again, or show the answer.')
      return false
    }
    setFen(chessRef.current.fen())
    grade(current.meta.id, attemptsRef.current === 0 ? Rating.Good : Rating.Hard)
    setStatus('correct')
    return true
  }

  function reveal() {
    if (!current || status !== 'review') return
    const u = current.meta.bestMove
    setArrow([{ startSquare: u.slice(0, 2), endSquare: u.slice(2, 4), color: '#e8974f' }])
    grade(current.meta.id, Rating.Again)
    setStatus('revealed')
  }

  function next() {
    setArrow([])
    if (idx + 1 < queue.length) setIdx(idx + 1)
    else {
      setIdx(queue.length)
      setSt(stats())
    }
  }

  function reload() {
    setQueue(getQueue())
    setIdx(0)
    setSt(stats())
  }

  if (!queue.length || idx >= queue.length) {
    const hasAny = st.total > 0
    const done = hasAny && idx >= queue.length && queue.length > 0
    return (
      <div className="memorize-done">
        <div className="srs-stats">
          <Pill n={st.due} label="Due" />
          <Pill n={st.fresh} label="New" />
          <Pill n={st.learned} label="Learned" />
          <Pill n={st.total} label="Total" />
        </div>
        <div className="done-card big">
          <h2>{hasAny ? (done ? 'Session complete! ✓' : 'All caught up! 🎉') : 'No mistakes yet'}</h2>
          <p>
            {hasAny
              ? 'Your blunders come back right before you’d forget them. Keep drilling and they disappear from your games.'
              : 'Review some of your games — every blunder we find lands here as a flashcard you can drill until you stop making it.'}
          </p>
          {hasAny ? (
            <button className="btn-primary" onClick={reload}>Check for due cards</button>
          ) : (
            <Link to="/review" className="btn-primary">Go to Game Review →</Link>
          )}
        </div>
      </div>
    )
  }

  const m = current.meta
  return (
    <div className="trainer-layout">
      <div className="board-col">
        <Board
          fen={fen}
          onDrop={onDrop}
          orientation={m.color === 'w' ? 'white' : 'black'}
          allowDragging={status === 'review'}
          arrows={arrow}
          id="mistake-board"
        />
        <div className="controls">
          <span className="ply-counter">{idx + 1}/{queue.length}</span>
          {status === 'review' && <button onClick={reveal}>Show answer</button>}
          {status !== 'review' && <button className="btn-primary" onClick={next}>Next →</button>}
        </div>
      </div>
      <aside className="trainer-side">
        <div className="srs-stats">
          <Pill n={st.due} label="Due" />
          <Pill n={st.fresh} label="New" />
          <Pill n={st.learned} label="Learned" />
          <Pill n={st.total} label="Total" />
        </div>
        <div className={`idea-card ${status === 'correct' ? 'success' : status === 'revealed' ? 'error' : 'info'}`}>
          {status === 'review' ? (
            <p>
              You played <b>{m.played}</b> here — a blunder. <b>{m.color === 'w' ? 'White' : 'Black'} to move</b>: find
              the move you should have played.
            </p>
          ) : (
            <>
              <p>✅ <b>{m.bestSan || 'Best move'}</b>{m.reason ? ` — ${m.reason}` : ''}.</p>
              {m.lineSan?.length > 1 && (
                <p className="coach-line">Idea: <code>{m.lineSan.join(' ')}</code></p>
              )}
              <SpeakButton label="Hear why" text={`The right move was ${m.bestSan}. ${m.reason}.`} />
            </>
          )}
        </div>
        {status === 'review' && note && <p className="error small">{note}</p>}
        <p className="muted small">Your real blunders, on spaced repetition — drill them until they’re gone for good.</p>
      </aside>
    </div>
  )
}

function Pill({ n, label }) {
  return (
    <div className="pill">
      <span className="pill-n">{n}</span>
      <span className="pill-label">{label}</span>
    </div>
  )
}
