import { useEffect, useState } from 'react'
import { speak, stopSpeaking, speechSupported } from '../lib/speak'

// A play/stop button that reads `text` aloud. Renders nothing if TTS isn't supported.
export default function SpeakButton({ text, label = 'Explain out loud' }) {
  const [playing, setPlaying] = useState(false)
  useEffect(() => () => stopSpeaking(), [])
  if (!speechSupported) return null

  function toggle() {
    if (playing) {
      stopSpeaking()
      setPlaying(false)
    } else {
      speak(text, () => setPlaying(false))
      setPlaying(true)
    }
  }

  return (
    <button className="speak-btn" onClick={toggle} title="Read this aloud">
      {playing ? '⏹ Stop' : `🔊 ${label}`}
    </button>
  )
}
