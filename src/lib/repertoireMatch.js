// Find where a game left YOUR repertoire. We build a map of every prepared position → the
// book move(s) you trained (across all your repertoires), then walk the game looking for the
// first time you were in a known book position but played a move that wasn't your prepared one.
import { allCardMetas } from './srs'

function key(fen) {
  return fen.split(' ').slice(0, 4).join(' ')
}

// Returns { ply, moveNo, playedSan, bookSans:[], repName } for the first departure, or null if
// you followed your repertoire as far as your prep went (or the game never entered it).
export function findRepertoireDeparture(positions, moves, userColor) {
  const book = new Map() // posKey -> { sans:Set<string>, repName }
  for (const m of allCardMetas()) {
    const metaColor = m.color === 'white' ? 'w' : 'b'
    if (metaColor !== userColor) continue
    const k = key(m.fen)
    if (!book.has(k)) book.set(k, { sans: new Set(), repName: m.repName })
    book.get(k).sans.add(m.move)
  }
  if (!book.size) return null

  let sawBook = false
  for (let i = 0; i < moves.length; i++) {
    if (moves[i].color !== userColor) continue
    const entry = book.get(key(positions[i]))
    if (!entry) {
      // No prep for this position. If we'd already been following book, our line simply ran
      // out (or the opponent went off-book) — that's not YOU leaving your repertoire.
      if (sawBook) return null
      continue
    }
    if (entry.sans.has(moves[i].san)) {
      sawBook = true
      continue
    }
    // We had a prepared move here, but you played something else — this is the departure.
    return {
      ply: i,
      moveNo: Math.floor(i / 2) + 1,
      playedSan: moves[i].san,
      bookSans: [...entry.sans],
      repName: entry.repName,
    }
  }
  return null
}
