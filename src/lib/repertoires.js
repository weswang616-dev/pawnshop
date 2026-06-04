// Opening repertoires. Each repertoire has multiple named VARIATIONS (so you can master the
// whole opening, not just one line), a spoken "why it works" explanation, and middlegame plans.
//
// Shape:
//   { id, name, color:'white'|'black', meets:'white'|'e4'|'d4', recommended:bool,
//     summary, whyItWorks (spoken), middlegame (spoken),
//     variations:[{ name, line:[{move,by:'w'|'b',idea}] }], plans:[], traps:[], offBook }
//
// `meets` + `recommended` drive the "Coach's pick" personalization on the Repertoire page.

export const london = {
  id: 'london-system',
  name: 'The London System',
  color: 'white',
  meets: 'white',
  recommended: true,
  summary:
    '1.d4 + Bf4 — a "system" where you play almost the same solid setup against anything. Low theory, ' +
    'great middlegames, and it fits you: you already score best with 1.d4.',
  whyItWorks:
    "The London is a system, not a line. You play nearly the same setup against almost everything Black does: " +
    "pawns on d4 and e3, the bishop out to f4 before you block it in, then Nf3, Bd3, c3, knight to d2, and castle. " +
    "Because your pieces always go to the same good squares, you barely memorize anything and almost never get a bad position. " +
    "It suits you because you already play 1.d4 and win more with it — this just makes your setup sharper and gives you a real attacking plan.",
  middlegame:
    "Your main plan is a kingside attack. Land a knight on e5, support it with the d-pawn and the d2-knight, " +
    "then bring the queen to f3 or h5 and a rook to the third rank to swing at the king. " +
    "The f4-bishop and d3-bishop both point at Black's kingside, so a well-timed knight to e5 and pawn to f4 or h4 can crash through. " +
    "If Black trades pieces and defends well, stay patient — your structure is rock-solid, so you can also just play on the queenside or in the center with c4 later.",
  variations: [
    {
      name: 'Main setup (vs 1…d5)',
      line: [
        { move: 'd4', by: 'w', idea: 'Take the center and open the c1-bishop’s diagonal.' },
        { move: 'd5', by: 'b', idea: 'Black mirrors in the center.' },
        { move: 'Bf4', by: 'w', idea: 'The whole point: develop the bishop OUTSIDE the pawn chain before e3 traps it.' },
        { move: 'Nf6', by: 'b', idea: 'Black develops a knight.' },
        { move: 'e3', by: 'w', idea: 'Build the solid London pawn triangle (d4–e3) and free the f1-bishop.' },
        { move: 'e6', by: 'b', idea: 'Black opens his own bishop.' },
        { move: 'Nf3', by: 'w', idea: 'Develop and control e5 — your future outpost.' },
        { move: 'Be7', by: 'b', idea: 'Black prepares to castle.' },
        { move: 'Bd3', by: 'w', idea: 'Aim the bishop at h7 — half of your kingside attack.' },
        { move: 'O-O', by: 'b', idea: 'Black castles into the area you want to attack.' },
        { move: 'Nbd2', by: 'w', idea: 'The knight heads to f3–e5 or supports an f4/e4 break. Keep c3 for the pawn.' },
        { move: 'c5', by: 'b', idea: 'Black strikes at your center.' },
        { move: 'c3', by: 'w', idea: 'Hold the center calmly; the triangle keeps everything defended.' },
        { move: 'Nc6', by: 'b', idea: 'Black develops and pressures d4.' },
        { move: 'O-O', by: 'w', idea: 'King safety done — now plan Ne5 and the kingside build-up.' },
      ],
    },
    {
      name: 'vs the fianchetto (1…Nf6 & …g6)',
      line: [
        { move: 'd4', by: 'w', idea: 'Center.' },
        { move: 'Nf6', by: 'b', idea: 'Black goes for a King’s-Indian-style setup.' },
        { move: 'Bf4', by: 'w', idea: 'Same plan — bishop out early.' },
        { move: 'g6', by: 'b', idea: 'Black fianchettoes the bishop.' },
        { move: 'e3', by: 'w', idea: 'The London triangle.' },
        { move: 'Bg7', by: 'b', idea: 'The bishop eyes your center and queenside.' },
        { move: 'Nf3', by: 'w', idea: 'Develop and cover e5.' },
        { move: 'O-O', by: 'b', idea: 'Black castles.' },
        { move: 'Be2', by: 'w', idea: 'Here the bishop is calmer on e2 (h7 is covered by …g6).' },
        { move: 'd6', by: 'b', idea: 'Black prepares …e5 or …Nbd7.' },
        { move: 'h3', by: 'w', idea: 'Stop …Ng4/…Bg4 and make luft. Then O-O and look for e4 later.' },
        { move: 'Nbd7', by: 'b', idea: 'Black completes development.' },
        { move: 'O-O', by: 'w', idea: 'Solid and ready. A timely e4 grabs the center.' },
      ],
    },
    {
      name: 'vs an early …c5',
      line: [
        { move: 'd4', by: 'w', idea: 'Center.' },
        { move: 'd5', by: 'b', idea: 'Black takes the center.' },
        { move: 'Bf4', by: 'w', idea: 'Bishop out first.' },
        { move: 'c5', by: 'b', idea: 'Black challenges d4 immediately.' },
        { move: 'e3', by: 'w', idea: 'Keep it solid — don’t panic about the tension.' },
        { move: 'Nc6', by: 'b', idea: 'Black piles on d4.' },
        { move: 'c3', by: 'w', idea: 'Support d4 with the triangle; everything holds.' },
        { move: 'Nf6', by: 'b', idea: 'Black develops.' },
        { move: 'Nd2', by: 'w', idea: 'Develop toward f3/e5, keeping the structure flexible.' },
        { move: 'e6', by: 'b', idea: 'Black opens the bishop.' },
        { move: 'Ngf3', by: 'w', idea: 'Finish development; you’re ready to castle and play Ne5.' },
        { move: 'Bd6', by: 'b', idea: 'Black offers to trade your good bishop.' },
        { move: 'Bg3', by: 'w', idea: 'Sidestep the trade and keep your strong bishop pointing at the kingside.' },
      ],
    },
  ],
  plans: [
    'The signature attack: Ne5, then f4 or Qf3/Qh5 and Rf3–h3 to throw everything at the king.',
    'Keep your dark-squared bishop alive — if Black plays …Bd6 to trade it, retreat Bg3.',
    'If the kingside is quiet, expand with c4 to play in the center/queenside instead.',
    'Trade off Black’s good pieces, never your great bishops; your structure does the rest.',
  ],
  traps: [
    'If Black plays …Qb6 hitting b2, just defend calmly (Qc1 or Qb3) — the pawn is hard to grab without falling behind in development.',
    'Don’t play e3 BEFORE Bf4, or your bishop gets stuck behind its own pawns — that’s the one move order to remember.',
  ],
  offBook:
    'The beauty of the London is that this same setup (d4, Bf4, e3, Nf3, Bd3/e2, c3, Nbd2, O-O) works against almost everything. ' +
    'If Black does something unusual, just complete your setup and look for the Ne5 plan.',
}

