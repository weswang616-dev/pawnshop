import { Chessboard } from 'react-chessboard'

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// Thin wrapper over react-chessboard v5 (which takes a single `options` object and sizes
// itself to its container). Exposes a friendlier prop shape and an onDrop(from, to, piece)
// callback that should return true if the move is accepted.
export default function Board({
  fen,
  onDrop,
  orientation = 'white',
  arrows = [],
  squareStyles = {},
  allowDragging = true,
  id = 'board',
}) {
  // react-chessboard v5 wants a real FEN — guard against 'start'/empty.
  const position = !fen || fen === 'start' ? START_FEN : fen
  const options = {
    id,
    position,
    boardOrientation: orientation,
    arrows,
    squareStyles,
    allowDragging,
    animationDurationInMs: 200,
    onPieceDrop: ({ sourceSquare, targetSquare }) => {
      if (!targetSquare || !onDrop) return false
      return onDrop(sourceSquare, targetSquare)
    },
  }
  return (
    <div className="board-wrap">
      <Chessboard options={options} />
    </div>
  )
}
