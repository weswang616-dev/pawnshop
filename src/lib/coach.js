// A heuristic "coach" that turns a reviewed game into plain-English ideas — strengths, the
// turning point, positional ideas to try (open files, knight outposts, pawn breaks, bad
// bishops), and a couple of takeaways. No engine calls of its own: it reads the Stockfish
// data Game Review already computed, plus simple board scans with chess.js.
import { Chess } from 'chess.js'
import { centipawnLoss, uciToMove, formatLoss } from './analysis'
import { describeBestMove } from './explain'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const fileOf = (sq) => sq.charCodeAt(0) - 97
const rankOf = (sq) => parseInt(sq[1], 10)
const isLight = (sq) => (fileOf(sq) + rankOf(sq)) % 2 === 1
const moveNoOf = (ply) => Math.floor(ply / 2) + 1

function sanForUci(fen, uci) {
  try {
    const c = new Chess(fen)
    const m = c.move(uciToMove(uci))
    return m ? m.san : null
  } catch {
    return null
  }
}

// Positional ideas from a single middlegame position (pushed into `ideas`).
function positionalIdeas(fen, userColor, ideas) {
  let pieces
  try {
    pieces = new Chess(fen).board().flat().filter(Boolean)
  } catch {
    return
  }
  const userIsWhite = userColor === 'w'
  const userPawns = pieces.filter((p) => p.type === 'p' && p.color === userColor)
  const enemyPawns = pieces.filter((p) => p.type === 'p' && p.color !== userColor)
  const userRooks = pieces.filter((p) => p.type === 'r' && p.color === userColor)
  const userKnights = pieces.filter((p) => p.type === 'n' && p.color === userColor)
  const userBishops = pieces.filter((p) => p.type === 'b' && p.color === userColor)

  // Open file with no rook of yours on it.
  for (let f = 0; f < 8; f++) {
    const pawnsOnFile = pieces.some((p) => p.type === 'p' && fileOf(p.square) === f)
    if (pawnsOnFile) continue
    if (userRooks.length && !userRooks.some((r) => fileOf(r.square) === f)) {
      ideas.push({
        title: `Use the open ${FILES[f]}-file`,
        detail: `The ${FILES[f]}-file was wide open and you had no rook on it. Open files are highways for rooks — swing a rook to the ${FILES[f]}-file (and double up) to pile on pressure.`,
      })
      break
    }
  }

  // Knight outpost: a square in the enemy half, defended by your pawn, with NO enemy pawns on
  // the adjacent files (so it can never be kicked) — and you don't have a knight there yet.
  const ranks = userIsWhite ? [5, 6] : [4, 3]
  outpost: for (const r of ranks) {
    for (let f = 2; f <= 5; f++) {
      const sq = FILES[f] + r
      const behind = userIsWhite ? r - 1 : r + 1
      const defended = userPawns.some((p) => rankOf(p.square) === behind && Math.abs(fileOf(p.square) - f) === 1)
      if (!defended) continue
      if (enemyPawns.some((p) => Math.abs(fileOf(p.square) - f) === 1)) continue
      if (userKnights.some((k) => k.square === sq)) continue
      if (pieces.some((p) => p.square === sq && p.color === userColor)) continue
      ideas.push({
        title: `Knight outpost on ${sq}`,
        detail: `${sq} was a hole in your opponent's camp — your pawn guards it and no enemy pawn can ever kick a piece off it. Maneuver a knight to ${sq} and it dominates the board.`,
      })
      break outpost
    }
  }

  // Bad bishop: a bishop stuck on the same colour as a clump of your own pawns.
  const lightPawns = userPawns.filter((p) => isLight(p.square)).length
  const darkPawns = userPawns.length - lightPawns
  for (const b of userBishops) {
    const onLight = isLight(b.square)
    const sameColor = onLight ? lightPawns : darkPawns
    if (sameColor >= 4) {
      ideas.push({
        title: `Free your ${onLight ? 'light' : 'dark'}-squared bishop`,
        detail: `Your ${onLight ? 'light' : 'dark'}-squared bishop was boxed in behind your own pawns (${sameColor} of them on its colour). A "bad bishop" like that is usually your worst piece — trade it off, or reroute it to open air.`,
      })
      break
    }
  }
}

