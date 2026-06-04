// Essential endgames every improver must be able to win. You play the strong side; the engine
// defends. Goal 'mate' = deliver checkmate; goal 'promote' = get a pawn to the last rank.
export const endgames = [
  {
    id: 'kq-vs-k',
    name: 'King + Queen vs King',
    fen: '4k3/8/8/8/8/8/8/3QK3 w - - 0 1',
    goal: 'mate',
    blurb: 'Deliver checkmate with the queen and king.',
    tips: 'Box the king toward the edge by keeping your queen a knight’s-move away from it. Bring your own king up to support, then mate. Watch for stalemate — always leave the enemy king one legal square until the final mating move.',
  },
  {
    id: 'kr-vs-k',
    name: 'King + Rook vs King',
    fen: '4k3/8/8/8/8/8/8/R3K3 w - - 0 1',
    goal: 'mate',
    blurb: 'The fundamental rook checkmate.',
    tips: 'Cut the king off with your rook on a rank or file, march your king up to take the opposition (kings facing with one square between), then deliver the “ladder” mate. Use rook checks to push the king back one row at a time.',
  },
  {
    id: 'two-rooks-vs-k',
    name: 'Two Rooks vs King (ladder mate)',
    fen: '4k3/8/8/8/8/8/R7/R3K3 w - - 0 1',
    goal: 'mate',
    blurb: 'The easiest mate to learn — the staircase.',
    tips: 'Ladder mate: one rook checks to drive the king up a rank, then the other checks on the next rank, walking the king to the edge. If a rook is attacked, swing it to the far side of the board and keep checking.',
  },
  {
    id: 'kp-vs-k',
    name: 'King + Pawn vs King',
    fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1',
    goal: 'promote',
    blurb: 'Escort your pawn to promotion using the opposition.',
    tips: 'Your king is in front of the pawn on the 6th rank — this is winning. Use the opposition (force the enemy king to move first) to clear a path, then push the pawn through and promote. Don’t advance the pawn too early or you’ll lose the opposition.',
  },
]