export const caroKann = {
  id: 'caro-kann',
  name: 'Caro-Kann Defense',
  color: 'black',
  meets: 'e4',
  recommended: true,
  summary:
    '1…c6 — the solid, reliable answer to 1.e4 that you already play and score with. Rock-solid structure, ' +
    'and your light-squared bishop gets out of the box.',
  whyItWorks:
    "The Caro-Kann is the grown-up answer to 1.e4. You challenge the center with c6 and d5, but unlike the French, " +
    "you get to develop your light-squared bishop OUTSIDE the pawn chain to f5 or g6 before playing e6. " +
    "That bishop is the piece that makes French players miserable, and in the Caro it becomes one of your best pieces. " +
    "You get a sound structure, you rarely get mated in the opening, and you reach calm positions where good moves beat memorized traps. " +
    "It fits you perfectly — it's already your most-played and best-scoring defense.",
  middlegame:
    "Your structure usually has pawns on c6 and e6 with a great bishop outside the chain. " +
    "The key freeing break is c5, hitting White's d4-pawn once you're developed; in the Advance Variation that c5 break is your main source of counterplay. " +
    "Trade off White's attacking light-squared bishop when you can, aim for solid piece play, and you'll often reach endgames where your structure is simply better. " +
    "Patience wins Caro-Kann games — develop, castle, break with c5, and let White over-extend.",
  variations: [
    {
      name: 'Classical Main Line',
      line: [
        { move: 'e4', by: 'w', idea: 'White takes the center.' },
        { move: 'c6', by: 'b', idea: 'Prepare …d5 with a pawn that supports it — the Caro-Kann.' },
        { move: 'd4', by: 'w', idea: 'White builds a big center.' },
        { move: 'd5', by: 'b', idea: 'Strike at the center; c6 backs it up.' },
        { move: 'Nc3', by: 'w', idea: 'White defends e4 and develops.' },
        { move: 'dxe4', by: 'b', idea: 'Resolve the tension and free your game.' },
        { move: 'Nxe4', by: 'w', idea: 'White recaptures with the knight.' },
        { move: 'Bf5', by: 'b', idea: 'THE key idea: develop the bishop outside the chain, hitting the knight.' },
        { move: 'Ng3', by: 'w', idea: 'White kicks the bishop.' },
        { move: 'Bg6', by: 'b', idea: 'Keep the bishop on its great diagonal.' },
        { move: 'h4', by: 'w', idea: 'White tries to harass the bishop.' },
        { move: 'h6', by: 'b', idea: 'Make luft so …Bh7 isn’t met by h5 trapping it.' },
        { move: 'Nf3', by: 'w', idea: 'White develops.' },
        { move: 'Nd7', by: 'b', idea: 'Develop flexibly, preparing …Ngf6 and …e6.' },
        { move: 'h5', by: 'w', idea: 'White grabs space.' },
        { move: 'Bh7', by: 'b', idea: 'The bishop is safe and still useful behind the pawns.' },
        { move: 'Bd3', by: 'w', idea: 'White offers to trade the good bishops.' },
        { move: 'Bxd3', by: 'b', idea: 'Happily trade — you remove White’s attacker.' },
        { move: 'Qxd3', by: 'w', idea: 'White recaptures.' },
        { move: 'e6', by: 'b', idea: 'Solid: finish development with …Ngf6, …Be7/…Bd6, and castle.' },
      ],
    },
    {
      name: 'Advance Variation (3.e5)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'c6', by: 'b', idea: 'The Caro move order.' },
        { move: 'd4', by: 'w', idea: 'Big center.' },
        { move: 'd5', by: 'b', idea: 'Challenge it.' },
        { move: 'e5', by: 'w', idea: 'White grabs space and locks the center.' },
        { move: 'Bf5', by: 'b', idea: 'Get the bishop out NOW, before …e6 — the whole reason to play the Caro.' },
        { move: 'Nf3', by: 'w', idea: 'White develops.' },
        { move: 'e6', by: 'b', idea: 'Now build the chain behind your already-developed bishop.' },
        { move: 'Be2', by: 'w', idea: 'White develops.' },
        { move: 'c5', by: 'b', idea: 'The key break — hit d4 and open lines for your pieces.' },
        { move: 'c3', by: 'w', idea: 'White props up d4.' },
        { move: 'Nc6', by: 'b', idea: 'Pile on d4 and develop.' },
        { move: 'O-O', by: 'w', idea: 'White castles.' },
      ],
    },
    {
      name: 'Exchange Variation (3.exd5)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'c6', by: 'b', idea: 'Caro.' },
        { move: 'd4', by: 'w', idea: 'Center.' },
        { move: 'd5', by: 'b', idea: 'Challenge.' },
        { move: 'exd5', by: 'w', idea: 'White trades in the center.' },
        { move: 'cxd5', by: 'b', idea: 'Recapture; you have an easy, symmetrical position.' },
        { move: 'Bd3', by: 'w', idea: 'White develops toward your king.' },
        { move: 'Nc6', by: 'b', idea: 'Develop and control the center.' },
        { move: 'c3', by: 'w', idea: 'White supports d4.' },
        { move: 'Nf6', by: 'b', idea: 'Develop; eye the e4 and g4 squares.' },
        { move: 'Bf4', by: 'w', idea: 'White develops the bishop.' },
        { move: 'e6', by: 'b', idea: 'Open your bishop; next …Bd6 to challenge White’s, then castle.' },
      ],
    },
  ],
  plans: [
    'Get the light-squared bishop OUTSIDE the chain (…Bf5 or …Bg6) before playing …e6 — this is the heart of the Caro.',
    'The …c5 break is your main counterplay, especially against the Advance Variation.',
    'Trade White’s attacking light-squared bishop; then your solid structure often gives you a better endgame.',
    'Develop, castle, stay patient — let White over-push and punish it.',
  ],
  traps: [
    'In the Advance, play …Bf5 BEFORE …e6. If you play …e6 first your bishop is stuck behind the pawns (the French problem you’re avoiding).',
    'Don’t grab White’s h-pawn with the bishop in the main line — h4–h5 can trap it. Make luft with …h6 first.',
  ],
  offBook:
    'Against sidelines (the Two Knights 2.Nc3/3.Nf3, the Fantasy 3.f3, or the King’s Indian Attack), the same ideas apply: ' +
    '…d5, get the bishop out, …e6, develop and castle. We can add dedicated lines as you climb.',
}

