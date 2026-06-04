// Spaced-repetition store for opening repertoires, backed by FSRS (the modern algorithm,
// via ts-fsrs). Each *user move* in a repertoire becomes its own card — per-move scheduling,
// exactly like Chessable's MoveTrainer. Cards persist in localStorage.
import { fsrs, createEmptyCard, Rating, State } from 'ts-fsrs'
import { Chess } from 'chess.js'
import { repertoires } from './repertoires'

const scheduler = fsrs()
const KEY = 'srs-cards-v1'
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

// One card per user-color move in a repertoire: the question is the position BEFORE the move.
function cardMetasForRep(rep) {
  const userColor = rep.color === 'white' ? 'w' : 'b'
  const board = new Chess()
  const out = []
  for (let i = 0; i < rep.line.length; i++) {
    const ply = rep.line[i]
    if (ply.by === userColor) {
      out.push({
        id: `${rep.id}:${i}`,
        repId: rep.id,
        repName: rep.name,
        color: rep.color,
        fen: board.fen(),
        move: ply.move,
        idea: ply.idea,
      })
    }
    board.move(ply.move)
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
  for (const meta of allCardMetas()) {
    if (!store[meta.id]) {
      store[meta.id] = { meta, card: createEmptyCard(new Date()) }
      changed = true
    } else if (store[meta.id].meta.move !== meta.move || store[meta.id].meta.idea !== meta.idea) {
      store[meta.id].meta = meta
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
export function getQueue(now = new Date()) {
  const entries = Object.values(seed()).map((e) => ({ ...e, card: revive(e.card) }))
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

export function stats(now = new Date()) {
  const entries = Object.values(seed()).map((e) => ({ ...e, card: revive(e.card) }))
  return {
    total: entries.length,
    fresh: entries.filter(isNew).length,
    due: entries.filter((e) => !isNew(e) && e.card.due <= now).length,
    learned: entries.filter((e) => e.card.state === State.Review).length,
  }
}

export { Rating }
