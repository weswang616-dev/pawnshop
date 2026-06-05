// Helpers for turning engine evaluations into human-readable, blunder-aware feedback.
// Math on { cp, mate } objects (always White's perspective), plus terminal-position detection
// (engines return no score for a checkmated position — we must supply a decisive one).
import { Chess } from 'chess.js'

const MATE_SCORE = 100000

// A finished position has no engine score. Checkmate is decisive for the side that delivered it;
// stalemate/draws are dead level. Returns a White-perspective { cp, mate } or null if not terminal.
// Without this, a checkmating move looks like it crashed from +mate to 0.0 — a fake ~999-pawn blunder.
export function terminalScore(fen) {
  try {
    const c = new Chess(fen)
    if (c.isCheckmate()) return c.turn() === 'w' ? { cp: -MATE_SCORE, mate: null } : { cp: MATE_SCORE, mate: null }
    if (c.isStalemate() || c.isInsufficientMaterial() || c.isThreefoldRepetition() || c.isDraw()) {
      return { cp: 0, mate: null }
    }
  } catch {
    /* not a parseable position */
  }
  return null
}

// Human phrase for a centipawn loss. Mate-magnitude losses (≥ 20 pawns) read as a blunder rather
// than an absurd "999.0 pawns worse".
export function formatLoss(cpLoss) {
  if (cpLoss >= 2000) return 'a game-losing blunder'
  return `about ${(cpLoss / 100).toFixed(1)} pawns worse`
}

// Collapse a { cp, mate } eval into a single White-perspective centipawn scalar so we can
// do arithmetic (e.g. how much did this move lose?). Mates become very large numbers,
// scaled by distance so "mate in 1" beats "mate in 5".
export function toScore({ cp, mate }) {
  if (mate != null) return mate > 0 ? MATE_SCORE - mate * 100 : -MATE_SCORE - mate * 100
  return cp ?? 0
}

// Centipawn loss for the player who just moved, given the eval before and after the move.
// before/after are { cp, mate } from White's view; moverIsWhite picks the sign.
export function centipawnLoss(before, after, moverIsWhite) {
  const sign = moverIsWhite ? 1 : -1
  const loss = (toScore(before) - toScore(after)) * sign
  return Math.max(0, loss)
}

// Beginner-tuned thresholds. A ~750 player mostly needs the big drops surfaced.
export function classifyLoss(cpLoss) {
  if (cpLoss >= 250) return 'blunder'
  if (cpLoss >= 120) return 'mistake'
  if (cpLoss >= 60) return 'inaccuracy'
  return null
}

export const MOVE_QUALITY = {
  blunder: { label: 'Blunder', symbol: '??', color: '#e0524b' },
  mistake: { label: 'Mistake', symbol: '?', color: '#e8974f' },
  inaccuracy: { label: 'Inaccuracy', symbol: '?!', color: '#e6c84a' },
}

// Pretty eval string from White's perspective, e.g. "+1.4", "-0.7", "M3", "M-2".
export function formatEval({ cp, mate }) {
  if (mate != null) return `M${mate}`
  if (cp != null && Math.abs(cp) >= 20000) return cp > 0 ? '+M' : '-M' // decisive / checkmate
  const pawns = (cp ?? 0) / 100
  const sign = pawns > 0 ? '+' : ''
  return `${sign}${pawns.toFixed(1)}`
}

// Map a White-perspective eval to a 0..1 "White winning" fraction for the eval bar.
// Uses a smooth logistic on centipawns; mates pin to the ends.
export function whiteWinFraction({ cp, mate }) {
  if (mate != null) return mate > 0 ? 1 : 0
  const c = Math.max(-1500, Math.min(1500, cp ?? 0))
  return 1 / (1 + Math.pow(10, -c / 400))
}

// Convert a UCI move ("e2e4", "e7e8q") to from/to/promotion for chess.js.
export function uciToMove(uci) {
  if (!uci || uci.length < 4) return null
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4) || undefined }
}

// White's chance-of-winning as a 0..100 percentage (Lichess' logistic on centipawns).
export function winPercent({ cp, mate }) {
  if (mate != null) return mate > 0 ? 100 : 0
  const c = Math.max(-1500, Math.min(1500, cp ?? 0))
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * c)) - 1)
}

// A chess.com / Lichess-style game accuracy (0–100) for ONE player, from per-position evals.
// scores[i] is the eval BEFORE move i; moves[i].color says who moved. We score only the
// requested side's moves: each move's "win% lost" maps to a per-move accuracy, then we average.
export function gameAccuracy(scores, moves, userColor) {
  const accs = []
  for (let i = 0; i < moves.length; i++) {
    if (moves[i].color !== userColor) continue
    const before = scores[i]
    const after = scores[i + 1]
    if (!before || !after) continue
    const wpBefore = userColor === 'w' ? winPercent(before) : 100 - winPercent(before)
    const wpAfter = userColor === 'w' ? winPercent(after) : 100 - winPercent(after)
    const drop = Math.max(0, wpBefore - wpAfter)
    const acc = 103.1668 * Math.exp(-0.04354 * drop) - 3.1669
    accs.push(Math.max(0, Math.min(100, acc)))
  }
  if (!accs.length) return null
  return Math.round(accs.reduce((s, x) => s + x, 0) / accs.length)
}
