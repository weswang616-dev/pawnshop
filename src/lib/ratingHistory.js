// Keeps a daily snapshot of your chess.com ratings so the dashboard can graph your progress.
const KEY = 'rating-history-v1'

export function recordRatings(ratings, today) {
  if (!ratings) return getRatingHistory()
  let hist = getRatingHistory()
  const day = today || new Date().toISOString().slice(0, 10)
  hist = hist.filter((h) => h.date !== day)
  hist.push({ date: day, rapid: ratings.rapid ?? null, blitz: ratings.blitz ?? null })
  hist = hist.sort((a, b) => a.date.localeCompare(b.date)).slice(-90)
  try {
    localStorage.setItem(KEY, JSON.stringify(hist))
  } catch {
    /* ignore */
  }
  return hist
}

export function getRatingHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}
