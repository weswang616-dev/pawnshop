import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board from '../components/Board'
import SpeakButton from '../components/SpeakButton'
import VoicePicker from '../components/VoicePicker'
import { speak, stopSpeaking } from '../lib/speak'
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
          <Study rep={rep} variation={variation} />
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
      <span className="weakness-eyebrow">⭐ Coach's pick — your sharpened repertoire</span>
      <p>
        You’re trading the London for the <b>Italian Game</b> as White{username ? `, ${username}` : ''} — a more
        instructive, tactical opening that keeps teaching you chess as you climb — and keeping the rock-solid{' '}
        <b>Caro-Kann</b> as Black. Your core repertoire (starred below): {picks.join(', ')}.
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
      <span className="muted small">Line for your opponent’s move:</span>
      <div className="variation-chips">
        {rep.variations.map((v, i) => (
          <button key={i} className={`var-chip ${value === i ? 'on' : ''}`} onClick={() => onSelect(i)}>
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
  const [autoSpeak, setAutoSpeak] = useLocalStorage('opening-autospeak', true)
  const current = step > 0 ? line[step - 1] : null

  const arrows = useMemo(() => {
    if (!current) return []
    const ft = sanToFromTo(positions[step - 1], current.move)
    return ft ? [{ startSquare: ft.from, endSquare: ft.to, color: current.by === 'w' ? '#7cb342' : '#5b8def' }] : []
  }, [current, step, positions])

  // Narrate each move (in plain English) as you step through, if auto-narrate is on.
  useEffect(() => {
    if (autoSpeak && current) speak(`${current.move}. ${current.idea}`)
    return () => stopSpeaking()
  }, [autoSpeak, current])

  const sideLabel = current ? (current.by === 'w' ? 'White' : 'Black') : ''

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
        <label className="toggle narrate-toggle">
          <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} />
          🔊 Narrate each move
        </label>
      </div>
      <aside className="trainer-side">
        {!current ? (
          <div className="idea-card info">
            <strong>{variation.name}</strong>
            {variation.plan && <p className="line-intro-plan">🎯 {variation.plan}</p>}
            <p className="muted small">You play {rep.color}. Press <b>Next</b> to walk the line and learn the idea behind every move.</p>
          </div>
        ) : (
          <div className="idea-card info">
            <span className="move-badge">
              {Math.ceil(step / 2)}{current.by === 'w' ? '.' : '…'} {current.move}
            </span>
            <p>{current.idea}</p>
            <SpeakButton text={`${sideLabel} plays ${current.move}. ${current.idea}`} label="Hear this move" />
          </div>
        )}
        <div className="why-card">
          <strong>Why this opening works</strong>
          <p>{rep.whyItWorks}</p>
          <SpeakButton text={`${rep.name}. ${rep.whyItWorks} ${rep.middlegame}`} label="Explain the opening" />
        </div>
        <VoicePicker />
        {step >= line.length && (
          <div className="done-card next-steps">
            <strong>🎯 Opening done — here’s what to do next</strong>
            {variation.plan && <p>{variation.plan}</p>}
            {variation.plan && (
              <SpeakButton
                text={`What to do after the opening in the ${variation.name} line. ${variation.plan}`}
                label="Hear what to do next"
              />
            )}
            <p className="muted small">
              You don’t need to memorize more moves — from here it’s about following this plan, improving your
              worst-placed piece, and keeping your king safe. See the full middlegame &amp; endgame plans below, or try
              the <b>Drill</b>.
            </p>
          </div>
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
    setMessage({
      type: 'success',
      text: variation.plan
        ? `🎉 Line complete — now you’re out of book. Your plan from here: ${variation.plan}`
        : '🎉 Variation complete! Reset to drill it again, or pick another variation.',
    })
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

function shortRepName(r) {
  if (r.id === 'italian-game') return 'Italian'
  if (r.id === 'caro-kann') return 'Caro-Kann'
  if (r.id === 'black-vs-d4-qgd') return 'QGD vs 1.d4'
  if (r.id === 'black-vs-e4-e5') return 'Open Game'
  return r.name
}

function MemorizePicker({ value, onSelect }) {
  return (
    <div className="variation-row memorize-pick">
      <span className="muted small">Memorize:</span>
      <div className="variation-chips">
        <button className={`var-chip ${value === '' ? 'on' : ''}`} onClick={() => onSelect('')}>All openings</button>
        {repertoires.map((r) => (
          <button key={r.id} className={`var-chip ${value === r.id ? 'on' : ''}`} onClick={() => onSelect(r.id)}>
            {r.color === 'white' ? '♔' : '♚'} {shortRepName(r)}
          </button>
        ))}
      </div>
    </div>
  )
}

function Memorize() {
  const [repFilter, setRepFilter] = useLocalStorage('memorize-rep', '')
  const [queue, setQueue] = useState(() => getQueue(repFilter || null))
  const [idx, setIdx] = useState(0)
  const [st, setSt] = useState(() => stats(repFilter || null))
  const [status, setStatus] = useState('review')
  const [fen, setFen] = useState(null)
  const [arrow, setArrow] = useState([])
  const [message, setMessage] = useState('')
  const chessRef = useRef(null)
  const attemptsRef = useRef(0)
  const hintRef = useRef(false)

  const current = queue[idx] || null

  function refresh() {
    setQueue(getQueue(repFilter || null))
    setIdx(0)
    setSt(stats(repFilter || null))
  }

  // Reload the deck whenever the opening filter changes.
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repFilter])

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
      setSt(stats(repFilter || null))
    }
  }

  if (!queue.length || idx >= queue.length) {
    const filtered = repFilter ? repertoires.find((r) => r.id === repFilter) : null
    const scope = filtered ? ` in the ${shortRepName(filtered)}` : ''
    const title = !queue.length ? 'All caught up! 🎉' : 'Session complete! ✓'
    const body = !queue.length
      ? `No moves are due${scope} right now. Learn a new variation, switch openings above, or come back later — FSRS resurfaces moves right before you’d forget them.`
      : 'You reviewed every due move. They’ll come back at the perfect time to stick.'
    return (
      <>
        <MemorizePicker value={repFilter} onSelect={setRepFilter} />
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
            <button className="btn-primary" onClick={refresh}>Check for due cards</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MemorizePicker value={repFilter} onSelect={setRepFilter} />
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
          Spaced repetition (FSRS) over {repFilter ? 'this opening' : 'your whole repertoire'} — every variation. Hard
          moves come back sooner. A few minutes a day keeps it all sharp.
        </p>
        </aside>
      </div>
    </>
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

function Study({ rep, variation }) {
  return (
    <section className="study">
      {variation?.plan && (
        <div className="study-col wide plan-highlight">
          <div className="study-head">
            <h2>🎯 Plan in this line — {variation.name}</h2>
            <SpeakButton text={`Your plan in the ${variation.name} line. ${variation.plan}`} label="Hear the plan" />
          </div>
          <p>{variation.plan}</p>
        </div>
      )}
      <div className="study-col wide">
        <div className="study-head">
          <h2>The opening’s overall strategy</h2>
          <SpeakButton text={`Overall strategy for the ${rep.name}. ${rep.middlegame}`} label="Explain the strategy" />
        </div>
        <p className="muted">{rep.middlegame}</p>
      </div>
      {rep.endgame && (
        <div className="study-col wide">
          <div className="study-head">
            <h2>The endgame plan</h2>
            <SpeakButton text={`Endgame plan for the ${rep.name}. ${rep.endgame}`} label="Explain the endgame" />
          </div>
          <p className="muted">{rep.endgame}</p>
        </div>
      )}
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
