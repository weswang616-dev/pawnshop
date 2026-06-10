import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board from './Board'
import VoicePicker from './VoicePicker'
import { speak, stopSpeaking, speechSupported } from '../lib/speak'
import { buildLesson, readMs } from '../lib/lesson'
import { useLocalStorage } from '../hooks/useLocalStorage'

// A "YouTube video you have to follow": the lesson auto-plays — board animates each move,
// the coach voice narrates the idea — and pauses at drill checkpoints where YOU replay the
// moves you just learned before the video continues. Play/pause, a seekable chapter
// timeline, captions, and playback speed, all client-side (Web Speech API).

const SPEEDS = [
  { label: '0.8×', value: 0.8 },
  { label: '1×', value: 1 },
  { label: '1.25×', value: 1.25 },
  { label: '1.5×', value: 1.5 },
]

function sanToFromTo(fen, san) {
  try {
    const m = new Chess(fen).move(san)
    return m ? { from: m.from, to: m.to } : null
  } catch {
    return null
  }
}

export default function LessonPlayer({ rep, variation, gameMoments }) {
  const lesson = useMemo(() => buildLesson(rep, variation, gameMoments), [rep, variation, gameMoments])
  const { segments: segs, line, userColor } = lesson
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [rate, setRate] = useLocalStorage('lesson-speed', 1)

  // Drill (checkpoint) state.
  const chessRef = useRef(null)
  const [drillFen, setDrillFen] = useState(null)
  const [drillStep, setDrillStep] = useState(0)
  const [drillDone, setDrillDone] = useState(false)
  const [drillMsg, setDrillMsg] = useState({ type: 'info', text: '' })
  const [hintArrow, setHintArrow] = useState([])

  // Token guards every async continuation (speech onEnd, fallback timers, opponent replies)
  // so seeking/pausing/unmounting can invalidate anything still in flight.
  const tokenRef = useRef(0)
  const timerRef = useRef(null)

  const seg = segs[idx]
  const isDrill = seg?.type === 'drill'

  // The "📺 Your games" moments load async and get INSERTED at `gamesAt`, shifting the tail
  // (final test, wrap-up). Segments before `gamesAt` are deterministic for the same
  // rep+variation (the component is remounted via its key when those change), so only an
  // index in the tail needs to move with the insertion.
  const prevLessonRef = useRef(lesson)
  useEffect(() => {
    const prev = prevLessonRef.current
    prevLessonRef.current = lesson
    const grown = lesson.segments.length - prev.segments.length
    if (prev !== lesson && grown > 0) {
      setIdx((i) => (i >= lesson.gamesAt ? i + grown : i))
    }
  }, [lesson])

  function bump() {
    tokenRef.current += 1
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    stopSpeaking()
  }

  // Speak `text`, then run `then` — unless the segment changed in the meantime.
  // Falls back to a reading-time timer when the browser has no speech synthesis — or when
  // speech "ends" near-instantly, which means the engine has no usable voice (common on
  // Linux Chrome): without this the whole lesson would race by in seconds.
  function narrate(text, then) {
    const tok = ++tokenRef.current
    const started = Date.now()
    const holdMs = readMs(text) / rate
    const finish = () => {
      if (tokenRef.current === tok && then) then()
    }
    const onSpeechEnd = () => {
      if (tokenRef.current !== tok) return
      const elapsed = Date.now() - started
      if (elapsed < Math.min(1500, holdMs / 4)) timerRef.current = setTimeout(finish, holdMs - elapsed)
      else finish()
    }
    const spoke = speechSupported && speak(text, onSpeechEnd, { rate })
    if (!spoke) timerRef.current = setTimeout(finish, holdMs)
  }

  function goTo(i, keepPlaying = playing) {
    bump()
    setEnded(false)
    setIdx(Math.max(0, Math.min(segs.length - 1, i)))
    setPlaying(keepPlaying)
  }

  // ---- Narration segments: speak, then auto-advance (the "video" loop) ----
  useEffect(() => {
    if (!seg || isDrill || !playing) return
    narrate(seg.speech, () => {
      if (idx + 1 < segs.length) setIdx(idx + 1)
      else {
        setPlaying(false)
        setEnded(true)
      }
    })
    return bump
    // Depend on the segment's CONTENT (speech), not its identity: a lesson rebuild when the
    // game moments arrive re-creates equal segment objects and must not restart narration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, playing, rate, seg?.speech])

  // ---- Drill checkpoints: rewind the board, prompt, and wait for the user's moves ----
  useEffect(() => {
    if (!isDrill) return
    if (seg.drillKind === 'fix') {
      // "Your games" fix-it drill: a standalone position, one correct move, no replies.
      chessRef.current = new Chess(seg.fen)
      setDrillFen(seg.fen)
    } else {
      const c = new Chess()
      for (let i = 0; i < seg.startStep; i += 1) c.move(line[i].move)
      chessRef.current = c
      setDrillFen(c.fen())
      setDrillStep(seg.startStep)
    }
    setDrillDone(false)
    setHintArrow([])
    setDrillMsg({ type: 'info', text: seg.caption })
    narrate(seg.speech, () => {
      if (seg.drillKind === 'fix') setDrillMsg({ type: 'info', text: 'Your move — what does the book play here?' })
      else advanceOpponent(seg.startStep)
    })
    return bump
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, seg?.speech])

  // Auto-play the other side's moves until it's the user's turn (or the chunk is done).
  // The delay keeps the "✓ your move" feedback readable before the reply lands.
  function advanceOpponent(step, lastReply) {
    if (step >= seg.endStep) return finishDrill()
    const ply = line[step]
    if (ply.by === userColor) {
      setDrillMsg({
        type: 'info',
        text: lastReply ? `${lastReply} — your move.` : 'Your move — play it from memory.',
      })
      return
    }
    const tok = tokenRef.current
    timerRef.current = setTimeout(() => {
      if (tokenRef.current !== tok) return
      chessRef.current.move(ply.move)
      setDrillFen(chessRef.current.fen())
      setDrillStep(step + 1)
      advanceOpponent(step + 1, ply.move)
    }, 900)
  }

  function finishDrill(text = '✓ Checkpoint passed!') {
    setDrillDone(true)
    setDrillMsg({ type: 'success', text })
    narrate('Nice work. Rolling on.', () => {
      setPlaying(true)
      setIdx((i) => Math.min(segs.length - 1, i + 1))
    })
  }

  function onDrop(from, to) {
    if (!isDrill || drillDone) return false
    if (seg.drillKind === 'fix') {
      let move
      try {
        move = chessRef.current.move({ from, to, promotion: 'q' })
      } catch {
        move = null
      }
      if (!move) return false
      if (!seg.acceptSans.includes(move.san)) {
        chessRef.current.undo()
        setDrillMsg({ type: 'error', text: 'Not the book move — try again, or take a hint.' })
        speak('Not quite. Try again.', null, { rate })
        return false
      }
      setDrillFen(chessRef.current.fen())
      setHintArrow([])
      finishDrill(`✓ ${move.san} — ${seg.idea}`)
      return true
    }
    if (drillStep >= seg.endStep) return false
    const expected = line[drillStep]
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
      setDrillMsg({ type: 'error', text: 'Not the book move — try again, or take a hint.' })
      speak('Not quite. Try again.', null, { rate })
      return false
    }
    setDrillFen(chessRef.current.fen())
    setHintArrow([])
    setDrillStep(drillStep + 1)
    setDrillMsg({ type: 'success', text: `✓ ${expected.move} — ${expected.idea}` })
    advanceOpponent(drillStep + 1)
    return true
  }

  function hint() {
    const expectedSan = seg?.drillKind === 'fix' ? seg.expectedSan : line[drillStep]?.move
    if (!expectedSan) return
    const ft = sanToFromTo(chessRef.current.fen(), expectedSan)
    if (ft) setHintArrow([{ startSquare: ft.from, endSquare: ft.to, color: '#e8974f' }])
  }

  // Chapters = the named waypoints (intro, drills, plan, strategy, wrap-up).
  const chapters = useMemo(
    () => segs.map((s, i) => ({ ...s, i })).filter((s) => s.chapter),
    [segs],
  )
  const currentChapter = chapters.reduce((acc, ch) => (ch.i <= idx ? ch.i : acc), 0)

  const boardFen = isDrill ? drillFen : seg?.fen
  const boardArrows = isDrill ? hintArrow : seg?.arrows || []
  const caption = isDrill ? drillMsg.text : seg?.caption

  return (
    <div className="trainer-layout">
      <div className="board-col">
        <div className="lesson-stage">
          <Board
            fen={boardFen}
            onDrop={isDrill ? onDrop : undefined}
            orientation={rep.color}
            allowDragging={isDrill && !drillDone}
            arrows={boardArrows}
            id="lesson-board"
          />
          {!isDrill && !playing && (
            <button
              className="lesson-overlay"
              onClick={() => (ended ? goTo(0, true) : setPlaying(true))}
              aria-label={ended ? 'Replay lesson' : 'Play lesson'}
            >
              {ended ? '↻' : '▶'}
            </button>
          )}
          {isDrill && !drillDone && <span className="lesson-live">● YOUR TURN</span>}
        </div>

        <div className={`lesson-caption ${isDrill ? drillMsg.type : ''}`}>
          {!isDrill && seg?.moveLabel && <span className="move-badge">{seg.moveLabel}</span>}
          <p>{caption}</p>
        </div>

        <div className="lesson-controls">
          <button onClick={() => goTo(idx - 1)} disabled={idx === 0} title="Previous">⏮</button>
          {isDrill ? (
            <>
              <button onClick={hint} disabled={drillDone} title="Hint">💡</button>
              <button onClick={() => goTo(idx + 1, true)} title="Skip drill">⏭ Skip</button>
            </>
          ) : (
            <button className="lesson-play" onClick={() => setPlaying((p) => !p)} title={playing ? 'Pause' : 'Play'}>
              {playing ? '⏸' : '▶'}
            </button>
          )}
          <button onClick={() => goTo(idx + 1)} disabled={idx >= segs.length - 1} title="Next">⏭</button>
          <div className="lesson-timeline" role="progressbar" aria-valuenow={idx + 1} aria-valuemax={segs.length}>
            {segs.map((s, i) => (
              <button
                key={i}
                className={`lesson-tick ${s.type === 'drill' ? 'drill' : ''} ${i < idx ? 'done' : ''} ${i === idx ? 'current' : ''}`}
                onClick={() => goTo(i)}
                title={s.chapter || s.moveLabel || `Part ${i + 1}`}
              />
            ))}
          </div>
          <select
            className="lesson-speed"
            value={String(rate)}
            onChange={(e) => setRate(Number(e.target.value))}
            title="Playback speed"
          >
            {SPEEDS.map((s) => (
              <option key={s.value} value={String(s.value)}>{s.label}</option>
            ))}
          </select>
        </div>
        {!speechSupported && (
          <p className="muted small">No speech synthesis in this browser — the lesson plays with captions only.</p>
        )}
      </div>

      <aside className="trainer-side">
        <div className="lesson-chapters">
          <strong>Chapters</strong>
          {chapters.map((ch) => (
            <button
              key={ch.i}
              className={`lesson-chapter ${ch.i === currentChapter ? 'on' : ''}`}
              onClick={() => goTo(ch.i)}
            >
              {ch.chapter}
            </button>
          ))}
        </div>
        <VoicePicker />
        <p className="muted small">
          Sit back and listen — the lesson pauses automatically when it’s your turn to play.
          Use the timeline to rewatch any move, and the chapter list to jump around.
        </p>
      </aside>
    </div>
  )
}
