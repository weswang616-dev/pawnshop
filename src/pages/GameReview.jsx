import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Chess } from 'chess.js'
import Board from '../components/Board'
import EvalBar from '../components/EvalBar'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getRecentGames, parseGame, gameOutcome } from '../lib/chesscom'
import { getEngine } from '../lib/engine'
import {
  centipawnLoss,
  classifyLoss,
  MOVE_QUALITY,
  formatEval,
  formatLoss,
  uciToMove,
  gameAccuracy,
  terminalScore,
} from '../lib/analysis'
import { classifyBlunder, recordGameThemes } from '../lib/weakness'
import { describeBestMove } from '../lib/explain'
import { addMistakes } from '../lib/mistakes'
import { findRepertoireDeparture } from '../lib/repertoireMatch'
import { coachGame } from '../lib/coach'
import SpeakButton from '../components/SpeakButton'
import EvalGraph from '../components/EvalGraph'
import CoachReport from '../components/CoachReport'

const SPEEDS = [
  { key: 'fast', label: 'Fast', movetime: 200 },
  { key: 'balanced', label: 'Balanced', movetime: 300 },
  { key: 'deep', label: 'Deep', movetime: 600 },
]

function sanFor(fen, uci) {
  if (!uci) return null
  try {
    const c = new Chess(fen)
    const m = c.move(uciToMove(uci))
    return m ? m.san : null
  } catch {
    return null
  }
}