export const qgd = {
  id: 'black-vs-d4-qgd',
  name: 'Black vs 1.d4 — Queen’s Gambit Declined',
  color: 'black',
  meets: 'd4',
  recommended: true,
  summary: 'A sturdy, principled answer to 1.d4: solid pawn on d5, simple development, castle. Hard to go wrong.',
  whyItWorks:
    "Against 1.d4 the Queen's Gambit Declined keeps things simple and solid. You put a pawn on d5 and support it, " +
    "develop your pieces to natural squares, and castle. There are very few traps to fall into, and you reach positions you understand. " +
    "It pairs well with your London — you'll recognize a lot of the structures from both sides of the board.",
  middlegame:
    "Stay solid and look for one of two freeing breaks: …c5 to hit White's center, or …dxc4 followed by …c5 or …e5 to open up. " +
    "If you feel cramped, trade a pair of minor pieces. Don't grab pawns on the queenside until you've finished developing — loose pawns become targets.",
  variations: [
    {
      name: 'Main line (Orthodox QGD)',
      line: [
        { move: 'd4', by: 'w', idea: 'White takes the center.' },
        { move: 'd5', by: 'b', idea: 'Stake your own central claim.' },
        { move: 'c4', by: 'w', idea: 'The Queen’s Gambit — a pawn offered to deflect your d5.' },
        { move: 'e6', by: 'b', idea: 'Decline solidly and open your f8-bishop. The QGD.' },
        { move: 'Nf3', by: 'w', idea: 'White develops.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and guard the center.' },
        { move: 'Nc3', by: 'w', idea: 'White piles on d5.' },
        { move: 'Be7', by: 'b', idea: 'A solid square; prepare to castle.' },
        { move: 'Bg5', by: 'w', idea: 'White pins to add pressure.' },
        { move: 'O-O', by: 'b', idea: 'King safety, then untangle with …Nbd7, …c6 and a break.' },
      ],
    },
    {
      name: 'vs the London (2.Bf4)',
      line: [
        { move: 'd4', by: 'w', idea: 'White plays a London-style setup.' },
        { move: 'd5', by: 'b', idea: 'Take the center.' },
        { move: 'Bf4', by: 'w', idea: 'The London bishop.' },
        { move: 'Nf6', by: 'b', idea: 'Develop.' },
        { move: 'e3', by: 'w', idea: 'The London triangle.' },
        { move: 'e6', by: 'b', idea: 'Open your bishop.' },
        { move: 'Nf3', by: 'w', idea: 'White develops.' },
        { move: 'Bd6', by: 'b', idea: 'Challenge the f4-bishop head-on — the cleanest answer to the London.' },
        { move: 'Bg3', by: 'w', idea: 'White avoids the trade.' },
        { move: 'O-O', by: 'b', idea: 'Castle; later …c5 and …Nc6 give you a good game.' },
      ],
    },
  ],
  plans: [
    'Aim for the …c5 break (or …dxc4 then …c5/…e5) once you’re developed.',
    'Against the London as Black, challenge the f4-bishop with …Bd6.',
    'Trade pieces if cramped; the QGD is happy to simplify.',
  ],
  traps: [
    'Don’t snatch on c4 and try to hold it with …b5 — it usually loses the pawn back with interest.',
  ],
  offBook: 'Against the Colle, Catalan, or 1.d4 sidelines, the same setup works: …d5, …Nf6, …e6, …Be7/…Bd6, and castle.',
}

