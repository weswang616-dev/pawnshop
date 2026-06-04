// Curated master games for the "Guess the Move" trainer. Public-domain classics chosen to
// reinforce Wesley's repertoire (1.e4 / Italian as White, Caro-Kann awareness) and to teach
// the ideas that win games at the club level: fast development, open lines, and the f7 attack.
//
// `moves` is space-separated SAN (no move numbers) — replayed move-by-move with chess.js.
// `side` is the colour the solver guesses. `notes` maps a 1-based ply index to a coaching
// line shown when that move is reached (kept light — just the instructive moments).

export const masterGames = [
  {
    id: 'legal-trap-1750',
    white: 'de Légal',
    black: 'Saint Brie',
    event: 'Paris',
    year: 1750,
    result: '1-0',
    side: 'w',
    eco: 'C41',
    blurb:
      "The oldest famous trap in chess. White ignores his queen to land a three-piece mate — the ultimate lesson in development beating greed.",
    moves: 'e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5 Bxd1 Bxf7+ Ke7 Nd5#',
    notes: {
      9: "Légal's Mate! White gives up the QUEEN — if 5...Bxd1, the three minor pieces deliver mate.",
      11: 'Bxf7+ drags the king out. Notice every White piece is developed and working; Black’s are not.',
      13: 'Nd5#. Three minor pieces mate the king while the queen sits on d1. Development > material.',
    },
  },
  {
    id: 'opera-game-1858',
    white: 'Paul Morphy',
    black: 'Duke / Count (consultation)',
    event: 'Paris Opera',
    year: 1858,
    result: '1-0',
    side: 'w',
    eco: 'C41',
    blurb:
      'The most famous game ever played. Morphy develops every piece with threats, sacrifices for open lines, and mates — the model game for "develop fast, attack the king."',
    moves:
      'e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5 Bc4 Nf6 Qb3 Qe7 Nc3 c6 Bg5 b5 Nxb5 cxb5 Bxb5+ Nbd7 O-O-O Rd8 Rxd7 Rxd7 Rd1 Qe6 Bxd7+ Nxd7 Qb8+ Nxb8 Rd8#',
    notes: {
      17: 'Bg5 pins the knight. Morphy has developed with threats every single move — that’s the whole secret.',
      19: 'Nxb5! Sacrificing to rip open the c- and d-files toward the uncastled king.',
      31: 'Qb8+!! A queen sacrifice to force mate — Nxb8 then Rd8 is mate. Open lines + development = checkmate.',
    },
  },
  {
    id: 'evergreen-1852',
    white: 'Adolf Anderssen',
    black: 'Jean Dufresne',
    event: 'Berlin',
    year: 1852,
    result: '1-0',
    side: 'w',
    eco: 'C52',
    blurb:
      'The "Evergreen Game" — an Evans Gambit (your Italian, turbo-charged). White sacrifices pawns and pieces for a lead in development, then finishes with a storm of sacrifices.',
    moves:
      'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O d3 Qb3 Qf6 e5 Qg6 Re1 Nge7 Ba3 b5 Qxb5 Rb8 Qa4 Bb6 Nbd2 Bb7 Ne4 Qf5 Bxd3 Qh5 Nf6+ gxf6 exf6 Rg8 Rad1 Qxf3 Rxe7+ Nxe7 Qxd7+ Kxd7 Bf5+ Ke8 Bd7+ Kf8 Bxe7#',
    notes: {
      7: 'b4 — the Evans Gambit. Offer a pawn to chase the bishop and seize the center with tempo.',
      41: 'Qxd7+!! The immortal finish: queen sacrifice, then Bf5+, Bd7+, Bxe7# — a mating net from pure development.',
    },
  },
  {
    id: 'reti-tartakower-1910',
    white: 'Richard Réti',
    black: 'Savielly Tartakower',
    event: 'Vienna',
    year: 1910,
    result: '1-0',
    side: 'w',
    eco: 'B15',
    blurb:
      'A Caro-Kann miniature with one of the most beautiful queen sacrifices ever — and a warning: in YOUR Caro-Kann, don’t open the center with an early …e5 while behind in development.',
    moves: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Qd3 e5 dxe5 Qa5+ Bd2 Qxe5 O-O-O Nxe4 Qd8+ Kxd8 Bg5+ Ke8 Rd8#',
    notes: {
      15: 'O-O-O! White castles into a fully open d-file, aimed straight at Black’s king. Development first, always.',
      17: 'Qd8+!! Queen sacrifice — after Kxd8, Bg5+ and Rd8# is a forced mate down the open file.',
    },
  },
  {
    id: 'marshall-gold-coins-1912',
    white: 'Stepan Levitsky',
    black: 'Frank Marshall',
    event: 'Breslau',
    year: 1912,
    result: '0-1',
    side: 'b',
    eco: 'C10',
    blurb:
      'Play the BLACK side of Marshall’s "gold coins" game. The finish, 23…Qg3!!, is so beautiful the crowd is said to have showered the board with gold — a quiet queen offer that can’t be taken three ways.',
    moves:
      'd4 e6 e4 d5 Nc3 c5 Nf3 Nc6 exd5 exd5 Be2 Nf6 O-O Be7 Bg5 O-O dxc5 Be6 Nd4 Bxc5 Nxe6 fxe6 Bg4 Qd6 Bh3 Rae8 Qd2 Bb4 Bxf6 Rxf6 Rad1 Qc5 Qe2 Bxc3 bxc3 Qxc3 Rxd5 Nd4 Qh5 Ref8 Re5 Rh6 Qg5 Rxh3 Rc5 Qg3',
    notes: {
      45: 'The legendary Qg3!! — it attacks but can’t be captured: hxg3/fxg3 allow …Ne2+ and …Rxf1#, and Qxg3 drops to …Ne2+. White resigned.',
    },
  },
]

export function getMasterGame(id) {
  return masterGames.find((g) => g.id === id) || masterGames[0]
}