export default function GameReview() {
  const [username] = useLocalStorage('chesscom-username', '')
  const [games, setGames] = useState([])
  const [gamesStatus, setGamesStatus] = useState('idle')
  const [gamesError, setGamesError] = useState('')

  const [selected, setSelected] = useState(null) // { positions, moves, userColor, game }
  const [scores, setScores] = useState([]) // [{cp,mate}] per position
  const [bestMoves, setBestMoves] = useState([]) // uci per position
  const [pvs, setPvs] = useState([]) // engine principal variation (uci[]) per position
  const [analysis, setAnalysis] = useState('idle') // idle | running | done
  const [progress, setProgress] = useState(0)
  const [engineError, setEngineError] = useState('')

  const [ply, setPly] = useState(0) // which position we're viewing (0..N)
  const [showBest, setShowBest] = useState(true)
  const [speed, setSpeed] = useLocalStorage('review-speed', 'balanced')

  const cancelRef = useRef(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => () => { cancelRef.current = true }, [])

  async function loadGames() {
    if (!username) return
    setGamesStatus('loading')
    setGamesError('')
    try {
      const g = await getRecentGames(username, 20)
      setGames(g)
      setGamesStatus('done')
    } catch (err) {
      setGamesError(err.message)
      setGamesStatus('error')
    }
  }

  useEffect(() => {
    if (username) loadGames()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  // Arrow-key navigation while reviewing a game (← → step, Home/End jump to ends).
  useEffect(() => {
    if (!selected) return
    function onKey(e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
      else if (e.key === 'Home') { e.preventDefault(); setPly(0) }
      else if (e.key === 'End') { e.preventDefault(); setPly(selected.positions.length - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  // Deep-link from the dashboard: /review?latest=1 auto-reviews the most recent game.
  useEffect(() => {
    if (searchParams.get('latest') === '1' && gamesStatus === 'done' && games.length && !selected) {
      analyseGame(games[0])
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games, gamesStatus])

  async function analyseGame(game) {
    cancelRef.current = true // stop any in-flight run
    await new Promise((r) => setTimeout(r, 30))
    cancelRef.current = false

    let parsed
    try {
      parsed = parseGame(game.pgn)
    } catch {
      setEngineError('Could not read this game’s moves.')
      return
    }
    const white = (game.white.username || '').toLowerCase()
    const userColor = white === username.toLowerCase() ? 'w' : 'b'
    const sel = { ...parsed, userColor, game }

    setSelected(sel)
    setPly(0)
    setScores([])
    setBestMoves([])
    setPvs([])
    setProgress(0)
    setEngineError('')
    setAnalysis('running')

    const movetime = (SPEEDS.find((s) => s.key === speed) || SPEEDS[1]).movetime
    const engine = getEngine()
    const nextScores = new Array(sel.positions.length).fill(null)
    const nextBest = new Array(sel.positions.length).fill(null)
    const nextPvs = new Array(sel.positions.length).fill(null)

    try {
      for (let i = 0; i < sel.positions.length; i++) {
        if (cancelRef.current) return
        // Checkmate/stalemate positions have no engine score — supply a decisive/level one so a
        // mating move isn't scored as a giant blunder. (Also saves an engine call.)
        const term = terminalScore(sel.positions[i])
        if (term) {
          nextScores[i] = term
          nextBest[i] = null
          nextPvs[i] = null
        } else {
          const r = await engine.evaluate(sel.positions[i], { movetime })
          nextScores[i] = { cp: r.cp, mate: r.mate }
          nextBest[i] = r.bestMove
          nextPvs[i] = r.pv
        }
        setProgress((i + 1) / sel.positions.length)
        // Update incrementally so the board/evals come alive as analysis streams in.
        setScores(nextScores.slice())
        setBestMoves(nextBest.slice())
        setPvs(nextPvs.slice())
      }
      if (!cancelRef.current) {
        setAnalysis('done')
        // Fold this game's blunders into (1) the weakness profile and (2) the mistake-flashcard deck.
        const themes = []
        const mistakes = []
        for (let i = 0; i < sel.moves.length; i++) {
          if (sel.moves[i].color !== userColor) continue
          if (!nextScores[i] || !nextScores[i + 1]) continue
          const loss = centipawnLoss(nextScores[i], nextScores[i + 1], userColor === 'w')
          const q = classifyLoss(loss)
          if (q === 'blunder' || q === 'mistake') {
            themes.push(classifyBlunder(sel.positions[i + 1], userColor, nextScores[i + 1]))
            if (nextBest[i]) {
              const info = describeBestMove(sel.positions[i], nextBest[i], nextPvs[i] || [])
              mistakes.push({
                fen: sel.positions[i],
                bestMove: nextBest[i],
                bestSan: info?.san || null,
                played: sel.moves[i].san,
                reason: info?.reason || '',
                lineSan: info?.lineSan || [],
                gameUrl: game.url,
                color: userColor,
              })
            }
          }
        }
        if (themes.length) recordGameThemes(game.url, themes)
        if (mistakes.length) addMistakes(mistakes)
      }
    } catch (err) {
      setEngineError(err.message + ' — the engine may still be loading; try again.')
      setAnalysis('idle')
    }
  }

  // Per-move quality (only computed once we have adjacent scores).
  const moveInfo = useMemo(() => {
    if (!selected) return []
    return selected.moves.map((mv, i) => {
      const before = scores[i]
      const after = scores[i + 1]
      if (!before || !after) return { ...mv, quality: null, cpLoss: 0 }
      const loss = centipawnLoss(before, after, mv.color === 'w')
      return { ...mv, quality: classifyLoss(loss), cpLoss: loss }
    })
  }, [selected, scores])

  const myMistakes = useMemo(
    () =>
      moveInfo
        .map((m, i) => ({ ...m, i }))
        .filter((m) => selected && m.color === selected.userColor && (m.quality === 'blunder' || m.quality === 'mistake')),
    [moveInfo, selected],
  )

  const counts = useMemo(() => {
    const c = { blunder: 0, mistake: 0, inaccuracy: 0 }
    if (!selected) return c
    for (const m of moveInfo) {
      if (m.color === selected.userColor && m.quality) c[m.quality]++
    }
    return c
  }, [moveInfo, selected])

  // Your chess.com-style accuracy for this game, and where (if anywhere) you left your repertoire.
  const accuracy = useMemo(
    () => (selected ? gameAccuracy(scores, selected.moves, selected.userColor) : null),
    [selected, scores],
  )
  const departure = useMemo(
    () =>
      selected && analysis === 'done'
        ? findRepertoireDeparture(selected.positions, selected.moves, selected.userColor)
        : null,
    [selected, analysis],
  )
  // Whole-game heuristic coaching (strengths, turning point, ideas to try) — once analysis is done.
  const coachReport = useMemo(
    () =>
      selected && analysis === 'done'
        ? coachGame({
            positions: selected.positions,
            moves: selected.moves,
            scores,
            bestMoves,
            pvs,
            userColor: selected.userColor,
          })
        : null,
    [selected, analysis, scores, bestMoves, pvs],
  )

  // Current view: board at positions[ply]; the move that led here is moveInfo[ply-1].
  const currentEval = scores[ply] || null
  const lastMove = ply > 0 ? moveInfo[ply - 1] : null
  const lastWasMine = lastMove && selected && lastMove.color === selected.userColor

  // Positive coaching: explain WHY the engine's move was better (with the follow-up line).
  const bestInfo = useMemo(() => {
    if (!selected || !lastWasMine || !lastMove?.quality) return null
    return describeBestMove(selected.positions[ply - 1], bestMoves[ply - 1], pvs[ply - 1] || [])
  }, [selected, lastWasMine, lastMove, ply, bestMoves, pvs])

  const arrows = useMemo(() => {
    if (!showBest || !selected) return []
    const uci = bestMoves[ply]
    if (!uci) return []
    return [{ startSquare: uci.slice(0, 2), endSquare: uci.slice(2, 4), color: '#7cb342' }]
  }, [showBest, bestMoves, ply, selected])

  // Highlight the squares of the move just played.
  const squareStyles = useMemo(() => {
    if (!lastMove) return {}
    const tint = lastMove.quality ? MOVE_QUALITY[lastMove.quality].color + '55' : '#ffeb3b33'
    return { [lastMove.from]: { background: tint }, [lastMove.to]: { background: tint } }
  }, [lastMove])

  function go(delta) {
    if (!selected) return
    setPly((p) => Math.max(0, Math.min(selected.positions.length - 1, p + delta)))
  }
  function jumpToNextMistake() {
    if (!myMistakes.length) return
    const next = myMistakes.find((m) => m.i + 1 > ply) || myMistakes[0]
    setPly(next.i + 1)
  }

  if (!username) {
    return (
      <div className="page">
        <EmptyState
          title="Connect your chess.com account first"
          body="Head to the dashboard and enter your username so we can pull your recent games."
          cta={<Link to="/" className="btn-primary">Go to dashboard</Link>}
        />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-head review-head">
        <div>
          <h1>Game Review</h1>
          <p className="muted">
            Stockfish replays your games and flags <strong>your</strong> blunders, mistakes, and the moves you
            should have played. <span className="kbd-hint">Tip: use ← → to step.</span>
          </p>
        </div>
        {games.length > 0 && (
          <button
            className="btn-primary review-latest"
            onClick={() => analyseGame(games[0])}
            disabled={analysis === 'running'}
          >
            ⚡ Review latest
          </button>
        )}
      </div>

      <div className="review-layout">
        {/* Left: game picker */}
        <aside className="game-list">
          <div className="game-list-head">
            <span>Recent games</span>
            <button className="btn-ghost" onClick={loadGames} disabled={gamesStatus === 'loading'}>
              {gamesStatus === 'loading' ? '…' : '⟳'}
            </button>
          </div>
          {gamesStatus === 'error' && <p className="error small">{gamesError}</p>}
          {gamesStatus === 'loading' && <p className="muted small">Loading your games…</p>}
          {gamesStatus === 'done' && games.length === 0 && <p className="muted small">No games found.</p>}
          <ul>
            {games.map((g) => {
              const userColor = (g.white.username || '').toLowerCase() === username.toLowerCase() ? 'w' : 'b'
              const o = gameOutcome(g, userColor)
              const active = selected?.game?.url === g.url
              return (
                <li key={g.url}>
                  <button className={`game-row ${active ? 'active' : ''}`} onClick={() => analyseGame(g)}>
                    <span className={`dot ${o.win ? 'win' : o.draw ? 'draw' : 'loss'}`} />
                    <span className="game-opp">
                      <span className={`chip ${userColor === 'w' ? 'chip-w' : 'chip-b'}`}>{userColor === 'w' ? 'W' : 'B'}</span>
                      {o.opp} <span className="muted">({o.oppRating})</span>
                    </span>
                    <span className="game-meta muted">{g.time_class}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Middle: board */}
        <div className="review-board">
          {!selected ? (
            <EmptyState
              title="Pick a game to review"
              body="Choose one of your recent games on the left. Analysis runs right here in your browser — no data leaves your machine."
            />
          ) : (
            <>
              <div className="board-area">
                <EvalBar evalObj={currentEval} orientation={selected.userColor === 'w' ? 'white' : 'black'} />
                <Board
                  fen={selected.positions[ply]}
                  orientation={selected.userColor === 'w' ? 'white' : 'black'}
                  allowDragging={false}
                  arrows={arrows}
                  squareStyles={squareStyles}
                  id="review-board"
                />
              </div>

              <div className="controls">
                <button onClick={() => setPly(0)} disabled={ply === 0}>⏮</button>
                <button onClick={() => go(-1)} disabled={ply === 0}>‹</button>
                <span className="ply-counter">{ply}/{selected.positions.length - 1}</span>
                <button onClick={() => go(1)} disabled={ply >= selected.positions.length - 1}>›</button>
                <button onClick={() => setPly(selected.positions.length - 1)} disabled={ply >= selected.positions.length - 1}>⏭</button>
                <label className="toggle">
                  <input type="checkbox" checked={showBest} onChange={(e) => setShowBest(e.target.checked)} />
                  Best move
                </label>
              </div>

              <EvalGraph scores={scores} ply={ply} onSeek={setPly} userColor={selected.userColor} />

              {analysis === 'running' && (
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${Math.round(progress * 100)}%` }} />
                  <span>Analyzing… {Math.round(progress * 100)}%</span>
                </div>
              )}
              {engineError && <p className="error small">{engineError}</p>}
            </>
          )}
        </div>

        {/* Right: coaching + move list */}
        {selected && (
          <aside className="review-side">
            <div className="speed-row">
              <span className="muted small">Engine speed</span>
              <div className="seg">
                {SPEEDS.map((s) => (
                  <button
                    key={s.key}
                    className={speed === s.key ? 'on' : ''}
                    onClick={() => setSpeed(s.key)}
                    title={`${s.movetime}ms / move`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="summary">
              <Stat n={accuracy != null ? `${accuracy}%` : '—'} label="Accuracy" cls="accuracy" />
              <Stat n={counts.blunder} label="Blunders" cls="blunder" />
              <Stat n={counts.mistake} label="Mistakes" cls="mistake" />
              <Stat n={counts.inaccuracy} label="Inaccuracies" cls="inaccuracy" />
            </div>
            <button className="btn-primary full" onClick={jumpToNextMistake} disabled={!myMistakes.length}>
              {myMistakes.length ? 'Jump to my next mistake →' : 'No big mistakes found 🎉'}
            </button>
            {departure && (
              <div className="rep-departure">
                <span className="weakness-eyebrow">📖 Repertoire check</span>
                <p>
                  You left your prep at move <b>{departure.moveNo}</b>: you played <b>{departure.playedSan}</b>, but
                  your <b>{departure.repName}</b> line is <b>{departure.bookSans.join(' / ')}</b>.
                </p>
                <Link to="/openings" className="btn-ghost full">Drill this opening →</Link>
              </div>
            )}

            <CoachReport report={coachReport} />

            <div className="coach">
              {!lastMove && <p className="muted">Step through the game, or jump to your mistakes.</p>}
              {lastMove && lastMove.quality && lastWasMine && (
                <div className={`coach-card ${lastMove.quality}`}>
                  <strong>
                    {MOVE_QUALITY[lastMove.quality].label} {MOVE_QUALITY[lastMove.quality].symbol}
                  </strong>
                  <p className="coach-played">
                    You played <b>{lastMove.san}</b> — {formatLoss(lastMove.cpLoss)}.
                  </p>
                  {bestInfo ? (
                    <>
                      <p className="coach-better">
                        ✅ Better: <b>{bestInfo.san}</b> — {bestInfo.reason}.
                      </p>
                      {bestInfo.lineSan.length > 1 && (
                        <p className="coach-line">
                          The idea: <code>{bestInfo.lineSan.join(' ')}</code>
                        </p>
                      )}
                      <SpeakButton
                        label="Hear why"
                        text={`Instead of ${lastMove.san}, better was ${bestInfo.san}. ${bestInfo.reason}. The line goes ${bestInfo.lineSan.join(', ')}.`}
                      />
                    </>
                  ) : (
                    bestMoves[ply - 1] && (
                      <p className="coach-better">
                        ✅ Better was <b>{sanFor(selected.positions[ply - 1], bestMoves[ply - 1])}</b>.
                      </p>
                    )
                  )}
                </div>
              )}
              {lastMove && (!lastMove.quality || !lastWasMine) && (
                <p className="muted">
                  {lastMove.color === selected.userColor ? 'Your move: ' : 'Opponent: '}
                  <b>{lastMove.san}</b>
                  {currentEval && <> · eval {formatEval(currentEval)}</>}
                </p>
              )}
            </div>

            <ol className="movelist">
              {Array.from({ length: Math.ceil(selected.moves.length / 2) }).map((_, row) => {
                const wi = row * 2
                const bi = row * 2 + 1
                return (
                  <li key={row}>
                    <span className="movenum">{row + 1}.</span>
                    <MoveCell info={moveInfo[wi]} active={ply === wi + 1} onClick={() => setPly(wi + 1)} userColor={selected.userColor} />
                    {moveInfo[bi] ? (
                      <MoveCell info={moveInfo[bi]} active={ply === bi + 1} onClick={() => setPly(bi + 1)} userColor={selected.userColor} />
                    ) : (
                      <span />
                    )}
                  </li>
                )
              })}
            </ol>
          </aside>
        )}
      </div>
    </div>
  )
}

function MoveCell({ info, active, onClick, userColor }) {
  if (!info) return <span />
  const q = info.quality && info.color === userColor ? MOVE_QUALITY[info.quality] : null
  return (
    <button className={`move ${active ? 'active' : ''}`} onClick={onClick}>
      {info.san}
      {q && <span className="move-mark" style={{ color: q.color }}>{q.symbol}</span>}
    </button>
  )
}

function Stat({ n, label, cls }) {
  return (
    <div className={`stat ${cls}`}>
      <span className="stat-n">{n}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function EmptyState({ title, body, cta }) {
  return (
    <div className="empty">
      <div className="empty-mark">♟</div>
      <h2>{title}</h2>
      <p className="muted">{body}</p>
      {cta}
    </div>
  )
}
