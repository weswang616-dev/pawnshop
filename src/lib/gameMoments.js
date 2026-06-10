// "Your games" moments for Lesson mode: scan the user's recent chess.com games for the
// first place they left their repertoire book ("departure"), and package each one as a
// ready-to-teach moment — the position, what they played, what the book plays and why,
// plus game context (opponent, result, date) for the narration.
//
// All matching is client-side and free: games come from the chess.com Published-Data API,
// departures from repertoireMatch (which derives book positions from the repertoire
// definitions — no training history needed).

import { Chess } from 'chess.js'
import { getRecentGames, parseGame, gameOutcome } from './chesscom'
import { findRepertoireDeparture } from './repertoireMatch'
import { bookMovesFor } from './srs'

const MAX_MOMENTS = 2
const GAMES_TO_SCAN = 20

function sanToFromTo(fen, san) {
  try {
    const m = new Chess(fen).move(san)
    return m ? { from: m.from, to: m.to } : null
  } catch {
    return null
  }
}

// Position part of a FEN (ignores move counters) — same keying as srs/repertoireMatch.
function fenKey(fen) {
  return fen.split(' ').slice(0, 4).join(' ')
}

// Pure: no network. `games` are chess.com game objects, newest first.
// Returns up to `max` moments for games where the user held `rep.color` and left
// THIS repertoire's book.
export function findBookDepartures(games, rep, username, max = MAX_MOMENTS) {
  const repColor = rep.color === 'white' ? 'w' : 'b'
  const user = String(username || '').trim().toLowerCase()
  const out = []
  const seen = new Set() // dedupe the same mistake made in several games
  for (const game of games) {
    if (out.length >= max) break
    const whiteUser = game.white?.username?.toLowerCase()
    const blackUser = game.black?.username?.toLowerCase()
    const userColor = whiteUser === user ? 'w' : blackUser === user ? 'b' : null
    if (!userColor || userColor !== repColor) continue
    let parsed
    try {
      parsed = parseGame(game.pgn)
    } catch {
      continue // odd PGN (variants, annotations chess.js rejects) — skip the game
    }
    const dep = findRepertoireDeparture(parsed.positions, parsed.moves, userColor)
    if (!dep || dep.repName !== rep.name) continue
    const fen = parsed.positions[dep.ply]
    const key = `${fenKey(fen)}|${dep.playedSan}`
    if (seen.has(key)) continue
    seen.add(key)
    const played = parsed.moves[dep.ply]
    const bookSan = dep.bookSans[0]
    const book = bookMovesFor(fen, rep.id)
    const idea = book.find((b) => b.move === bookSan)?.idea || ''
    const bookFT = sanToFromTo(fen, bookSan)
    const o = gameOutcome(game, userColor)
    out.push({
      fen,
      moveNo: dep.moveNo,
      playedSan: dep.playedSan,
      playedFrom: played.from,
      playedTo: played.to,
      bookSan,
      bookSans: dep.bookSans,
      bookFrom: bookFT?.from,
      bookTo: bookFT?.to,
      idea,
      opponent: o.opp,
      resultWord: o.win ? 'won' : o.draw ? 'drew' : 'lost',
      dateStr: new Date(game.end_time * 1000).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
      }),
      url: game.url,
    })
  }
  return out
}

// Fetch-and-match, with the fetch cached per username for the session: walking the monthly
// archives is several requests, but re-filtering cached games per repertoire is free.
let cache = { username: null, promise: null }

export function loadGameMoments(username, rep) {
  const user = String(username || '').trim().toLowerCase()
  if (!user) return Promise.resolve([])
  if (cache.username !== user) {
    const promise = getRecentGames(user, GAMES_TO_SCAN)
    // Don't cache a failure — let a later visit retry (rate limit, flaky network…).
    promise.catch(() => {
      if (cache.promise === promise) cache = { username: null, promise: null }
    })
    cache = { username: user, promise }
  }
  return cache.promise.then((games) => findBookDepartures(games, rep, user))
}