export function coachGame({ positions, moves, scores, bestMoves, pvs, userColor }) {
  if (!positions || !moves || !scores) return null
  const userIsWhite = userColor === 'w'
  const strengths = []
  const ideas = []
  const workOn = []

  // --- King safety / castling ---
  let castledPly = -1
  for (let i = 0; i < moves.length; i++) {
    if (moves[i].color === userColor && (moves[i].san === 'O-O' || moves[i].san === 'O-O-O')) {
      castledPly = i
      break
    }
  }
  if (castledPly >= 0 && moveNoOf(castledPly) <= 10) {
    strengths.push(`You castled on move ${moveNoOf(castledPly)} — good, king safety first.`)
  } else if (castledPly >= 0) {
    ideas.push({ title: 'Castle earlier', detail: `You castled on move ${moveNoOf(castledPly)}. Aim to castle by about move 8–10, before the centre opens.` })
    workOn.push('Castle by about move 10')
  } else {
    ideas.push({ title: 'Get your king safe', detail: 'You never castled this game. Castling tucks your king away and connects your rooks — make it a priority by move 10.' })
    workOn.push('Castle every game (by ~move 10)')
  }

  // --- Accuracy / good-move count (strength) ---
  let good = 0
  let userMoves = 0
  for (let i = 0; i < moves.length; i++) {
    if (moves[i].color !== userColor) continue
    userMoves++
    if (scores[i] && scores[i + 1] && centipawnLoss(scores[i], scores[i + 1], userIsWhite) <= 25) good++
  }
  if (userMoves && good / userMoves >= 0.6) {
    strengths.push(`${good} of your ${userMoves} moves matched the engine's top idea — accurate, principled play.`)
  }

  // --- Best moment reached ---
  let bestEval = -Infinity
  let bestPly = 0
  for (let k = 0; k < scores.length; k++) {
    if (!scores[k]) continue
    let ev
    if (scores[k].mate != null) ev = (userIsWhite ? scores[k].mate > 0 : scores[k].mate < 0) ? 2000 : -2000
    else ev = userIsWhite ? scores[k].cp : -scores[k].cp
    if (ev > bestEval) {
      bestEval = ev
      bestPly = k
    }
  }
  if (bestEval >= 180) {
    strengths.push(`You reached a clearly better position (about +${(bestEval / 100).toFixed(1)}) around move ${moveNoOf(bestPly)} — you outplayed your opponent there.`)
    if (bestEval >= 250) workOn.push('Practise converting winning positions (trade pieces when ahead)')
  }
  if (!strengths.length) strengths.push('You got a real game and fought — every review is a step forward.')

  // --- Turning point: your single costliest move ---
  let worst = null
  for (let i = 0; i < moves.length; i++) {
    if (moves[i].color !== userColor || !scores[i] || !scores[i + 1]) continue
    const loss = centipawnLoss(scores[i], scores[i + 1], userIsWhite)
    if (!worst || loss > worst.loss) worst = { i, loss }
  }
  let turningPoint = null
  if (worst && worst.loss >= 120) {
    const info = bestMoves[worst.i] ? describeBestMove(positions[worst.i], bestMoves[worst.i], pvs[worst.i] || []) : null
    const played = moves[worst.i].san
    const better = info?.san || (bestMoves[worst.i] ? sanForUci(positions[worst.i], bestMoves[worst.i]) : null)
    // If the engine's best move IS the move you played, it wasn't a mistake (eval noise) — skip it.
    if (!better || better !== played) {
      turningPoint = {
        moveNo: moveNoOf(worst.i),
        played,
        better,
        reason: info?.reason || null,
        lineSan: info?.lineSan || [],
        lossText: formatLoss(worst.loss),
      }
      workOn.unshift(`In spots like move ${turningPoint.moveNo}, slow down and check: does my move hang anything?`)
    }
  }

  // --- Positional ideas (scan a representative middlegame position) ---
  if (positions.length >= 16) {
    const scanIdx = Math.max(16, Math.min(positions.length - 1, Math.floor(positions.length * 0.55)))
    positionalIdeas(positions[scanIdx], userColor, ideas)
  }

  // --- Takeaways ---
  if (ideas[0]) workOn.push(`Try this next game: ${ideas[0].title.toLowerCase()}.`)
  const seen = new Set()
  const dedupWorkOn = workOn.filter((w) => (seen.has(w) ? false : (seen.add(w), true))).slice(0, 3)

  return { strengths: strengths.slice(0, 3), turningPoint, ideas: ideas.slice(0, 4), workOn: dedupWorkOn }
}

// Flatten the report into a single narratable paragraph (routed through SAN→speech by speak()).
export function coachReportToText(r) {
  if (!r) return ''
  const parts = ['Game coach.']
  if (r.strengths.length) parts.push('What you did well: ' + r.strengths.join(' '))
  if (r.turningPoint) {
    const t = r.turningPoint
    parts.push(
      `The turning point was move ${t.moveNo}: you played ${t.played}, ${t.lossText}.` +
        (t.better ? ` Better was ${t.better}${t.reason ? ` — ${t.reason}` : ''}.` : ''),
    )
  }
  if (r.ideas.length) parts.push('Ideas to try: ' + r.ideas.map((i) => `${i.title}. ${i.detail}`).join(' '))
  if (r.workOn.length) parts.push('To work on: ' + r.workOn.join(' '))
  return parts.join(' ')
}
