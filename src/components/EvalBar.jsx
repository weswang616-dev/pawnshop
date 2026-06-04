import { whiteWinFraction, formatEval } from '../lib/analysis'

// Vertical eval bar that sits next to the board. White's share fills from the bottom.
export default function EvalBar({ evalObj, orientation = 'white' }) {
  const frac = evalObj ? whiteWinFraction(evalObj) : 0.5
  const whitePct = Math.max(2, Math.min(98, frac * 100))
  const label = evalObj ? formatEval(evalObj) : '–'
  // When viewing from Black's side, flip so the player to move is always on the bottom.
  const flip = orientation === 'black'

  return (
    <div className={`eval-bar ${flip ? 'flip' : ''}`} title={`Evaluation: ${label} (White's perspective)`}>
      <div className="eval-bar-fill" style={{ height: `${whitePct}%` }} />
      <span className="eval-bar-label">{label}</span>
    </div>
  )
}
