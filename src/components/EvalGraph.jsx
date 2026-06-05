import { whiteWinFraction } from '../lib/analysis'

// A small evaluation graph across the whole game, drawn from YOUR perspective: above the
// midline = you're winning, below = you're worse. Click anywhere to jump to that move.
export default function EvalGraph({ scores, ply, onSeek, userColor = 'w' }) {
  const fracs = scores.map((s) =>
    s ? (userColor === 'w' ? whiteWinFraction(s) : 1 - whiteWinFraction(s)) : null,
  )
  const n = fracs.length
  if (n < 2) return null

  const w = 600
  const h = 90
  const x = (i) => (i * w) / (n - 1)
  const y = (f) => h - f * h

  // Carry the last known eval across not-yet-analysed positions so the line stays continuous.
  let last = 0.5
  const coords = fracs.map((f, i) => {
    const v = f == null ? last : f
    last = v
    return [x(i), y(v)]
  })
  const line = coords.map(([cx, cy], i) => `${i ? 'L' : 'M'}${cx.toFixed(1)} ${cy.toFixed(1)}`).join(' ')
  const area = `${line} L${w} ${h} L0 ${h} Z`
  const curX = x(Math.max(0, Math.min(n - 1, ply)))

  function handleClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = (e.clientX - rect.left) / rect.width
    if (onSeek) onSeek(Math.round(Math.max(0, Math.min(1, frac)) * (n - 1)))
  }

  return (
    <svg
      className="eval-graph"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      onClick={handleClick}
      role="img"
      aria-label="Your evaluation across the game — above the line you're winning, below you're worse"
    >
      <line x1="0" y1={h / 2} x2={w} y2={h / 2} className="eg-mid" />
      <path d={area} className="eg-area" />
      <path d={line} className="eg-line" />
      <line x1={curX} y1="0" x2={curX} y2={h} className="eg-cursor" />
    </svg>
  )
}
