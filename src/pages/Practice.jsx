import { useState } from 'react'
import PlayEngine from '../components/PlayEngine'
import MistakesTrainer from '../components/MistakesTrainer'
import EndgameTrainer from '../components/EndgameTrainer'

export default function Practice() {
  const [tab, setTab] = useState('mistakes')
  return (
    <div className="page">
      <div className="page-head">
        <h1>Practice</h1>
        <p className="muted">
          Drill the blunders from your own games, play full games at your level, and master the endgames you must know.
        </p>
        <div className="seg big">
          <button className={tab === 'mistakes' ? 'on' : ''} onClick={() => setTab('mistakes')}>🩹 My Mistakes</button>
          <button className={tab === 'play' ? 'on' : ''} onClick={() => setTab('play')}>🆚 Play</button>
          <button className={tab === 'endgames' ? 'on' : ''} onClick={() => setTab('endgames')}>🏁 Endgames</button>
        </div>
      </div>
      {tab === 'mistakes' && <MistakesTrainer />}
      {tab === 'play' && <PlayEngine />}
      {tab === 'endgames' && <EndgameTrainer />}
    </div>
  )
}
