import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board from './Board'
import { masterGames } from '../lib/masterGames'
import { getEngine } from '../lib/engine'
import { useLocalStorage } from '../hooks/useLocalStorage'

// Resolve a SAN move in a position to { from, to, san } (or null if illegal).
function sanToFromTo(fen, san) {
  try {
    const c = new Chess(fen)
    const m = c.move(san)
    return m ? { from: m.from, to: m.to, san: m.san } : null
  } catch {
    return null
  }
}

// "Guess the Move": play through a real master game on the master's side. Each turn you guess
// the move; you get credit for the game move OR for a top Stockfish move (prefetched during your
// thinking time). The board always follows the REAL game, so you keep learning the master's plan.
export default function GuessTheMove() {
  const [gameId, setGameId] = useLocalStorage('gtm-game', masterGames[0].id)
  const game = useMemo(() => masterGames.find((g) => g.id === gameId) || masterGames[0], [gameId])
  const moves = useMemo(() => game.moves.trim().split(/\s+/), [game])
  const solver = game.side // 'w' | 'b' — the side you guess

  const chessRef = useRef(new Chess())
  const plyRef = useRef(0)
  const busyRef = useRef(false)
  const cleanRef = useRef(true) // no hint/reveal used on the current move
  const engineRef = useRef({ fen: null, uci: null }) // prefetched best move for the guess position

  const [fen, setFen] = useState(() => new Chess().fen())
  const [ply, setPly] = useState(0) // mirror of plyRef, for rendering progress
  const [status, setStatus] = useState('guessing') // guessing | thinking | done
  const [message, setMessage] = useState({ type: 'info', text: '' })
  const [note, setNote] = useState('')
  const [arrow, setArrow] = useState([])
  const [hintSq, setHintSq] = useState(null)
  const [score, setScore] = useState({ points: 0, correct: 0, guesses: 0, streak: 0 })
  const [stats, setStats] = useLocalStorage('gtm-stats', { games: 0, correct: 0, guesses: 0 })

  function setPlyBoth(n) {
    plyRef.current = n
    setPly(n)
  }

  const noteFor = (idx) => (game.notes && game.notes[idx + 1]) || ''

  async function prefetchEngine(fenAtTurn) {
    engineRef.current = { fen: fenAtTurn, uci: null }
    try {
      const r = await getEngine().evaluate(fenAtTurn, { movetime: 250 })
      if (engineRef.current.fen === fenAtTurn) engineRef.current.uci = r.bestMove
    } catch {
      /* engine grading is optional — master-move matching still works */
    }
  }

  function finishGame() {
    setStatus('done')
    setArrow([])
    setMessage({ type: 'success', text: '🏁 Game complete! Replay it, or pick another classic below.' })
    setStats((st) => ({ ...st, games: st.games + 1 }))
  }

  // Auto-play the opponent's moves until it's the solver's turn (or the game ends).
  function playToSolverTurn() {
    const c = chessRef.current
    const step = () => {
      const idx = plyRef.current
      if (idx >= moves.length) return finishGame()
      if (c.turn() === solver) {
        cleanRef.current = true
        setHintSq(null)
        setStatus('guessing')
        setMessage({ type: 'info', text: 'Your move — what did the master play here?' })
        prefetchEngine(c.fen())
        return
      }
      const san = moves[idx]
      const ft = sanToFromTo(c.fen(), san)
      c.move(san)
      setPlyBoth(idx + 1)
      setFen(c.fen())
      if (ft) setArrow([{ startSquare: ft.from, endSquare: ft.to, color: '#5b8def' }])
      const n = noteFor(idx)
      if (n) setNote(n)
      busyRef.current = true
      setTimeout(() => {
        busyRef.current = false
        step()
      }, 650)
    }
    step()
  }

  function setup() {
    const c = new Chess()
    chessRef.current = c
    busyRef.current = false
    cleanRef.current = true
    engineRef.current = { fen: null, uci: null }
    setPlyBoth(0)
    setScore({ points: 0, correct: 0, guesses: 0, streak: 0 })
    setArrow([])
    setHintSq(null)
    setNote('')
    setFen(c.fen())
    setStatus('guessing')
    playToSolverTurn()
  }

  useEffect(() => {
    setup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game])

  function onDrop(from, to) {
    if (status !== 'guessing' || busyRef.current) return false
    const c = chessRef.current
    const idx = plyRef.current
    if (idx >= moves.length) return false

    const masterFt = sanToFromTo(c.fen(), moves[idx])
    // Validate the user's move is legal in this position.
    let um
    try {
      um = new Chess(c.fen()).move({ from, to, promotion: 'q' })
    } catch {
      um = null
    }
    if (!um) return false

    const isMatch = masterFt && um.from === masterFt.from && um.to === masterFt.to
    const eng = engineRef.current
    const engUci = eng.fen === c.fen() ? eng.uci : null
    const userUci = um.from + um.to + (um.promotion || '')
    const isEngineApproved = !isMatch && engUci != null && (engUci === userUci || engUci === um.from + um.to)
    const credited = isMatch || isEngineApproved

    // The game stays on-rails: always play the MASTER's move, whatever the user guessed.
    const masterSan = moves[idx]
    c.move(masterSan)
    setPlyBoth(idx + 1)
    setFen(c.fen())
    if (masterFt) setArrow([{ startSquare: masterFt.from, endSquare: masterFt.to, color: isMatch ? '#7cb342' : '#e8974f' }])

    setScore((s) => ({
      points: s.points + (credited ? (cleanRef.current ? 2 : 1) : 0),
      correct: s.correct + (credited ? 1 : 0),
      guesses: s.guesses + 1,
      streak: credited ? s.streak + 1 : 0,
    }))
    setStats((st) => ({ ...st, correct: st.correct + (credited ? 1 : 0), guesses: st.guesses + 1 }))

    if (isMatch) {
      setMessage({ type: 'success', text: `★ ${cleanRef.current ? 'Spot on' : 'Correct'} — you found the game move, ${masterSan}.` })
    } else if (isEngineApproved) {
      setMessage({ type: 'success', text: `✓ Engine-approved! Your move is a top Stockfish choice. The game itself went ${masterSan}.` })
    } else {
      setMessage({ type: 'error', text: `✗ The game played ${masterSan}. Follow the idea and keep going.` })
    }
    setNote(noteFor(idx))

    busyRef.current = true
    setStatus('thinking')
    setTimeout(() => {
      busyRef.current = false
      playToSolverTurn()
    }, 1100)
    return isMatch
  }

  function hint() {
    if (status !== 'guessing' || busyRef.current) return
    const ft = sanToFromTo(chessRef.current.fen(), moves[plyRef.current])
    if (ft) {
      setHintSq(ft.from)
      cleanRef.current = false
    }
  }

  function reveal() {
    if (status !== 'guessing' || busyRef.current) return
    cleanRef.current = false
    const c = chessRef.current
    const idx = plyRef.current
    const san = moves[idx]
    const ft = sanToFromTo(c.fen(), san)
    c.move(san)
    setPlyBoth(idx + 1)
    setFen(c.fen())
    if (ft) setArrow([{ startSquare: ft.from, endSquare: ft.to, color: '#e8974f' }])
    setMessage({ type: 'info', text: `The master played ${san}.` })
    setScore((s) => ({ ...s, guesses: s.guesses + 1, streak: 0 }))
    setStats((st) => ({ ...st, guesses: st.guesses + 1 }))
    setNote(noteFor(idx))
    busyRef.current = true
    setStatus('thinking')
    setTimeout(() => {
      busyRef.current = false
      playToSolverTurn()
    }, 900)
  }

  const squareStyles = useMemo(
    () => (hintSq ? { [hintSq]: { background: 'rgba(232,151,79,0.5)' } } : {}),
    [hintSq],
  )
  const accuracy = score.guesses ? Math.round((score.correct / score.guesses) * 100) : 0
  const progress = moves.length ? Math.round((ply / moves.length) * 100) : 0

  return (
    <div className="trainer-layout">
      <div className="board-col">
        <div className="board-area">
          <Board
            fen={fen}
            onDrop={onDrop}
            orientation={solver === 'w' ? 'white' : 'black'}
            allowDragging={status === 'guessing'}
            arrows={arrow}
            squareStyles={squareStyles}
            id="gtm-board"
          />
        </div>
        <div className="controls">
          <button onClick={hint} disabled={status !== 'guessing'}>💡 Hint</button>
          <button onClick={reveal} disabled={status !== 'guessing'}>Show move</button>
          {status === 'done' ? (
            <button className="btn-primary" onClick={setup}>↺ Replay</button>
          ) : (
            <button onClick={setup}>↺ Restart</button>
          )}
        </div>
        <div className="progress thin">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <aside className="trainer-side">
        <div className="gtm-game-head">
          <strong>{game.white} vs {game.black}</strong>
          <span className="muted small">{game.event}, {game.year} · you play {solver === 'w' ? 'White' : 'Black'}</span>
        </div>
        <p className="muted small">{game.blurb}</p>

        <div className={`idea-card ${message.type}`}>
          <p>{message.text}</p>
        </div>
        {note && <div className="gtm-note">💡 {note}</div>}

        <div className="summary">
          <div className="stat"><span className="stat-n">{score.points}</span><span className="stat-label">Points</span></div>
          <div className="stat"><span className="stat-n">{score.streak}</span><span className="stat-label">Streak</span></div>
          <div className="stat"><span className="stat-n">{accuracy}%</span><span className="stat-label">Matched</span></div>
        </div>

        <div className="filters">
          <label>
            Master game
            <select value={gameId} onChange={(e) => setGameId(e.target.value)}>
              {masterGames.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.white} vs {g.black} ({g.year}) — {g.side === 'w' ? 'White' : 'Black'}
                </option>
              ))}
            </select>
          </label>
          <p className="muted small">
            You score for the game move <b>or</b> any move Stockfish rates as best. Lifetime: {stats.correct}/{stats.guesses} matched
            across {stats.games} game{stats.games === 1 ? '' : 's'}.
          </p>
        </div>
      </aside>
    </div>
  )
}
