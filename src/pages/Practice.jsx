import { useSearchParams } from 'react-router-dom'
import PlayEngine from '../components/PlayEngine'
import MistakesTrainer from '../components/MistakesTrainer'
import EndgameTrainer from '../components/EndgameTrainer'
import GuessTheMove from '../components/GuessTheMove'
import Woodpecker from '../components/Woodpecker'

const TABS = ['mistakes', 'guess', 'woodpecker', 'play', 'endgames']

export default function Practice() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'mistakes'
  const setTab = (t) => setParams(t === 'mistakes' ? {} : { tab: t }, { replace: true })

  return (
    <div className="page">
      <div className="page-head">
        <h1>Practice</h1>
        <p className="muted">
          Drill the blunders from your own games, burn in patterns with the Woodpecker method, guess the moves of
          chess legends, play full games, and master the endgames you must know.
        </p>
        <div className="seg big">
          <button className={tab === 'mistakes' ? 'on' : ''} onClick={() => setTab('mistakes')}>🩹 My Mistakes</button>
          <button className={tab === 'woodpecker' ? 'on' : ''} onClick={() => setTab('woodpecker')}>🪵 Woodpecker</button>
          <button className={tab === 'guess' ? 'on' : ''} onClick={() => setTab('guess')}>🎯 Guess the Move</button>
          <button className={tab === 'play' ? 'on' : ''} onClick={() => setTab('play')}>🆚 Play</button>
          <button className={tab === 'endgames' ? 'on' : ''} onClick={() => setTab('endgames')}>🏁 Endgames</button>
        </div>
      </div>
      {tab === 'mistakes' && <MistakesTrainer />}
      {tab === 'woodpecker' && <Woodpecker />}
      {tab === 'guess' && <GuessTheMove />}
      {tab === 'play' && <PlayEngine />}
      {tab === 'endgames' && <EndgameTrainer />}
    </div>
  )
}
