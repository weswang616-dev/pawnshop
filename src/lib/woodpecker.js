// The Woodpecker Method: solve a FIXED set of puzzles, then repeat the same set over and over,
// going faster each cycle. Repetition burns the patterns into instinct — the single biggest
// driver of rating at the club level. We persist the set + per-cycle history in localStorage.
//
// Shape: { puzzles:[{id,rating,pgn,solution,themes}], cycle, size, difficulty, history:[{cycle,ms,correct,total}] }

const KEY = 'woodpecker-set-v1'

export function loadSet() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null
  } catch {
    return null
  }
}

export function saveSet(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify(set))
  } catch {
    /* ignore */
  }
}

export function clearSet() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

// mm:ss from milliseconds.
export function fmtTime(ms) {
  const s = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
