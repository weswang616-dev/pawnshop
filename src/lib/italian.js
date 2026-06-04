// The starter White repertoire for a ~750 player: the Italian Game, handled in the calm
// "Giuoco Pianissimo" way (d3 instead of sharp d4/Ng5 lines). Chosen to MINIMISE memorisation
// and MAXIMISE understanding — you develop, castle, and reach rich tactical middlegames.
//
// `line` is the main drill: White's moves are `by: 'w'`, Black's replies `by: 'b'`.
// Each ply carries the idea behind it, so learning the moves teaches the plan.

export const italian = {
  id: 'italian-giuoco-pianissimo',
  name: 'Italian Game — Giuoco Pianissimo',
  color: 'white',
  summary:
    '1.e4 e5 2.Nf3 Nc6 3.Bc4 — a sound, low-theory opening that develops quickly, castles early, ' +
    'and steers the game into rich tactical positions. Perfect for sharpening your tactical eye.',
  line: [
    { move: 'e4', by: 'w', idea: 'Claim the center and open lines for your bishop and queen.' },
    { move: 'e5', by: 'b', idea: 'Black mirrors, fighting for the same central squares.' },
    { move: 'Nf3', by: 'w', idea: 'Develop a knight AND attack the e5-pawn — a developing move with a threat.' },
    { move: 'Nc6', by: 'b', idea: 'Black defends e5 and develops in turn.' },
    { move: 'Bc4', by: 'w', idea: 'The "Italian bishop." It targets f7 — the weakest square in Black\'s camp.' },
    { move: 'Bc5', by: 'b', idea: 'Black mirrors again, aiming the bishop at your f2.' },
    { move: 'c3', by: 'w', idea: 'Prepare d4 to build a big center, and give the bishop a future retreat to c2.' },
    { move: 'Nf6', by: 'b', idea: 'Black develops and puts pressure on your e4-pawn.' },
    { move: 'd3', by: 'w', idea: 'Calmly defend e4 — the "Pianissimo." This quietly sidesteps all the Fried Liver chaos.' },
    { move: 'd6', by: 'b', idea: 'Black supports e5 and opens a path for the light-squared bishop.' },
    { move: 'O-O', by: 'w', idea: 'King safety first. Castle before you start any action.' },
    { move: 'O-O', by: 'b', idea: 'Black tucks the king away too.' },
    { move: 'Re1', by: 'w', idea: 'The rook backs up e4 and the e-file. Now begin the knight tour: Nbd2–f1–g3.' },
  ],
  plans: [
    'Reroute your queenside knight: Nb1–d2–f1–g3, eyeing the f5 and h5 squares near Black\'s king.',
    'Keep your light-squared bishop healthy — if it\'s attacked, retreat Bc4–b3 (or –c2). It points at the king.',
    'Play d3–d4 only once you\'re fully developed; opening the center when you\'re ahead in development pays off.',
    'A timely h3 stops annoying ...Bg4 pins and gives your pieces luft.',
    'Both sides set up symmetrically, so small improvements and tactics decide the game — train your tactics!',
  ],
  traps: [
    'Sidestep the Fried Liver: by choosing d3 you never enter the 4.Ng5 lines. If you ever face 3...Nf6, just play 4.d3.',
    'Don\'t snatch e5 with Nxe5?? early — ...Qd4 or ...Qg5 forks can win your knight or more. Develop first.',
    'Mind your f2 square: Black\'s c5-bishop plus a knight hop to g4 can hit f2. h3 and Re1 keep it covered.',
    'Never chase pawns with your queen in the opening. Finish developing and castle — the pawns can wait.',
  ],
  offBook:
    'This drill covers 1.e4 e5. If Black answers 1.e4 with the Sicilian (1...c5), Caro-Kann (1...c6) or French (1...e6), ' +
    'you\'re out of Italian territory — fall back on the three principles: fight for the center, develop knights before ' +
    'bishops, and castle by around move 8. We can add dedicated lines for those defenses next.',
}
