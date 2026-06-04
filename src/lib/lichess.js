// Fetch tactics puzzles from the free Lichess puzzle API (CORS-enabled, no auth needed
// for the basic endpoint). Puzzles are CC0-licensed and rated.
//
// Convention (verified empirically with chess.js): play the ENTIRE game.pgn, and the
// resulting side-to-move is the solver. puzzle.solution[0] is the solver's first move;
// solution alternates solver / opponent after that (even index = solver, odd = auto-reply).

export async function fetchPuzzle({ theme, difficulty } = {}) {
  const request = (useTheme) => {
    const params = new URLSearchParams()
    if (useTheme && theme) params.set('angle', theme)
    if (difficulty) params.set('difficulty', difficulty)
    const qs = params.toString()
    return fetch(`https://lichess.org/api/puzzle/next${qs ? `?${qs}` : ''}`, {
      headers: { Accept: 'application/json' },
    })
  }

  let res
  try {
    res = await request(true)
    // A themed angle can occasionally require auth; gracefully fall back to a mixed puzzle.
    if (!res.ok && theme) res = await request(false)
  } catch {
    throw new Error('Could not reach Lichess. Check your connection and try again.')
  }
  if (!res.ok) throw new Error(`Could not load a puzzle (Lichess ${res.status}).`)
  return res.json()
}

// A curated shortlist of beginner-relevant tactical themes for the puzzle filter.
// (Theme keys come from the Lichess puzzle theme taxonomy.)
export const PUZZLE_THEMES = [
  { key: '', label: 'Mixed (all themes)' },
  { key: 'fork', label: 'Forks' },
  { key: 'pin', label: 'Pins' },
  { key: 'skewer', label: 'Skewers' },
  { key: 'hangingPiece', label: 'Hanging pieces' },
  { key: 'discoveredAttack', label: 'Discovered attacks' },
  { key: 'backRankMate', label: 'Back-rank mates' },
  { key: 'mateIn1', label: 'Mate in 1' },
  { key: 'mateIn2', label: 'Mate in 2' },
]

export const PUZZLE_DIFFICULTY = [
  { key: 'easiest', label: 'Easiest' },
  { key: 'easier', label: 'Easier' },
  { key: 'normal', label: 'Normal' },
  { key: 'harder', label: 'Harder' },
]
