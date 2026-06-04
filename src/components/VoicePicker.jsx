import { useEffect, useState } from 'react'
import {
  speechSupported,
  listEnglishVoices,
  getPreferredVoiceURI,
  setPreferredVoiceURI,
  speak,
} from '../lib/speak'

const SAMPLE = 'Bishop to e4. Knight takes f3. Castles kingside. This is how your coach will sound.'

// Lets the user choose the narration voice (saved globally) and test it live. Renders nothing
// if the browser has no speech support / no voices.
export default function VoicePicker() {
  const [voices, setVoices] = useState(() => listEnglishVoices())
  const [uri, setUri] = useState(() => getPreferredVoiceURI())

  useEffect(() => {
    if (!speechSupported) return
    const load = () => setVoices(listEnglishVoices())
    load()
    window.speechSynthesis.addEventListener?.('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', load)
  }, [])

  if (!speechSupported || voices.length === 0) return null

  function choose(value) {
    setUri(value)
    setPreferredVoiceURI(value)
    speak(SAMPLE) // preview the new voice immediately
  }

  return (
    <div className="voice-picker">
      <label>
        🎙 Coach voice
        <select value={uri} onChange={(e) => choose(e.target.value)}>
          <option value="">Auto — best available</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name}
              {v.localService === false ? ' (online)' : ''}
            </option>
          ))}
        </select>
      </label>
      <button className="btn-ghost" onClick={() => speak(SAMPLE)} type="button">
        ▶ Test voice
      </button>
      <p className="muted small">
        Sounds robotic? Pick another voice above. On a Mac, the most human voices are the
        <b> “Premium”</b> ones — download them in <i>System Settings → Accessibility → Spoken
        Content → System Voice → Manage Voices</i>, then choose one here.
      </p>
    </div>
  )
}
