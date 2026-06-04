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

// ---- Voice selection (prefer natural-sounding voices; they load asynchronously) ----

let cachedVoice = null

const PREFERRED_NAMES = [
  'Google US English',
  'Google UK English Female',
  'Google UK English Male',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Microsoft Guy Online (Natural) - English (United States)',
  'Samantha', // macOS — clear and natural
  'Allison',
  'Ava',
  'Tom',
  'Daniel', // en-GB
  'Karen', // en-AU
  'Tessa',
]

function pickVoice() {
  if (!speechSupported) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  // 1) A known high-quality voice by exact name.
  for (const name of PREFERRED_NAMES) {
    const v = voices.find((vo) => vo.name === name)
    if (v) return v
  }
  // 2) Any English voice that advertises itself as natural/neural/enhanced/premium.
  const enhanced = voices.find(
    (v) => /^en/i.test(v.lang) && /(natural|neural|enhanced|premium)/i.test(v.name),
  )
  if (enhanced) return enhanced
  // 3) A local en-US voice.
  const enUS = voices.find((v) => /^en[-_]US/i.test(v.lang))
  if (enUS) return enUS
  // 4) Any English voice, else the first available.
  return voices.find((v) => /^en/i.test(v.lang)) || voices[0]
}

function ensureVoice() {
  if (!cachedVoice) cachedVoice = pickVoice()
  return cachedVoice
}

export function listEnglishVoices() {
  if (!speechSupported) return []
  return window.speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang))
}

if (speechSupported) {
  // Voices populate asynchronously in most browsers — refresh our pick when they arrive.
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = pickVoice()
  }
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

export function speak(text, onEnd) {
  if (!speechSupported || !text) return false
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(speechify(String(text)))
  const voice = ensureVoice()
  if (voice) {
    u.voice = voice
    u.lang = voice.lang
  }
  u.rate = 0.95 // a touch slower so moves are easy to follow
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
