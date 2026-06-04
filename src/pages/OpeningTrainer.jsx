import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board from '../components/Board'
import SpeakButton from '../components/SpeakButton'
import { repertoires, getRepertoire } from '../lib/repertoires'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getQueue, grade, stats, Rating } from '../lib/srs'

function positionsFor(line) {
  const c = new Chess()
  const out = [c.fen()]
  for (const ply of line) {
    c.move(ply.move)
    out.push(c.fen())
  }
  return out
}

function sanToFromTo(fen, san) {
  try {
    const c = new Chess(fen)
    const m = c.move(san)
    return m ? { from: m.from, to: m.to } : null
  } catch {
    return null
  }
}

export default function OpeningTrainer() {
  const [mode, setMode] = useState('learn')
  const [repId, setRepId] = useLocalStorage('rep-selected', repertoires[0].id)
  const [variationIdx, setVariationIdx] = useState(0)
  const rep = getRepertoire(repId)
  const variation = rep.variations[Math.min(variationIdx, rep.variations.length - 1)] || rep.variations[0]

  function selectRep(id) {
    setRepId(id)
    setVariationIdx(0)
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Repertoire Trainer</h1>
        <p className="muted">
          Learn an opening, drill every variation, then lock it into long-term memory with spaced repetition.
        </p>
        <div className="seg big">
          <button className={mode === 'learn' ? 'on' : ''} onClick={() => setMode('learn')}>📖 Learn</button>
          <button className={mode === 'drill' ? 'on' : ''} onClick={() => setMode('drill')}>🎯 Drill</button>
          <button className={mode === 'memorize' ? 'on' : ''} onClick={() => setMode('memorize')}>🧠 Memorize</button>
        </div>
      </div>

      {mode === 'memorize' ? (
        <Memorize />
      ) : (
        <>
          <CoachPick />
          <RepPicker value={repId} onSelect={selectRep} />
          <VariationPicker rep={rep} value={variationIdx} onSelect={setVariationIdx} />
          {mode === 'learn' ? (
            <Learn key={rep.id + variationIdx} rep={rep} variation={variation} />
          ) : (
            <Drill key={rep.id + variationIdx} rep={rep} variation={variation} />
          )}
          <Study rep={rep} />
        </>
      )}
    </div>
  )
}

function CoachPick() {
  const [username] = useLocalStorage('chesscom-username', '')
  const picks = repertoires.filter((r) => r.recommended).map((r) => r.name)
  return (
    <div className="coach-pick">
      <span className="weakness-eyebrow">⭐ Coach's pick — matched to how you actually play</span>
      <p>
        From your chess.com games{username ? ` (${username})` : ''}: you play <b>1.d4</b> as White and the{' '}
        <b>Caro-Kann</b> as Black — and you score best with them. Your core repertoire (starred below):{' '}
        {picks.join(', ')}.
      </p>
    </div>
  )
}

function RepPicker({ value, onSelect }) {
  return (
    <div className="rep-picker wide-picker">
      {repertoires.map((r) => (
        <button key={r.id} className={`rep-btn ${value === r.id ? 'on' : ''}`} onClick={() => onSelect(r.id)}>
          <span className="rep-side">
            {r.color === 'white' ? '♔ White' : '♚ Black'} {r.recommended && <span className="star">⭐</span>}
          </span>
          <span className="rep-name">{r.name}</span>
        </button>
      ))}
    </div>
  )
}

function VariationPicker({ rep, value, onSelect }) {
  return (
    <div className="variation-row">
      <span className="muted small">Variation:</span>
      <div className="seg">
        {rep.variations.map((v, i) => (
          <button key={i} className={value === i ? 'on' : ''} onClick={() => onSelect(i)}>
            {v.name}
          </button>
        ))}
      </div>
    </div>
  )
}

function Learn({ rep, variation }) {
  const line = variation.line
  const positions = useMemo(() => positionsFor(line), [line])
  const [step, setStep] = useState(0)
  const current = step > 0 ? line[step - 1] : null

  const arrows = useMemo(() => {
    if (!current) return []
    const ft = sanToFromTo(positions[step - 1], current.move)
    return ft ? [{ startSquare: ft.from, endSquare: ft.to, color: current.by === 'w' ? '#7cb342' : '#5b8def' }] : []
  }, [current, step, positions])

  return (
    <div className="trainer-layout">
      <div className="board-col">
        <Board fen={positions[step]} orientation={rep.color} allowDragging={false} arrows={arrows} id="learn-board" />
        <div className="controls">
          <button onClick={() => setStep(0)} disabled={step === 0}>⏮</button>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>‹ Back</button>
          <span className="ply-counter">{step}/{line.length}</span>
          <button onClick={() => setStep((s) => Math.min(line.length, s + 1))} disabled={step >= line.length}>Next ›</button>
        </div>
      </div>
      <aside className="trainer-side">
        {!current ? (
          <div className="idea-card info">
            <strong>{variation.name}</strong>
            <p>You play {rep.color}. Press <b>Next</b> to walk this line and learn the idea behind every move.</p>
          </div>
        ) : (
          <div className="idea-card info">
            <span className="move-badge">
              {Math.ceil(step / 2)}{current.by === 'w' ? '.' : '…'} {current.move}
            </span>
            <p>{current.idea}</p>
          </div>
        )}
        <div className="why-card">
          <strong>Why this opening works</strong>
          <p>{rep.whyItWorks}</p>
          <SpeakButton text={`${rep.name}. ${rep.whyItWorks} ${rep.middlegame}`} label="Explain the opening" />
        </div>
        {step >= line.length && (
          <div className="done-card">End of this line — try another variation, the <b>Drill</b>, or <b>Memorize</b>. 🧠</div>
        )}
      </aside>
    </div>
  )
}

