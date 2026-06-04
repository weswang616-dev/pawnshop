// Pure helpers for turning engine evaluations into human-readable, blunder-aware feedback.
// No engine or DOM here — just math on { cp, mate } objects (always White's perspective).

const MATE_SCORE = 100000

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
  if (mate != null) return mate > 0 ? `M${mate}` : `M${mate}`
  const pawns = (cp ?? 0) / 100
  const sign = pawns > 0 ? '+' : pawns < 0 ? '' : ''
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
