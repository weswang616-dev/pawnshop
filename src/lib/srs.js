// Spaced-repetition store for opening repertoires, backed by FSRS (the modern algorithm,
// via ts-fsrs). Each *user move* in a repertoire becomes its own card — per-move scheduling,
// exactly like Chessable's MoveTrainer. Cards persist in localStorage.
import { fsrs, createEmptyCard, Rating, State } from 'ts-fsrs'
import { Chess } from 'chess.js'
import { repertoires } from './repertoires'

const scheduler = fsrs()
const KEY = 'srs-cards-v2' // v2: position-keyed cards across all variations
const NEW_PER_SESSION = 8 // cap how many brand-new moves we introduce at once

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}
function save(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* ignore */
  }
}

// FSRS cards carry Date fields; JSON turns them into strings, so revive on the way out.
function revive(card) {
  return {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  }
}

// Position part of a FEN (ignores move counters) so identical positions across variations share a card.
function fenKey(fen) {
  return fen.split(' ').slice(0, 4).join(' ')
}

// One card per (position, your move) across ALL variations of a repertoire, deduped so shared
// opening moves aren't drilled twice. The question is the position BEFORE your move.
function cardMetasForRep(rep) {
  const userColor = rep.color === 'white' ? 'w' : 'b'
  const seen = new Set()
  const out = []
  for (const variation of rep.variations) {
    const board = new Chess()
    for (const ply of variation.line) {
      if (ply.by === userColor) {
        const fen = board.fen()
        const key = `${fenKey(fen)}|${ply.move}`
        if (!seen.has(key)) {
          seen.add(key)
          out.push({
            id: `${rep.id}|${key}`,
            repId: rep.id,
            repName: rep.name,
            color: rep.color,
            fen,
            move: ply.move,
            idea: ply.idea,
          })
        }
      }
      board.move(ply.move)
    }
  }
  return out
}

export function allCardMetas() {
  return repertoires.flatMap(cardMetasForRep)
}

// Make sure every repertoire move has a card; refresh metadata if the repertoire changed.
export function seed() {
  const store = load()
  let changed = false
  const valid = new Set()
  for (const meta of allCardMetas()) {
    valid.add(meta.id)
    if (!store[meta.id]) {
      store[meta.id] = { meta, card: createEmptyCard(new Date()) }
      changed = true
    } else if (store[meta.id].meta.move !== meta.move || store[meta.id].meta.idea !== meta.idea) {
      store[meta.id].meta = meta
      changed = true
    }
  }
  // Prune cards whose move/repertoire no longer exists (e.g. an opening we removed),
  // so dropped lines don't keep resurfacing in the review queue.
  for (const id of Object.keys(store)) {
    if (!valid.has(id)) {
      delete store[id]
      changed = true
    }
  }
  if (changed) save(store)
  return store
}

function isNew(entry) {
  return entry.card.state === State.New || entry.card.reps === 0
}

// Build a study queue: everything due now (oldest first), then up to N fresh cards.
// Pass a repId to drill a single opening; null/undefined studies the whole repertoire.
export function getQueue(repId = null, now = new Date()) {
  let entries = Object.values(seed()).map((e) => ({ ...e, card: revive(e.card) }))
  if (repId) entries = entries.filter((e) => e.meta.repId === repId)
  const due = entries
    .filter((e) => !isNew(e) && e.card.due <= now)
    .sort((a, b) => a.card.due - b.card.due)
  const fresh = entries.filter(isNew).slice(0, NEW_PER_SESSION)
  return [...due, ...fresh]
}

export function grade(id, rating, now = new Date()) {
  const store = load()
  const entry = store[id]
  if (!entry) return
  const { card } = scheduler.next(revive(entry.card), now, rating)
  store[id] = { ...entry, card }
  save(store)
}

export function stats(repId = null, now = new Date()) {
  let entries = Object.values(seed()).map((e) => ({ ...e, card: revive(e.card) }))
  if (repId) entries = entries.filter((e) => e.meta.repId === repId)
  return {
    total: entries.length,
    fresh: entries.filter(isNew).length,
    due: entries.filter((e) => !isNew(e) && e.card.due <= now).length,
    learned: entries.filter((e) => e.card.state === State.Review).length,
  }
}

export { Rating }
