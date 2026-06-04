// Minimal client for the chess.com Published-Data API (https://api.chess.com/pub).
// Public, read-only, no API key, and CORS-enabled (Access-Control-Allow-Origin: *),
// so we can call it straight from the browser.

const BASE = 'https://api.chess.com/pub'

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (res.status === 404) throw new Error('That username was not found on chess.com.')
  if (res.status === 429) throw new Error('chess.com is rate-limiting us — wait a few seconds and retry.')
  if (!res.ok) throw new Error(`chess.com API error (${res.status}).`)
  return res.json()
}

export async function getPlayerProfile(username) {
  return getJson(`${BASE}/player/${username.trim().toLowerCase()}`)
}

export async function getPlayerStats(username) {
  return getJson(`${BASE}/player/${username.trim().toLowerCase()}/stats`)
}

// Pull the most recent games by walking monthly archives newest-first until we have `max`.
// Returns raw chess.com game objects (each has .pgn, .white, .black, .time_class, .url, ...).
export async function getRecentGames(username, max = 20) {
  const user = username.trim().toLowerCase()
  const { archives } = await getJson(`${BASE}/player/${user}/games/archives`)
  if (!archives || archives.length === 0) return []

  const games = []
  for (let i = archives.length - 1; i >= 0 && games.length < max; i--) {
    const data = await getJson(archives[i])
    const monthGames = (data.games || []).filter((g) => g.pgn && g.rules === 'chess')
    games.push(...monthGames)
  }
  return games.sort((a, b) => b.end_time - a.end_time).slice(0, max)
}

// Pull out the rapid / blitz / bullet ratings for a quick dashboard summary.
export function summariseStats(stats) {
  const pick = (key) => stats?.[key]?.last?.rating ?? null
  return {
    rapid: pick('chess_rapid'),
    blitz: pick('chess_blitz'),
    bullet: pick('chess_bullet'),
    daily: pick('chess_daily'),
  }
}
