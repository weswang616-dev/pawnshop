// Spaced-repetition deck built from YOUR blunders. Every mistake Game Review finds becomes a
// flashcard: the position right before your bad move, where you must now find the better move.
// FSRS resurfaces them until you stop making them. This is the app's signature feature.
import { fsrs, createEmptyCard, Rating, State } from 'ts-fsrs'

const scheduler = fsrs()
const KEY = 'mistake-cards-v1'
const NEW_PER_SESSION = 12

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
function revive(card) {
  return {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  }
}
function fenKey(fen) {
  return fen.split(' ').slice(0, 4).join(' ')
}
function isNew(entry) {
  return entry.card.state === State.New || entry.card.reps === 0
}

// Add mistakes captured from a game review. Each meta: { fen, bestMove(uci), bestSan, played(san),
// reason, lineSan[], gameUrl, color }. Deduped by position so the same blunder isn't stored twice.
export function addMistakes(list) {
  if (!list || !list.length) return
  const store = load()
  for (const meta of list) {
    if (!meta.fen || !meta.bestMove) continue
    const id = `${fenKey(meta.fen)}|${meta.bestMove}`
    if (!store[id]) store[id] = { meta: { ...meta, id }, card: createEmptyCard(new Date()) }
    else store[id] = { ...store[id], meta: { ...meta, id } }
  }
  save(store)
}

export function getQueue(now = new Date()) {
  const entries = Object.values(load()).map((e) => ({ ...e, card: revive(e.card) }))
  const due = entries.filter((e) => !isNew(e) && e.card.due <= now).sort((a, b) => a.card.due - b.card.due)
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
  const entries = Object.values(load()).map((e) => ({ ...e, card: revive(e.card) }))
  return {
    total: entries.length,
    fresh: entries.filter(isNew).length,
    due: entries.filter((e) => !isNew(e) && e.card.due <= now).length,
    learned: entries.filter((e) => e.card.state === State.Review).length,
  }
}

export { Rating }
