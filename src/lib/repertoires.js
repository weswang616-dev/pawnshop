// All opening repertoires the trainer knows. Each is a single low-memorization main line,
// with the user's side given by `color`. `line` alternates moves; `by` marks who plays each.
import { italian } from './italian'

// Black answer to 1.e4 — meet it with 1...e5 and the same Italian structures Wesley already
// plays as White. Maximum overlap, minimum new theory.
export const blackVsE4 = {
  id: 'black-vs-e4-e5',
  name: 'Black vs 1.e4 — Open Game',
  color: 'black',
  summary:
    'Answer 1.e4 with 1...e5 and mirror the Italian. You already know these positions from the ' +
    'White side, so there is almost nothing new to memorize.',
  line: [
    { move: 'e4', by: 'w', idea: 'White grabs the center. You will contest it head-on.' },
    { move: 'e5', by: 'b', idea: 'Stake your own claim in the center — meet 1.e4 in the eye.' },
    { move: 'Nf3', by: 'w', idea: 'White develops and attacks your e5-pawn.' },
    { move: 'Nc6', by: 'b', idea: 'Defend e5 and develop toward the center.' },
    { move: 'Bc4', by: 'w', idea: 'The Italian bishop, aiming at your f7.' },
    { move: 'Bc5', by: 'b', idea: 'Mirror White — your bishop eyes f2, White’s weak spot.' },
    { move: 'c3', by: 'w', idea: 'White prepares d4.' },
    { move: 'Nf6', by: 'b', idea: 'Develop and put pressure on White’s e4-pawn.' },
    { move: 'd3', by: 'w', idea: 'White defends e4 calmly.' },
    { move: 'd6', by: 'b', idea: 'Support e5 and free your light-squared bishop.' },
    { move: 'O-O', by: 'w', idea: 'White castles.' },
    { move: 'O-O', by: 'b', idea: 'Get your king safe before the action starts.' },
  ],
  plans: [
    'These are the same Italian structures you play as White — reroute a knight with ...Nbd7 or ...Na5 (hitting the c4-bishop).',
    'Prepare the ...c6 and ...d5 break to challenge the center once you’re developed.',
    'Keep an eye on f7; if White’s pieces swarm it, defend calmly with your knight and rook.',
    'Trade off White’s dangerous light-squared bishop when you can — it’s the piece aimed at your king.',
  ],
  traps: [
    'Scholar’s Mate try (early Qh5 + Bc4 hitting f7): don’t panic — develop ...Nf6, and ...g6/...Qe7 covers everything.',
    'If White plays the Ruy Lopez (3.Bb5), answer 3...a6. If the bishop takes on c6, recapture and you’re completely fine.',
    'By playing ...Bc5 (instead of an early ...Nf6 in front of an undefended f7) you sidestep the Fried Liver entirely.',
  ],
  offBook:
    'This drills the Open Game after 1.e4 e5 2.Nf3 Nc6 3.Bc4. Against the Ruy Lopez (3.Bb5) play ...a6; ' +
    'the Scotch (3.d4) play ...exd4; the King’s Gambit (2.f4) you can decline with ...Bc5. In all of them, ' +
    'keep developing knights and bishops and castle — we can add dedicated lines next.',
}

// Black answer to 1.d4 — the rock-solid Queen's Gambit Declined. Develop, castle, stay sturdy.
export const blackVsD4 = {
  id: 'black-vs-d4-qgd',
  name: 'Black vs 1.d4 — Queen’s Gambit Declined',
  color: 'black',
  summary:
    'A sturdy, principled answer to 1.d4: build a solid pawn on d5, develop simply, and castle. ' +
    'Very hard to go wrong, and you reach positions you understand.',
  line: [
    { move: 'd4', by: 'w', idea: 'White takes the center on the queenside.' },
    { move: 'd5', by: 'b', idea: 'Stake your own central claim, mirroring White.' },
    { move: 'c4', by: 'w', idea: 'The Queen’s Gambit — White offers a pawn to deflect your d5.' },
    { move: 'e6', by: 'b', idea: 'Decline solidly: reinforce d5 and open your f8-bishop. The QGD.' },
    { move: 'Nf3', by: 'w', idea: 'White develops a knight.' },
    { move: 'Nf6', by: 'b', idea: 'Develop and guard the key central squares.' },
    { move: 'Nc3', by: 'w', idea: 'White piles up on d5.' },
    { move: 'Be7', by: 'b', idea: 'A modest, solid square that prepares castling.' },
    { move: 'Bg5', by: 'w', idea: 'White pins your knight to add pressure.' },
    { move: 'O-O', by: 'b', idea: 'King safety. Now untangle with ...Nbd7, ...c6, and a freeing break later.' },
  ],
  plans: [
    'Stay solid: follow up with ...Nbd7, ...c6, and look for the freeing ...c5 or ...e5 break at the right time.',
    'Don’t grab the c4-pawn unless you can actually follow up — usually just develop and castle first.',
    'If you feel cramped, trade a pair of pieces; the QGD is happy to simplify.',
    'Break the g5-pin when useful with ...h6, asking the bishop to decide.',
  ],
  traps: [
    'Don’t snatch on c4 and then try to hold it with ...b5 — it almost always loses the pawn back with interest.',
    'Develop before you push pawns on the queenside; loose pawns there become targets.',
  ],
  offBook:
    'This drills the QGD after 1.d4 d5 2.c4 e6. Against the London (2.Bf4), the Colle, or 1.d4 sidelines, the same ' +
    'setup works beautifully: ...d5, ...Nf6, ...e6, ...Be7, and castle — plus ...Bf5 or ...Bd6 against the London. ' +
    'We can add an anti-London line next.',
}

export const repertoires = [italian, blackVsE4, blackVsD4]

export function getRepertoire(id) {
  return repertoires.find((r) => r.id === id) || repertoires[0]
}
