// Browser text-to-speech via the Web Speech API — free, offline, no API key.
//
// Two jobs:
//   1) speak()      — pick the best-sounding natural voice available and read text clearly.
//   2) speechify()  — turn chess notation (SAN) into plain English so narration is easy to
//                     follow BY EAR. "Be4" → "bishop to e4", "Nxf3" → "knight takes f3",
//                     "O-O" → "castles kingside", "exd5" → "pawn takes d5", "e8=Q" →
//                     "pawn to e8 promoting to queen", "Rad1" → "rook a to d1", "+"/"#" →
//                     "check"/"checkmate". speak() runs ALL text through speechify(), so the
//                     board still SHOWS "Be4" while the voice SAYS "bishop to e4".

export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

const PIECE = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight' }
const PROMO = { Q: 'queen', R: 'rook', B: 'bishop', N: 'knight' }

// Convert ONE algebraic move (SAN) into spoken English.
// Handles piece moves, captures, castling, check/mate, promotion, disambiguation,
// en passant, and a leading "…"/"..." black-move marker.
export function moveToSpeech(raw) {
  if (!raw) return ''
  let san = String(raw).trim()
  // Drop a leading black-move marker ("…Bd6" / "...Bd6").
  san = san.replace(/^(?:…|\.\.\.)/, '')

  // Trailing check / checkmate.
  let suffix = ''
  if (san.includes('#')) suffix = ' checkmate'
  else if (san.includes('+')) suffix = ' check'
  san = san.replace(/[+#]/g, '').replace(/[!?]+/g, '')

  // En passant marker, if the notation carries one (chess.js usually omits it).
  let ep = ''
  if (/e\.?p\.?$/i.test(san)) {
    ep = ' en passant'
    san = san.replace(/\s*e\.?p\.?$/i, '')
  }

  // Castling.
  if (san === 'O-O' || san === '0-0') return 'castles kingside' + suffix
  if (san === 'O-O-O' || san === '0-0-0') return 'castles queenside' + suffix

  // Promotion suffix like "=Q".
  let promo = ''
  const pm = san.match(/=([QRBN])$/)
  if (pm) {
    promo = ' promoting to ' + PROMO[pm[1]]
    san = san.replace(/=([QRBN])$/, '')
  }

  const isCapture = san.includes('x')

  // Piece move (starts with K/Q/R/B/N).
  if (/^[KQRBN]/.test(san)) {
    const piece = PIECE[san[0]]
    const rest = san.slice(1)
    const dest = rest.slice(-2) // last file+rank is the destination
    const disamb = rest.slice(0, -2).replace('x', '') // file/rank hint, e.g. "a" in Rad1
    const disambWord = disamb ? ' ' + disamb.split('').join(' ') : ''
    const verb = isCapture ? ' takes ' : ' to '
    return piece + disambWord + verb + dest + promo + ep + suffix
  }

  // Pawn capture, e.g. "exd5" → "pawn takes d5".
  if (isCapture) {
    return 'pawn takes ' + san.slice(-2) + promo + ep + suffix
  }
  // Pawn promotion push, e.g. "e8=Q" → "pawn to e8 promoting to queen".
  if (promo) return 'pawn to ' + san + promo + suffix
  // Plain pawn push "e4" stays as the square (reads "e four").
  return san + suffix
}

// A SAN-looking token in free prose. Order matters: longest castling first, then piece
// moves, then pawn captures, then plain squares/pushes. Word-boundary guards keep us from
// matching inside ordinary words. Optional leading "…" marks a black move in the coaching text.
const SAN_RE =
  /(?<![A-Za-z0-9])(?:…|\.\.\.)?(?:O-O-O|O-O|0-0-0|0-0|[KQRBN][a-h1-8]?x?[a-h][1-8](?:=[QRBN])?|[a-h]x[a-h][1-8](?:=[QRBN])?|[a-h][1-8](?:=[QRBN])?)[+#]?(?![A-Za-z0-9])/g

// Replace every SAN token in `text` with its spoken-English form. Safe to run on any
// narration string — plain squares like "e4" are left as the square (they read fine).
export function speechify(text) {
  if (!text) return text
  try {
    return String(text).replace(SAN_RE, (tok) => moveToSpeech(tok))
  } catch {
    // Lookbehind unsupported on a very old browser — just read the raw text.
    return String(text)
  }
}

// ---- Voice selection: rank voices by naturalness, allow a manual override ----
// Web Speech uses the OS/browser voices, whose quality varies wildly (many default voices
// sound robotic). We SCORE the available English voices and pick the most natural one — and
// let the user override it from the UI (saved in localStorage) since the best voice differs
// per machine and only the listener can really judge it.

let cachedVoice = null
const VOICE_PREF_KEY = 'tts-voice-uri'

// Novelty / low-quality voices that sound robotic — push them to the bottom.
const ROBOTIC =
  /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|kathy|princess|ralph|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|wobble)\b/i

// Higher score = more natural-sounding. Tuned for macOS / Chrome / Edge voice names.
function voiceScore(v) {
  if (!/^en/i.test(v.lang)) return -1000 // English only
  const n = v.name || ''
  let s = 0
  if (/online|natural|neural/i.test(n)) s += 100 // MS "Online (Natural)" neural voices
  if (/premium/i.test(n)) s += 95 // macOS Premium voices (best local quality)
  if (/siri/i.test(n)) s += 90
  if (/enhanced/i.test(n)) s += 75 // macOS Enhanced voices
  if (/google/i.test(n)) s += 60 // Google voices sound fairly natural
  if (/\b(ava|samantha|allison|zoe|evan|nathan|joelle|serena|stephanie|nicky|aaron|tom|kate|jamie|matilda|isha|noelle)\b/i.test(n)) s += 25
  if (v.localService === false) s += 12 // network voices are usually higher quality
  if (/en[-_]US/i.test(v.lang)) s += 10
  else if (/en[-_](GB|AU|IE)/i.test(v.lang)) s += 6
  if (ROBOTIC.test(n)) s -= 200
  return s
}

export function getPreferredVoiceURI() {
  try {
    return localStorage.getItem(VOICE_PREF_KEY) || ''
  } catch {
    return ''
  }
}

export function setPreferredVoiceURI(uri) {
  try {
    if (uri) localStorage.setItem(VOICE_PREF_KEY, uri)
    else localStorage.removeItem(VOICE_PREF_KEY)
  } catch {
    /* ignore */
  }
  cachedVoice = null // force a re-pick on the next utterance
}

function pickVoice() {
  if (!speechSupported) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  // Honor an explicit user choice if it's still available.
  const pref = getPreferredVoiceURI()
  if (pref) {
    const chosen = voices.find((v) => v.voiceURI === pref)
    if (chosen) return chosen
  }
  // Otherwise pick the highest-scoring (most natural) English voice.
  const ranked = voices.map((v) => ({ v, s: voiceScore(v) })).sort((a, b) => b.s - a.s)
  return ranked[0] && ranked[0].s > -1000 ? ranked[0].v : voices[0]
}

function ensureVoice() {
  if (!cachedVoice) cachedVoice = pickVoice()
  return cachedVoice
}

// English voices, best-sounding first — for the voice-picker dropdown.
export function listEnglishVoices() {
  if (!speechSupported) return []
  return window.speechSynthesis
    .getVoices()
    .filter((v) => /^en/i.test(v.lang))
    .map((v) => ({ v, s: voiceScore(v) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.v)
}

if (speechSupported) {
  // Voices populate asynchronously in most browsers — refresh our auto-pick when they arrive.
  const refresh = () => {
    if (!getPreferredVoiceURI()) cachedVoice = pickVoice()
  }
  window.speechSynthesis.addEventListener?.('voiceschanged', refresh)
  window.speechSynthesis.getVoices() // kick off population
}

// ---- Speaking ----

// Chrome stops speaking after ~15s; a periodic pause/resume keeps long narration alive.
let keepAlive = null
function startKeepAlive() {
  stopKeepAlive()
  keepAlive = setInterval(() => {
    if (!speechSupported) return stopKeepAlive()
    const s = window.speechSynthesis
    if (s.speaking) {
      s.pause()
      s.resume()
    } else {
      stopKeepAlive()
    }
  }, 10000)
}
function stopKeepAlive() {
  if (keepAlive) {
    clearInterval(keepAlive)
    keepAlive = null
  }
}

export function speak(text, onEnd, opts = {}) {
  if (!speechSupported || !text) return false
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(speechify(String(text)))
  const voice = ensureVoice()
  if (voice) {
    u.voice = voice
    u.lang = voice.lang
  }
  // Base rate is a touch slower so moves are easy to follow; opts.rate is a user-facing
  // playback-speed multiplier (e.g. the lesson player's 0.8× / 1× / 1.25×).
  u.rate = Math.min(2, Math.max(0.5, 0.95 * (opts.rate || 1)))
  u.pitch = 1
  u.volume = 1
  u.onend = () => {
    stopKeepAlive()
    if (onEnd) onEnd()
  }
  u.onerror = () => {
    stopKeepAlive()
    if (onEnd) onEnd()
  }
  synth.speak(u)
  startKeepAlive()
  return true
}

export function stopSpeaking() {
  if (speechSupported) window.speechSynthesis.cancel()
  stopKeepAlive()
}
