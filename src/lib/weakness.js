// Turns the engine's blunder findings into a coarse, honest "what are you bad at" profile,
// then maps that to Lichess puzzle themes so we can train exactly those weaknesses.
//
// We don't claim surgical tactic naming — we bucket each flagged move into one of four
// beginner-relevant themes using simple, robust heuristics on the resulting position.
import { Chess } from 'chess.js'

const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

// Theme key -> display + the Lichess "angle" used to fetch matching puzzles.
export const THEME_INFO = {
  hangingPiece: {
    label: 'Hanging pieces',
    angle: 'hangingPiece',
    tip: 'You left pieces undefended. Before every move, ask: “is it safe? what can he take?”',
  },
  fork: {
    label: 'Forks & double attacks',
    angle: 'fork',
    tip: 'Pieces got hit two-at-once. Watch for knight and queen forks on both sides.',
  },
  mate: {
    label: 'King safety',
    angle: 'mateIn2',
    tip: 'Your king got caught. Castle early and learn the common mating patterns.',
  },
  tactics: {
    label: 'General tactics',
    angle: '',
    tip: 'Mixed tactical slips — keep grinding pattern recognition.',
  },
}

function mateAgainstUser(scoreAfter, userColor) {
  if (!scoreAfter || scoreAfter.mate == null) return false
  return userColor === 'w' ? scoreAfter.mate < 0 : scoreAfter.mate > 0
}

// User pieces (value >= 3) left attacked-and-underdefended in `fen` (position after the blunder).
function loosePieces(fen, userColor) {
  const c = new Chess(fen)
  const opp = userColor === 'w' ? 'b' : 'w'
  const loose = []
  for (const row of c.board()) {
    for (const sq of row) {
      if (!sq || sq.color !== userColor || VALUE[sq.type] < 3) continue
      if (!c.isAttacked(sq.square, opp)) continue
      const defended = c.isAttacked(sq.square, userColor)
      const hasCheaperAttacker = c
        .attackers(sq.square, opp)
        .some((a) => VALUE[(c.get(a) || {}).type] < VALUE[sq.type])
      if (!defended || hasCheaperAttacker) loose.push(sq.square)
    }
  }
  return loose
}

// Classify one flagged move. `fenAfter` = position after the user's bad move; `scoreAfter`
// = its White-perspective eval { cp, mate }. Returns a THEME_INFO key.
export function classifyBlunder(fenAfter, userColor, scoreAfter) {
  if (mateAgainstUser(scoreAfter, userColor)) return 'mate'
  let loose
  try {
    loose = loosePieces(fenAfter, userColor)
  } catch {
    return 'tactics'
  }
  if (loose.length >= 2) return 'fork'
  if (loose.length >= 1) return 'hangingPiece'
  return 'tactics'
}

const PROFILE_KEY = 'weakness-profile-v1'

function emptyProfile() {
  return { themes: { hangingPiece: 0, fork: 0, mate: 0, tactics: 0 }, totalFlagged: 0, games: [] }
}

export function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || emptyProfile()
  } catch {
    return emptyProfile()
  }
}

// Fold one analyzed game's themes into the saved profile (idempotent per game key).
export function recordGameThemes(gameKey, themeList) {
  const profile = loadProfile()
  if (profile.games.includes(gameKey)) return profile
  for (const t of themeList) {
    profile.themes[t] = (profile.themes[t] || 0) + 1
    profile.totalFlagged += 1
  }
  profile.games.push(gameKey)
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch {
    /* ignore */
  }
  return profile
}

// The user's single biggest weakness (or null if nothing recorded yet).
export function topWeakness(profile = loadProfile()) {
  const entries = Object.entries(profile.themes).filter(([, n]) => n > 0)
  if (!entries.length) return null
  entries.sort((a, b) => b[1] - a[1])
  const [key, count] = entries[0]
  return { key, count, ...THEME_INFO[key] }
}