export const italian = {
  id: 'italian-giuoco-pianissimo',
  name: 'Italian Game (White) — alternative',
  color: 'white',
  meets: 'white',
  recommended: false,
  summary: '1.e4 e5 2.Nf3 Nc6 3.Bc4 — develop fast, castle, aim at f7. A great tactical-training opening if you also want a 1.e4 option.',
  whyItWorks:
    "The Italian is the classic way to learn attacking chess. You develop quickly, castle early, and aim your bishop at f7, Black's weakest square. " +
    "It leads to open, tactical positions that sharpen your eye. It's here as an option if you want to play 1.e4 sometimes — though your games show you're stronger with 1.d4.",
  middlegame:
    "Reroute your queenside knight Nbd2–f1–g3 toward the kingside, keep your bishop healthy on the a2–g8 diagonal, and play d4 once you're fully developed to open the center.",
  variations: [
    {
      name: 'Giuoco Pianissimo (main)',
      line: [
        { move: 'e4', by: 'w', idea: 'Claim the center; open the bishop and queen.' },
        { move: 'e5', by: 'b', idea: 'Black mirrors.' },
        { move: 'Nf3', by: 'w', idea: 'Develop with a threat to e5.' },
        { move: 'Nc6', by: 'b', idea: 'Defend and develop.' },
        { move: 'Bc4', by: 'w', idea: 'The Italian bishop, eyeing f7.' },
        { move: 'Bc5', by: 'b', idea: 'Black mirrors, aiming at f2.' },
        { move: 'c3', by: 'w', idea: 'Prepare d4; give the bishop a retreat.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and hit e4.' },
        { move: 'd3', by: 'w', idea: 'Calmly defend e4 — avoids all the Fried Liver chaos.' },
        { move: 'd6', by: 'b', idea: 'Support e5.' },
        { move: 'O-O', by: 'w', idea: 'King safety first.' },
        { move: 'O-O', by: 'b', idea: 'Black castles.' },
        { move: 'Re1', by: 'w', idea: 'Support e4; start Nbd2–f1–g3.' },
      ],
    },
    {
      name: 'Two Knights — calm 4.d3',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'e5', by: 'b', idea: 'Open game.' },
        { move: 'Nf3', by: 'w', idea: 'Attack e5.' },
        { move: 'Nc6', by: 'b', idea: 'Defend.' },
        { move: 'Bc4', by: 'w', idea: 'Italian bishop.' },
        { move: 'Nf6', by: 'b', idea: 'The Two Knights — Black hits e4 instead of …Bc5.' },
        { move: 'd3', by: 'w', idea: 'Calm and strong — sidestep the Fried Liver (4.Ng5) entirely.' },
        { move: 'Bc5', by: 'b', idea: 'Black develops.' },
        { move: 'O-O', by: 'w', idea: 'Castle.' },
        { move: 'd6', by: 'b', idea: 'Support e5.' },
        { move: 'c3', by: 'w', idea: 'Prepare d4 and a calm build-up.' },
        { move: 'O-O', by: 'b', idea: 'Black castles.' },
      ],
    },
  ],
  plans: ['Nbd2–f1–g3 toward the king.', 'Keep the light bishop healthy (Bb3 if attacked).', 'Play d4 once developed.'],
  traps: ['Avoid 4.Ng5 lines; just play d3.', 'Don’t grab e5 with Nxe5 early — …Qd4/…Qg5 forks punish it.'],
  offBook: 'This drills 1.e4 e5. Against the Sicilian/Caro/French, fall back on the three principles: center, develop, castle.',
}

