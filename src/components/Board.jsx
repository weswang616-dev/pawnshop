import { useEffect, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// Thin wrapper over react-chessboard v5. Supports BOTH drag and click-to-move:
// click a piece to select it (legal targets light up), then click a square to move.
// onDrop(from, to) is the single move handler — it should return true if the move is accepted.
export default function Board({
  fen,
  onDrop,
  orientation = 'white',
  arrows = [],
  squareStyles = {},
  allowDragging = true,
  id = 'board',
}) {
  const position = !fen || fen === 'start' ? START_FEN : fen
  const [selected, setSelected] = useState(null)

  // Clear any selection whenever the position changes (a move was made, puzzle advanced, etc.).
  useEffect(() => setSelected(null), [position])

  const interactive = allowDragging && !!onDrop

  function legalTargets(from) {
    try {
      return new Chess(position).moves({ square: from, verbose: true }).map((m) => m.to)
    } catch {
      return []
    }
  }

  function clickSquare(square) {
    if (!interactive) return
    if (selected) {
      if (square === selected) return setSelected(null)
      const accepted = onDrop(selected, square)
      // If rejected, allow re-selecting another of your own pieces.
      setSelected(accepted ? null : legalTargets(square).length ? square : null)
      return
    }
    if (legalTargets(square).length) setSelected(square)
  }

  // Build selection highlights, then let parent-provided squareStyles win (e.g. blunder tints).
  const selectionStyles = {}
  if (selected) {
    selectionStyles[selected] = { background: 'rgba(124, 179, 66, 0.45)' }
    for (const t of legalTargets(selected)) {
      selectionStyles[t] = {
        background: 'radial-gradient(circle, rgba(124,179,66,0.7) 24%, transparent 26%)',
      }
    }
  }

  const options = {
    id,
    position,
    boardOrientation: orientation,
    arrows,
    squareStyles: { ...selectionStyles, ...squareStyles },
    allowDragging,
    animationDurationInMs: 200,
    onPieceDrop: ({ sourceSquare, targetSquare }) => {
      if (!targetSquare || !onDrop) return false
      setSelected(null)
      return onDrop(sourceSquare, targetSquare)
    },
    onSquareClick: ({ square }) => clickSquare(square),
  }
  return (
    <div className="board-wrap">
      <Chessboard options={options} />
    </div>
  )
}
