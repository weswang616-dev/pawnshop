import { Chess } from 'chess.js'

const NAME = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' }

// Explain WHY the engine's best move is good (positive reasoning), and show the follow-up line
// in readable notation so you can see the idea. `pv` is the engine's principal variation (UCI).
export function describeBestMove(fenBefore, bestUci, pv = []) {
  if (!fenBefore || !bestUci) return null
  let board, move
  try {
    board = new Chess(fenBefore)
    move = board.move({ from: bestUci.slice(0, 2), to: bestUci.slice(2, 4), promotion: bestUci.slice(4) || undefined })
  } catch {
    return null
  }
  if (!move) return null

  // Reconstruct the engine's line in SAN (a handful of moves).
  const lineSan = [move.san]
  const after = new Chess(board.fen())
  for (let i = 1; i < pv.length && i < 6; i++) {
    try {
      const mm = after.move({ from: pv[i].slice(0, 2), to: pv[i].slice(2, 4), promotion: pv[i].slice(4) || undefined })
      if (!mm) break
      lineSan.push(mm.san)
    } catch {
      break
    }
  }

  let reason
  if (move.san.includes('#')) reason = 'it forces checkmate'
  else if (move.captured) reason = `it wins material — capturing the ${NAME[move.captured]} on ${move.to}`
  else if (move.san.includes('+')) reason = 'it gives check and seizes the initiative'
  else if (move.flags.includes('k') || move.flags.includes('q')) reason = 'it castles your king to safety'
  else if (move.piece === 'n' || move.piece === 'b') reason = `it develops your ${NAME[move.piece]} to a strong square`
  else reason = 'it keeps your position solid and holds the advantage'

  return { san: move.san, reason, lineSan }
}