function Drill({ rep, variation }) {
  const userColor = rep.color === 'white' ? 'w' : 'b'
  const line = variation.line
  const chessRef = useRef(new Chess())
  const busyRef = useRef(false)
  const [fen, setFen] = useState(chessRef.current.fen())
  const [step, setStep] = useState(0)
  const [hint, setHint] = useState(false)
  const [message, setMessage] = useState({ type: 'info', text: '' })
  const [completions, setCompletions] = useLocalStorage(`drill-completions:${rep.id}:${variation.name}`, 0)

  function finish() {
    setMessage({ type: 'success', text: '🎉 Variation complete! Reset to drill it again, or pick another variation.' })
    setCompletions((c) => c + 1)
  }

  function playOpponent(fromStep) {
    let s = fromStep
    const step1 = () => {
      if (s >= line.length) {
        setStep(s)
        finish()
        return
      }
      if (line[s].by === userColor) {
        setStep(s)
        setMessage({ type: 'info', text: 'Your move — recall the next move.' })
        return
      }
      chessRef.current.move(line[s].move)
      setFen(chessRef.current.fen())
      s += 1
      busyRef.current = true
      setTimeout(() => {
        busyRef.current = false
        step1()
      }, 350)
    }
    busyRef.current = true
    setTimeout(() => {
      busyRef.current = false
      step1()
    }, 300)
  }

  function startOver() {
    chessRef.current = new Chess()
    busyRef.current = false
    setFen(chessRef.current.fen())
    setHint(false)
    setStep(0)
    setMessage({
      type: 'info',
      text: userColor === 'w' ? 'You play White. Make the first move.' : 'You play Black. White moves first…',
    })
    if (line[0] && line[0].by !== userColor) playOpponent(0)
  }

  useEffect(() => {
    startOver()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onDrop(from, to) {
    if (busyRef.current || step >= line.length) return false
    const expected = line[step]
    if (!expected || expected.by !== userColor) return false
    const exp = sanToFromTo(chessRef.current.fen(), expected.move)
    let move
    try {
      move = chessRef.current.move({ from, to, promotion: 'q' })
    } catch {
      move = null
    }
    if (!move) return false
    if (!exp || move.from !== exp.from || move.to !== exp.to) {
      chessRef.current.undo()
      setMessage({ type: 'error', text: `Not the book move. This line plays ${expected.move} — ${expected.idea}` })
      return false
    }
    setFen(chessRef.current.fen())
    setHint(false)
    setMessage({ type: 'success', text: `${expected.move}: ${expected.idea}` })
    playOpponent(step + 1)
    return true
  }

  const expected = step < line.length ? line[step] : null
  const hintArrow = useMemo(() => {
    if (!hint || !expected || expected.by !== userColor) return []
    const ft = sanToFromTo(fen, expected.move)
    return ft ? [{ startSquare: ft.from, endSquare: ft.to, color: '#7cb342' }] : []
  }, [hint, expected, fen, userColor])

  return (
    <div className="trainer-layout">
      <div className="board-col">
        <Board fen={fen} onDrop={onDrop} orientation={rep.color} allowDragging arrows={hintArrow} id="drill-board" />
        <div className="controls">
          <button onClick={startOver}>↺ Reset</button>
          <button onClick={() => setHint(true)} disabled={step >= line.length}>💡 Hint</button>
          <span className="muted small">Completed {completions}×</span>
        </div>
      </div>
      <aside className="trainer-side">
        <div className={`idea-card ${message.type}`}>
          <p>{message.text}</p>
        </div>
        <div className="progress thin">
          <div className="progress-bar" style={{ width: `${Math.round((step / line.length) * 100)}%` }} />
        </div>
        <p className="muted small">Click a piece then a square, or drag. I play the other side; wrong moves are explained.</p>
      </aside>
    </div>
  )
}

function Memorize() {
  const [queue, setQueue] = useState(() => getQueue())
  const [idx, setIdx] = useState(0)
  const [st, setSt] = useState(() => stats())
  const [status, setStatus] = useState('review')
  const [fen, setFen] = useState(null)
  const [arrow, setArrow] = useState([])
  const [message, setMessage] = useState('')
  const chessRef = useRef(null)
  const attemptsRef = useRef(0)
  const hintRef = useRef(false)

  const current = queue[idx] || null

  useEffect(() => {
    if (!current) return
    chessRef.current = new Chess(current.meta.fen)
    setFen(current.meta.fen)
    setArrow([])
    setStatus('review')
    setMessage('Your move — recall your repertoire.')
    attemptsRef.current = 0
    hintRef.current = false
  }, [current])

  function expectedFromTo() {
    return sanToFromTo(current.meta.fen, current.meta.move)
  }

  function reloadQueue() {
    setQueue(getQueue())
    setIdx(0)
    setSt(stats())
  }

  function onDrop(from, to) {
    if (!current || status !== 'review') return false
    const exp = expectedFromTo()
    let move
    try {
      move = chessRef.current.move({ from, to, promotion: 'q' })
    } catch {
      move = null
    }
    if (!move) return false
    if (!exp || move.from !== exp.from || move.to !== exp.to) {
      chessRef.current.undo()
      attemptsRef.current += 1
      setMessage('✗ Not your line — try again, or reveal the answer.')
      return false
    }
    setFen(chessRef.current.fen())
    const rating = attemptsRef.current === 0 && !hintRef.current ? Rating.Good : Rating.Hard
    grade(current.meta.id, rating)
    setStatus('correct')
    setMessage(`✓ ${current.meta.move} — ${current.meta.idea}`)
    return true
  }

  function hint() {
    if (!current || status !== 'review') return
    const exp = expectedFromTo()
    if (exp) setArrow([{ startSquare: exp.from, endSquare: exp.to, color: '#e8974f' }])
    hintRef.current = true
  }

  function reveal() {
    if (!current || status !== 'review') return
    const exp = expectedFromTo()
    if (exp) setArrow([{ startSquare: exp.from, endSquare: exp.to, color: '#e8974f' }])
    grade(current.meta.id, Rating.Again)
    setStatus('revealed')
    setMessage(`The move is ${current.meta.move} — ${current.meta.idea}`)
  }

  function next() {
    setArrow([])
    if (idx + 1 < queue.length) setIdx(idx + 1)
    else {
      setIdx(queue.length)
      setSt(stats())
    }
  }

  if (!queue.length || idx >= queue.length) {
    const title = !queue.length ? 'All caught up! 🎉' : 'Session complete! ✓'
    const body = !queue.length
      ? 'No moves are due right now. Learn a new variation, or come back later — FSRS resurfaces moves right before you’d forget them.'
      : 'You reviewed every due move. They’ll come back at the perfect time to stick.'
    return (
      <div className="memorize-done">
        <div className="srs-stats">
          <Pill n={st.due} label="Due" />
          <Pill n={st.fresh} label="New" />
          <Pill n={st.learned} label="Learned" />
          <Pill n={st.total} label="Total" />
        </div>
        <div className="done-card big">
          <h2>{title}</h2>
          <p>{body}</p>
          <button className="btn-primary" onClick={reloadQueue}>Check for due cards</button>
        </div>
      </div>
    )
  }

  return (
    <div className="trainer-layout">
      <div className="board-col">
        <Board
          fen={fen}
          onDrop={onDrop}
          orientation={current.meta.color}
          allowDragging={status === 'review'}
          arrows={arrow}
          id="srs-board"
        />
        <div className="controls">
          <span className="ply-counter">{idx + 1}/{queue.length}</span>
          {status === 'review' && <button onClick={hint}>💡 Hint</button>}
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
          <span className="move-badge">{current.meta.repName}</span>
          <p>{message}</p>
        </div>
        <p className="muted small">
          Spaced repetition across your <b>whole</b> repertoire (FSRS) — every variation of every opening. Hard moves
          come back sooner. A few minutes a day keeps it all sharp.
        </p>
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

function Study({ rep }) {
  return (
    <section className="study">
      <div className="study-col wide">
        <div className="study-head">
          <h2>Middlegame plans</h2>
          <SpeakButton text={`Middlegame plans for the ${rep.name}. ${rep.middlegame}`} label="Explain the plans" />
        </div>
        <p className="muted">{rep.middlegame}</p>
      </div>
      <div className="study-col">
        <h2>Plans &amp; ideas</h2>
        <ul>
          {rep.plans.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
      <div className="study-col">
        <h2>Traps to avoid</h2>
        <ul>
          {rep.traps.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
      <div className="study-col wide">
        <h2>When the opponent goes off-book</h2>
        <p className="muted">{rep.offBook}</p>
      </div>
    </section>
  )
}