export const openGame = {
  id: 'black-vs-e4-e5',
  name: 'Black vs 1.e4 — Open Game (…e5) — alternative',
  color: 'black',
  meets: 'e4',
  recommended: false,
  summary: '1…e5 — meet 1.e4 head-on. A classical alternative to your Caro-Kann if you want sharper, more open games.',
  whyItWorks:
    "Answering 1.e4 with 1…e5 leads to the oldest, most principled chess: fight for the center, develop knights and bishops, and castle. " +
    "It's a sharper, more tactical alternative to your Caro-Kann — useful if you want to practice open positions and tactics.",
  middlegame:
    "You'll often mirror White's setup. Reroute a knight to a good square (…Nbd7 or …Na5 to hit a c4-bishop), prepare the …d5 or …c6+…d5 break, and watch your f7-square.",
  variations: [
    {
      name: 'Italian as Black (…Bc5)',
      line: [
        { move: 'e4', by: 'w', idea: 'White’s center.' },
        { move: 'e5', by: 'b', idea: 'Meet it head-on.' },
        { move: 'Nf3', by: 'w', idea: 'White attacks e5.' },
        { move: 'Nc6', by: 'b', idea: 'Defend and develop.' },
        { move: 'Bc4', by: 'w', idea: 'Italian bishop.' },
        { move: 'Bc5', by: 'b', idea: 'Mirror; aim at f2.' },
        { move: 'c3', by: 'w', idea: 'White prepares d4.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and hit e4.' },
        { move: 'd3', by: 'w', idea: 'White stays calm.' },
        { move: 'd6', by: 'b', idea: 'Support e5; open your bishop.' },
        { move: 'O-O', by: 'w', idea: 'White castles.' },
        { move: 'O-O', by: 'b', idea: 'You castle too.' },
      ],
    },
    {
      name: 'vs the Ruy Lopez (3.Bb5)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'e5', by: 'b', idea: 'Open game.' },
        { move: 'Nf3', by: 'w', idea: 'Attack e5.' },
        { move: 'Nc6', by: 'b', idea: 'Defend.' },
        { move: 'Bb5', by: 'w', idea: 'The Ruy Lopez — pinning pressure on your knight.' },
        { move: 'a6', by: 'b', idea: 'Put the question to the bishop right away.' },
        { move: 'Ba4', by: 'w', idea: 'White keeps the bishop.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and hit e4.' },
        { move: 'O-O', by: 'w', idea: 'White castles.' },
        { move: 'Be7', by: 'b', idea: 'Develop and prepare to castle.' },
        { move: 'Re1', by: 'w', idea: 'White defends e4.' },
        { move: 'b5', by: 'b', idea: 'Gain queenside space and secure your knight.' },
        { move: 'Bb3', by: 'w', idea: 'The bishop retreats but stays active.' },
        { move: 'd6', by: 'b', idea: 'Solid: support e5 and finish developing.' },
      ],
    },
  ],
  plans: ['Reroute a knight to a strong square.', 'Prepare …c6 and …d5.', 'Watch f7; castle early.'],
  traps: ['Defend Scholar’s-mate tries (early Qh5) calmly with …Nf6 and …g6.', 'Against the Ruy, …a6 early keeps things simple.'],
  offBook: 'Against the Scotch (3.d4) play …exd4; against the King’s Gambit (2.f4) you can decline with …Bc5.',
}

export const repertoires = [london, caroKann, qgd, italian, openGame]

export function getRepertoire(id) {
  return repertoires.find((r) => r.id === id) || repertoires[0]
}
