// Browser text-to-speech via the Web Speech API — free, offline, no API key.
export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text, onEnd) {
  if (!speechSupported || !text) return false
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 1
  u.pitch = 1
  if (onEnd) u.onend = onEnd
  window.speechSynthesis.speak(u)
  return true
}

export function stopSpeaking() {
  if (speechSupported) window.speechSynthesis.cancel()
}
