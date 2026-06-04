// Opening repertoires. Each repertoire has multiple named VARIATIONS (so you can master the
// whole opening, not just one line), a spoken "why it works" explanation, and middlegame plans.
//
// Shape:
//   { id, name, color:'white'|'black', meets:'white'|'e4'|'d4', recommended:bool,
//     summary, whyItWorks (spoken), middlegame (spoken),
//     variations:[{ name, line:[{move,by:'w'|'b',idea}] }], plans:[], traps:[], offBook }
//
// `meets` + `recommended` drive the "Coach's pick" personalization on the Repertoire page.

export const italian = {
  id: 'italian-game',
  name: 'The Italian Game',
  color: 'white',
  meets: 'white',
  recommended: true,
  summary:
    '1.e4 e5 2.Nf3 Nc6 3.Bc4 — develop fast, castle, and aim your bishop at f7. The #1 coach-recommended ' +
    'opening for improving players: it teaches real chess (development, the center, the f7 weakness) instead of memorized tricks.',
  whyItWorks:
    "The Italian is the best opening to grow on. You make natural developing moves — knight to f3, bishop to c4 aiming at f7, " +
    "castle — and every move teaches a principle you'll use forever: control the center, develop toward the enemy king, and don't move the same piece twice. " +
    "The bishop on c4 stares at f7, Black's weakest square, defended only by the king. " +
    "Unlike a system you autopilot, the Italian gives you open, tactical positions where seeing one move ahead wins games — exactly the skill that lifts you out of the 700s. " +
    "And it scales: the same ideas that work now still work at 1500, so you never have to relearn your opening.",
  middlegame:
    "The plan is simple and repeatable. Finish developing (Nf3, Bc4, O-O), play c3 to prepare d4, and decide between two setups: " +
    "the calm Giuoco Pianissimo (d3, then reroute the knight Nbd2–f1–g3 toward the kingside, h3 to stop a pin, then look for d4 later), " +
    "or the direct c3 and d4 break to blow open the center while you're better developed. " +
    "Keep your light-squared bishop healthy — if it gets attacked by …Na5, retreat it to b3. " +
    "Watch f7 and the a2–g8 diagonal for tactics, castle early, and never grab a pawn if it costs you development.",
  variations: [
    {
      name: 'Giuoco Pianissimo (main line)',
      line: [
        { move: 'e4', by: 'w', idea: 'Claim the center and open the bishop and queen.' },
        { move: 'e5', by: 'b', idea: 'Black mirrors in the center.' },
        { move: 'Nf3', by: 'w', idea: 'Develop with a threat to win the e5-pawn.' },
        { move: 'Nc6', by: 'b', idea: 'Defend e5 and develop.' },
        { move: 'Bc4', by: 'w', idea: 'The Italian bishop — aim straight at f7, Black’s weakest square.' },
        { move: 'Bc5', by: 'b', idea: 'Black mirrors, aiming at your f2.' },
        { move: 'c3', by: 'w', idea: 'Prepare d4 and give the bishop a safe retreat to c2.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and hit your e4-pawn.' },
        { move: 'd3', by: 'w', idea: 'The Giuoco Pianissimo: calmly defend e4. Low theory, rich middlegame — no early d4.' },
        { move: 'd6', by: 'b', idea: 'Black supports e5 and opens his bishop.' },
        { move: 'O-O', by: 'w', idea: 'King safety first.' },
        { move: 'O-O', by: 'b', idea: 'Black castles too.' },
        { move: 'Re1', by: 'w', idea: 'Back up e4 and prepare the knight tour Nbd2–f1–g3.' },
        { move: 'a6', by: 'b', idea: 'Make luft and prepare …Ba7, tucking the bishop away.' },
        { move: 'Nbd2', by: 'w', idea: 'Reroute the knight toward the kingside; keep c3 for the pawn. A timely d4 comes later.' },
      ],
    },
    {
      name: 'Giuoco Piano — the d4 break',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'e5', by: 'b', idea: 'Black mirrors.' },
        { move: 'Nf3', by: 'w', idea: 'Develop, threaten e5.' },
        { move: 'Nc6', by: 'b', idea: 'Defend and develop.' },
        { move: 'Bc4', by: 'w', idea: 'The Italian bishop, eyeing f7.' },
        { move: 'Bc5', by: 'b', idea: 'Black mirrors.' },
        { move: 'c3', by: 'w', idea: 'Prepare the big central break d4.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and hit e4.' },
        { move: 'd4', by: 'w', idea: 'Strike the center NOW — the aggressive option, opening lines while you’re well developed.' },
        { move: 'exd4', by: 'b', idea: 'Black captures.' },
        { move: 'cxd4', by: 'w', idea: 'Recapture and build a strong d4–e4 pawn center.' },
        { move: 'Bb4+', by: 'b', idea: 'A check to slow you down before you roll the center forward.' },
        { move: 'Bd2', by: 'w', idea: 'Block the check and offer a trade — keep it simple and safe.' },
        { move: 'Bxd2+', by: 'b', idea: 'Black trades.' },
        { move: 'Nbxd2', by: 'w', idea: 'Recapture, develop, and keep your powerful center. You’re ahead in space.' },
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
        { move: 'Nf6', by: 'b', idea: 'The Two Knights — Black hits e4 instead of playing …Bc5.' },
        { move: 'd3', by: 'w', idea: 'Calm and strong — sidestep the wild Fried Liver (4.Ng5) entirely and just play good chess.' },
        { move: 'Bc5', by: 'b', idea: 'Black develops.' },
        { move: 'O-O', by: 'w', idea: 'Castle.' },
        { move: 'd6', by: 'b', idea: 'Support e5.' },
        { move: 'c3', by: 'w', idea: 'Prepare d4 and a calm build-up.' },
        { move: 'a6', by: 'b', idea: 'Stop Bb5 ideas and prepare …Ba7.' },
        { move: 'Bb3', by: 'w', idea: 'Tuck the bishop onto a safe diagonal before …Na5 can hit it.' },
        { move: 'Ba7', by: 'b', idea: 'Black does the same.' },
        { move: 'Nbd2', by: 'w', idea: 'Reroute toward the kingside (Nf1–g3) — the signature Italian maneuver.' },
      ],
    },
    {
      name: 'Evans Gambit (aggressive)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'e5', by: 'b', idea: 'Open game.' },
        { move: 'Nf3', by: 'w', idea: 'Attack e5.' },
        { move: 'Nc6', by: 'b', idea: 'Defend.' },
        { move: 'Bc4', by: 'w', idea: 'Italian bishop.' },
        { move: 'Bc5', by: 'b', idea: 'Black mirrors.' },
        { move: 'b4', by: 'w', idea: 'The Evans Gambit! Sacrifice a pawn to gain time hitting the bishop and build a huge center.' },
        { move: 'Bxb4', by: 'b', idea: 'Black accepts the pawn.' },
        { move: 'c3', by: 'w', idea: 'Hit the bishop again and prepare d4 with tempo.' },
        { move: 'Ba5', by: 'b', idea: 'Black keeps the bishop active and pinning.' },
        { move: 'd4', by: 'w', idea: 'Build the big center with gain of time — this is the point of the gambit.' },
        { move: 'exd4', by: 'b', idea: 'Black grabs another pawn.' },
        { move: 'O-O', by: 'w', idea: 'Castle and open lines. You have a massive lead in development for the pawn — this is the Evergreen Game.' },
      ],
    },
    {
      name: 'Hungarian Defense (3…Be7)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'e5', by: 'b', idea: 'Open game.' },
        { move: 'Nf3', by: 'w', idea: 'Attack e5.' },
        { move: 'Nc6', by: 'b', idea: 'Defend.' },
        { move: 'Bc4', by: 'w', idea: 'Italian bishop.' },
        { move: 'Be7', by: 'b', idea: 'The Hungarian — passive but solid; the bishop won’t fight for the center.' },
        { move: 'd4', by: 'w', idea: 'Grab the center at once — punish the passive bishop.' },
        { move: 'exd4', by: 'b', idea: 'Black captures.' },
        { move: 'Nxd4', by: 'w', idea: 'Recapture with the knight; you have a big, free center.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and hit e4.' },
        { move: 'Nc3', by: 'w', idea: 'Defend e4 and develop.' },
        { move: 'O-O', by: 'b', idea: 'Black castles.' },
        { move: 'O-O', by: 'w', idea: 'Castle. You have more space and easy, principled development.' },
      ],
    },
  ],
  plans: [
    'Develop, castle, and aim the bishop at f7 — then choose: slow setup (d3, Nbd2–f1–g3, h3) or the d4 break.',
    'Keep the light bishop healthy — if …Na5 attacks it, retreat to b3, not back home.',
    'Play c3 early so d4 is always available to open the center when you’re better developed.',
    'Castle before you attack; watch the a2–g8 diagonal and f7 for tactics.',
  ],
  traps: [
    'You can play the Fried Liver (3…Nf6 4.Ng5) for tricks, but learn WHY the Italian works — calm 4.d3 keeps a great game and ages well.',
    'Don’t grab e5 early with Nxe5 — …Qd4 or …Qg5 forks can punish it.',
    'Don’t block your c-pawn with Nc3 if you still want the c3+d4 plan.',
  ],
  offBook:
    'This trains 1.e4 e5. If Black answers 1.e4 with something else (the Sicilian 1…c5, French 1…e6, or Caro-Kann 1…c6), ' +
    'fall back on the three principles — fight for the center, develop every piece, and castle — and we can add dedicated lines as you climb.',
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
        { move: 'e5', by: 'w', idea: 'White grabs space and locks the center — the sharpest, best-scoring try.' },
        { move: 'Bf5', by: 'b', idea: 'Get the bishop out NOW, before …e6 — the whole reason to play the Caro.' },
        { move: 'Nf3', by: 'w', idea: 'White develops.' },
        { move: 'e6', by: 'b', idea: 'Now build the chain behind your already-developed bishop.' },
        { move: 'Be2', by: 'w', idea: 'White develops.' },
        { move: 'c5', by: 'b', idea: 'The key break — hit d4 and open lines for your pieces.' },
        { move: 'c3', by: 'w', idea: 'White props up d4.' },
        { move: 'Nc6', by: 'b', idea: 'Pile on d4 and develop.' },
        { move: 'O-O', by: 'w', idea: 'White castles.' },
        { move: 'Nge7', by: 'b', idea: 'Route the knight to g6 or f5; finish developing and castle. Solid with clear counterplay.' },
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
        { move: 'e6', by: 'b', idea: 'Open your dark-squared bishop so it can challenge White’s.' },
        { move: 'Nf3', by: 'w', idea: 'White develops.' },
        { move: 'Bd6', by: 'b', idea: 'Challenge White’s good bishop head-on.' },
        { move: 'Bxd6', by: 'w', idea: 'White trades.' },
        { move: 'Qxd6', by: 'b', idea: 'Recapture; easy development with …O-O, …Bg4 or …Bf5 to come.' },
      ],
    },
    {
      name: 'Panov-Botvinnik Attack (4.c4)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'c6', by: 'b', idea: 'Caro.' },
        { move: 'd4', by: 'w', idea: 'Center.' },
        { move: 'd5', by: 'b', idea: 'Challenge.' },
        { move: 'exd5', by: 'w', idea: 'White trades…' },
        { move: 'cxd5', by: 'b', idea: 'Recapture.' },
        { move: 'c4', by: 'w', idea: 'The Panov! White strikes at d5, heading for an isolated-d-pawn game with active pieces.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and pressure c4/d5 — don’t panic about the structure.' },
        { move: 'Nc3', by: 'w', idea: 'White develops and adds pressure to d5.' },
        { move: 'e6', by: 'b', idea: 'Solid: open your bishop and prepare to castle. (…g6 is the sharper Gruenfeld-style setup.)' },
        { move: 'Nf3', by: 'w', idea: 'White develops.' },
        { move: 'Be7', by: 'b', idea: 'Calm development; castle next. (…Bb4 pins and is sharper.)' },
        { move: 'cxd5', by: 'w', idea: 'White clarifies the center, leaving himself an isolated d4-pawn.' },
        { move: 'Nxd5', by: 'b', idea: 'Recapture and BLOCKADE the isolated pawn on d5 — trade pieces and target d4. Your long-term trump.' },
      ],
    },
    {
      name: 'Fantasy Variation (3.f3)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'c6', by: 'b', idea: 'Caro.' },
        { move: 'd4', by: 'w', idea: 'Center.' },
        { move: 'd5', by: 'b', idea: 'Challenge.' },
        { move: 'f3', by: 'w', idea: 'The Fantasy Variation — White props up e4 to build a big center (but loosens his kingside).' },
        { move: 'e6', by: 'b', idea: 'The solid, low-risk reply: open your bishop and keep your structure intact. Don’t grab on e4 yet.' },
        { move: 'Nc3', by: 'w', idea: 'White develops.' },
        { move: 'Bb4', by: 'b', idea: 'Pin the knight to pile pressure on e4.' },
        { move: 'Bf4', by: 'w', idea: 'White develops.' },
        { move: 'Ne7', by: 'b', idea: 'Flexible — the knight heads to g6 to hit the f4-bishop, and keeps …Nd7 and …c5 ideas.' },
        { move: 'Bd3', by: 'w', idea: 'White develops.' },
        { move: 'Nd7', by: 'b', idea: 'Develop and prepare the freeing …c5 break.' },
        { move: 'Nge2', by: 'w', idea: 'White completes development.' },
        { move: 'c5', by: 'b', idea: 'The thematic break — hit d4 and open the game for your better-coordinated pieces.' },
      ],
    },
    {
      name: 'Two Knights (2.Nc3 & 3.Nf3)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'c6', by: 'b', idea: 'Caro.' },
        { move: 'Nc3', by: 'w', idea: 'The Two Knights move order — White delays d4.' },
        { move: 'd5', by: 'b', idea: 'Challenge the center as always.' },
        { move: 'Nf3', by: 'w', idea: 'White develops and eyes a later d4.' },
        { move: 'Bg4', by: 'b', idea: 'THE key move — pin the f3-knight before White can play d4.' },
        { move: 'h3', by: 'w', idea: 'White puts the question to the bishop.' },
        { move: 'Bxf3', by: 'b', idea: 'Trade it off; White’s recapture leaves you a sound, solid Caro structure.' },
        { move: 'Qxf3', by: 'w', idea: 'White recaptures with the queen.' },
        { move: 'e6', by: 'b', idea: 'Open your bishop — rock-solid and easy to play.' },
        { move: 'd4', by: 'w', idea: 'White finally builds the center.' },
        { move: 'dxe4', by: 'b', idea: 'Resolve the center to keep things simple.' },
        { move: 'Nxe4', by: 'w', idea: 'White recaptures.' },
        { move: 'Nd7', by: 'b', idea: 'Develop toward …Ngf6 — the familiar, comfortable Caro setup.' },
      ],
    },
  ],
  plans: [
    'Get the light-squared bishop OUTSIDE the chain (…Bf5 or …Bg6) before playing …e6 — this is the heart of the Caro.',
    'The …c5 break is your main counterplay, especially against the Advance Variation.',
    'Against the Panov’s isolated pawn, blockade d5, trade pieces, and target the d4-pawn in the endgame.',
    'Trade White’s attacking light-squared bishop; then your solid structure often gives you a better endgame.',
  ],
  traps: [
    'In the Advance, play …Bf5 BEFORE …e6. If you play …e6 first your bishop is stuck behind the pawns (the French problem you’re avoiding).',
    'Don’t grab White’s h-pawn with the bishop in the main line — h4–h5 can trap it. Make luft with …h6 first.',
    'Against the Fantasy (3.f3), don’t rush …dxe4; the calm …e6 keeps you safe and solid.',
  ],
  offBook:
    'Against rarer tries (the King’s Indian Attack, or 2.d3), the same ideas apply: …d5, get the bishop out, …e6, develop and castle. ' +
    'The Caro’s solidity means good principles beat memorized lines — we can add more sidelines as you climb.',
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
    "It rounds out your repertoire: with the Caro-Kann you already love these solid, sound structures — the QGD gives you the same comfort against 1.d4.",
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

export const openGame = {
  id: 'black-vs-e4-e5',
  name: 'Black vs 1.e4 — Open Game (…e5) — alternative',
  color: 'black',
  meets: 'e4',
  recommended: false,
  summary: '1…e5 — meet 1.e4 head-on. A classical alternative to your Caro-Kann if you want sharper, more open games.',
  whyItWorks:
    "Answering 1.e4 with 1…e5 leads to the oldest, most principled chess: fight for the center, develop knights and bishops, and castle. " +
    "It's a sharper, more tactical alternative to your Caro-Kann — useful if you want to practice open positions and tactics. " +
    "Bonus: it’s the mirror image of your Italian, so every idea you learn as White you’ll understand from the other side too.",
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

export const repertoires = [italian, caroKann, qgd, openGame]

export function getRepertoire(id) {
  return repertoires.find((r) => r.id === id) || repertoires[0]
}
