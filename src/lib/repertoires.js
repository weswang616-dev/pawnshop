// Opening repertoires. Each repertoire has multiple named VARIATIONS (so you can master the
// whole opening, not just one line), a spoken "why it works" explanation, and middlegame plans.
//
// Variations are named by the OPPONENT'S move (e.g. "3…Nf6: Two Knights") so you always know
// which line to study for whatever your opponent actually plays.
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
    'opening for improving players, now with a line for every common Black reply so you’re never caught out.',
  whyItWorks:
    "The Italian is the best opening to grow on. You make natural developing moves — knight to f3, bishop to c4 aiming at f7, " +
    "castle — and every move teaches a principle you'll use forever: control the center, develop toward the enemy king, and don't move the same piece twice. " +
    "The bishop on c4 stares at f7, Black's weakest square, defended only by the king. " +
    "Because Black can answer 3.Bc4 in several ways, this repertoire gives you a clear, sound plan against each one — so whatever your opponent does, you know the idea. " +
    "And it scales: the same ideas that work now still work at 1500, so you never have to relearn your opening.",
  middlegame:
    "The default plan is the Giuoco Pianissimo slow build-up: castle, play Re1, reroute the knight Nbd2–f1–g3, tuck the king with h3, and only THEN play the d4 break to open the center toward f7. " +
    "Keep your light-squared bishop healthy — if it gets hit by …Na5, retreat it to b3, never home to f1. " +
    "When Black avoids the main lines (the Petroff …Nf6 or Philidor …d6), grab the center with d4 and enjoy your freer, more active pieces. " +
    "Castle early, watch the a2–g8 diagonal for tactics, and never win a pawn if it costs you development.",
  variations: [
    {
      name: '3…Bc5: Giuoco Pianissimo (main)',
      line: [
        { move: 'e4', by: 'w', idea: 'Claim the center and open the bishop and queen.' },
        { move: 'e5', by: 'b', idea: 'Black mirrors in the center.' },
        { move: 'Nf3', by: 'w', idea: 'Develop with a threat to win the e5-pawn.' },
        { move: 'Nc6', by: 'b', idea: 'Defend e5 and develop.' },
        { move: 'Bc4', by: 'w', idea: 'The Italian bishop — aim straight at f7, Black’s weakest square.' },
        { move: 'Bc5', by: 'b', idea: 'Black mirrors, aiming at your f2.' },
        { move: 'c3', by: 'w', idea: 'Prepare the d4 break and give the bishop a retreat to c2.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and hit your e4-pawn — Black’s main reply.' },
        { move: 'd3', by: 'w', idea: 'The modern Pianissimo: calmly defend e4 and build up slowly. Low theory, rich middlegame.' },
        { move: 'd6', by: 'b', idea: 'Black supports e5 and opens his bishop.' },
        { move: 'O-O', by: 'w', idea: 'King safety first.' },
        { move: 'O-O', by: 'b', idea: 'Black castles too.' },
        { move: 'Re1', by: 'w', idea: 'Back up e4 and prepare the knight tour Nbd2–f1–g3.' },
        { move: 'a6', by: 'b', idea: 'Make luft and prepare …Ba7.' },
        { move: 'Nbd2', by: 'w', idea: 'Reroute the knight toward the kingside; a prepared d4 comes later, aimed at f7.' },
      ],
    },
    {
      name: '3…Bc5: the d4 break (aggressive)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'e5', by: 'b', idea: 'Black mirrors.' },
        { move: 'Nf3', by: 'w', idea: 'Develop, threaten e5.' },
        { move: 'Nc6', by: 'b', idea: 'Defend and develop.' },
        { move: 'Bc4', by: 'w', idea: 'The Italian bishop, eyeing f7.' },
        { move: 'Bc5', by: 'b', idea: 'Black mirrors.' },
        { move: 'c3', by: 'w', idea: 'Prepare the big central break d4.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and hit e4.' },
        { move: 'd4', by: 'w', idea: 'Strike the center NOW — the sharper, more forcing option. Sound, but more theory than the calm 5.d3.' },
        { move: 'exd4', by: 'b', idea: 'Black captures.' },
        { move: 'cxd4', by: 'w', idea: 'Recapture and build a strong d4–e4 pawn center.' },
        { move: 'Bb4+', by: 'b', idea: 'A check to slow you down before the center rolls forward.' },
        { move: 'Bd2', by: 'w', idea: 'Block the check and offer a trade — keep it simple and safe.' },
        { move: 'Bxd2+', by: 'b', idea: 'Black trades.' },
        { move: 'Nbxd2', by: 'w', idea: 'Recapture, develop, and keep your big center. You’re ahead in space.' },
      ],
    },
    {
      name: '3…Bc5: Evans Gambit (sharp)',
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
        { move: 'd4', by: 'w', idea: 'Build the big center with gain of time — the point of the gambit.' },
        { move: 'exd4', by: 'b', idea: 'Black grabs a second pawn.' },
        { move: 'O-O', by: 'w', idea: 'Castle and open lines. You have a crushing lead in development for the pawns — this is the Evergreen Game.' },
      ],
    },
    {
      name: '3…Nf6: Two Knights, calm 4.d3',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'e5', by: 'b', idea: 'Open game.' },
        { move: 'Nf3', by: 'w', idea: 'Attack e5.' },
        { move: 'Nc6', by: 'b', idea: 'Defend.' },
        { move: 'Bc4', by: 'w', idea: 'Italian bishop.' },
        { move: 'Nf6', by: 'b', idea: 'The Two Knights — Black hits e4 instead of playing …Bc5.' },
        { move: 'd3', by: 'w', idea: 'Calm and strong — the SOUND main line. Sidestep the wild Fried Liver and just play good chess.' },
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
      name: '3…Nf6: the 4.Ng5 attack (sharp, optional)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'e5', by: 'b', idea: 'Open game.' },
        { move: 'Nf3', by: 'w', idea: 'Attack e5.' },
        { move: 'Nc6', by: 'b', idea: 'Defend.' },
        { move: 'Bc4', by: 'w', idea: 'Italian bishop.' },
        { move: 'Nf6', by: 'b', idea: 'The Two Knights.' },
        { move: 'Ng5', by: 'w', idea: 'The aggressive try — attack f7 at once. Fun, but optional: Black has a known equalizer, so 4.d3 is the sounder choice.' },
        { move: 'd5', by: 'b', idea: 'Forced — block the attack on f7.' },
        { move: 'exd5', by: 'w', idea: 'Open the position.' },
        { move: 'Na5', by: 'b', idea: 'Black’s best! Hit the bishop and accept a pawn for activity (NOT 5…Nxd5?? 6.Nxf7! — the Fried Liver).' },
        { move: 'Bb5+', by: 'w', idea: 'Check and keep the bishop.' },
        { move: 'c6', by: 'b', idea: 'Block and challenge.' },
        { move: 'dxc6', by: 'w', idea: 'Grab another pawn.' },
        { move: 'bxc6', by: 'b', idea: 'Recapture, opening lines for the rook and bishop.' },
        { move: 'Be2', by: 'w', idea: 'Retreat. You’re a pawn up, but Black has real development for it — this is why 4.d3 is the main line.' },
      ],
    },
    {
      name: '3…Be7: Hungarian Defense',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'e5', by: 'b', idea: 'Open game.' },
        { move: 'Nf3', by: 'w', idea: 'Attack e5.' },
        { move: 'Nc6', by: 'b', idea: 'Defend.' },
        { move: 'Bc4', by: 'w', idea: 'Italian bishop.' },
        { move: 'Be7', by: 'b', idea: 'The Hungarian — passive but solid; this bishop won’t fight for the center.' },
        { move: 'd4', by: 'w', idea: 'Grab the center at once — punish the passive bishop.' },
        { move: 'exd4', by: 'b', idea: 'Black captures.' },
        { move: 'Nxd4', by: 'w', idea: 'Recapture with the knight; you have a big, free center.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and hit e4.' },
        { move: 'Nc3', by: 'w', idea: 'Defend e4 and develop.' },
        { move: 'O-O', by: 'b', idea: 'Black castles.' },
        { move: 'O-O', by: 'w', idea: 'Castle. You have more space and easy, principled development.' },
      ],
    },
    {
      name: '3…d6: solid setup',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'e5', by: 'b', idea: 'Open game.' },
        { move: 'Nf3', by: 'w', idea: 'Attack e5.' },
        { move: 'Nc6', by: 'b', idea: 'Defend.' },
        { move: 'Bc4', by: 'w', idea: 'Italian bishop.' },
        { move: 'd6', by: 'b', idea: 'A solid, passive setup — Black braces e5 and delays …Nf6.' },
        { move: 'd4', by: 'w', idea: 'Challenge the center immediately while you’re better developed.' },
        { move: 'exd4', by: 'b', idea: 'Black releases the tension.' },
        { move: 'Nxd4', by: 'w', idea: 'Recentralize the knight; your pieces are freer.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and hit e4.' },
        { move: 'Nc3', by: 'w', idea: 'Defend e4 and develop.' },
        { move: 'Be7', by: 'b', idea: 'Black develops.' },
        { move: 'O-O', by: 'w', idea: 'Castle.' },
        { move: 'O-O', by: 'b', idea: 'Black castles.' },
        { move: 'h3', by: 'w', idea: 'Make luft, stop …Bg4/…Ng4, and prepare to improve your pieces and pressure f7.' },
      ],
    },
    {
      name: '2…Nf6: Petroff Defense',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'e5', by: 'b', idea: 'Open game.' },
        { move: 'Nf3', by: 'w', idea: 'Attack e5.' },
        { move: 'Nf6', by: 'b', idea: 'The Petroff — Black ignores the threat and counterattacks e4.' },
        { move: 'Nxe5', by: 'w', idea: 'Just take the pawn. (Black must NOT copy with 3…Nxe4?! — 4.Qe2! and 4…Nf6?? 5.Nc6+ wins the queen.)' },
        { move: 'd6', by: 'b', idea: 'Kick the knight FIRST — the correct move order.' },
        { move: 'Nf3', by: 'w', idea: 'Retreat.' },
        { move: 'Nxe4', by: 'b', idea: 'Now it’s safe to recapture on e4.' },
        { move: 'd4', by: 'w', idea: 'Open the center and grab space — the main line.' },
        { move: 'd5', by: 'b', idea: 'Support the e4-knight.' },
        { move: 'Bd3', by: 'w', idea: 'Develop, eye the kingside, and challenge the e4-knight.' },
        { move: 'Nc6', by: 'b', idea: 'Develop and pressure d4.' },
        { move: 'O-O', by: 'w', idea: 'Castle; next Re1, c4 — you have an easy, slightly freer game.' },
      ],
    },
    {
      name: '2…d6: Philidor Defense',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'e5', by: 'b', idea: 'Open game.' },
        { move: 'Nf3', by: 'w', idea: 'Attack e5.' },
        { move: 'd6', by: 'b', idea: 'The Philidor — solid but passive; Black defends e5 with the pawn.' },
        { move: 'd4', by: 'w', idea: 'Challenge the center immediately — this is best (and 3…Bg4?! runs into 4.dxe5! — the Opera-Game trap).' },
        { move: 'exd4', by: 'b', idea: 'Black’s most common reply.' },
        { move: 'Nxd4', by: 'w', idea: 'Recentralize; your bishops and f-pawn come alive.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and hit e4.' },
        { move: 'Nc3', by: 'w', idea: 'Defend e4 and develop.' },
        { move: 'Be7', by: 'b', idea: 'Black develops (the solid Antoshin setup).' },
        { move: 'Bc4', by: 'w', idea: 'The Italian bishop again — aim at f7.' },
        { move: 'O-O', by: 'b', idea: 'Black castles.' },
        { move: 'O-O', by: 'w', idea: 'Castle.' },
        { move: 'c6', by: 'b', idea: 'Black controls d5.' },
        { move: 'Bb3', by: 'w', idea: 'Tuck the bishop safely; you enjoy more space and a free game.' },
      ],
    },
  ],
  plans: [
    'Default plan: castle, Re1, reroute Nbd2–f1–g3, play h3, THEN the d4 break aimed at f7.',
    'Keep the light bishop healthy — if …Na5 attacks it, retreat to b3, not home to f1.',
    'When Black avoids the main line (Petroff …Nf6, Philidor …d6), grab the center with d4 for a freer game.',
    'Castle before you attack; watch the a2–g8 diagonal and f7 for tactics.',
  ],
  traps: [
    'Punish the Petroff copycat: after 2…Nf6 3.Nxe5, if Black plays 3…Nxe4?! answer 4.Qe2! — then 4…Nf6?? 5.Nc6+ wins the queen.',
    'Opera-Game trap: vs the Philidor, 3…Bg4?! 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 and 6…Nf6?? 7.Qb3 forks f7 and b7.',
    'The Fried Liver (3…Nf6 4.Ng5) is a fun sharp try, but 4…d5 5.exd5 Na5! equalizes — the calm 4.d3 is the sound main line.',
    'Don’t grab e5 early with Nxe5 — …Qd4 or …Qg5 forks can punish it.',
  ],
  offBook:
    'This trains 1.e4 e5. If Black answers 1.e4 with something else (the Sicilian 1…c5, French 1…e6, or Caro-Kann 1…c6), ' +
    'fall back on the three principles — fight for the center, develop every piece, and castle — and we can add dedicated anti-Sicilian/French lines as you climb.',
}

export const caroKann = {
  id: 'caro-kann',
  name: 'Caro-Kann Defense',
  color: 'black',
  meets: 'e4',
  recommended: true,
  summary:
    '1…c6 — the solid, reliable answer to 1.e4 that you already play and score with, now with a line for every ' +
    'White try: Classical, Advance, Exchange, Panov, Fantasy, the Two Knights, and the King’s Indian Attack.',
  whyItWorks:
    "The Caro-Kann is the grown-up answer to 1.e4. You challenge the center with c6 and d5, but unlike the French, " +
    "you get to develop your light-squared bishop OUTSIDE the pawn chain to f5 or g6 before playing e6. " +
    "That bishop is the piece that makes French players miserable, and in the Caro it becomes one of your best pieces. " +
    "White can try many setups against it — pushing e5, trading on d5, the Panov c4, the Fantasy f3 — so this repertoire gives you a sound, clear answer to each. " +
    "You get a solid structure, you rarely get mated in the opening, and you reach calm positions where good moves beat memorized traps. It’s already your best-scoring defense.",
  middlegame:
    "Your structure usually has pawns on c6 and e6 with a great bishop outside the chain. " +
    "The key freeing break is …c5, hitting White's d4-pawn once you're developed; in the Advance Variation that …c5 break is your main source of counterplay. " +
    "Trade off White's attacking light-squared bishop when you can, aim for solid piece play, and you'll often reach endgames where your structure is simply better. " +
    "Patience wins Caro-Kann games — develop, castle, break with …c5, and let White over-extend. When you want LESS theory, the Tartakower (…Nf6 then …exf6) gives a sound, easy-to-play game.",
  variations: [
    {
      name: '3.Nc3: Classical (4…Bf5)',
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
        { move: 'e6', by: 'b', idea: 'Solid: finish with …Ngf6, …Be7/…Bd6, and castle.' },
      ],
    },
    {
      name: '3.Nc3: Tartakower (4…Nf6, low theory)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'c6', by: 'b', idea: 'Caro.' },
        { move: 'd4', by: 'w', idea: 'Center.' },
        { move: 'd5', by: 'b', idea: 'Challenge.' },
        { move: 'Nc3', by: 'w', idea: 'Defend e4 and develop.' },
        { move: 'dxe4', by: 'b', idea: 'Resolve the tension.' },
        { move: 'Nxe4', by: 'w', idea: 'Recapture.' },
        { move: 'Nf6', by: 'b', idea: 'The low-theory choice — invite the trade for fast, easy development.' },
        { move: 'Nxf6+', by: 'w', idea: 'White trades on f6.' },
        { move: 'exf6', by: 'b', idea: 'The Tartakower recapture — open the e-file, gain the bishop pair, develop fast (sounder than …gxf6).' },
        { move: 'c3', by: 'w', idea: 'White supports d4.' },
        { move: 'Bd6', by: 'b', idea: 'Develop toward the kingside; you’ll castle quickly.' },
        { move: 'Bd3', by: 'w', idea: 'White develops.' },
        { move: 'O-O', by: 'b', idea: 'King safety.' },
        { move: 'Ne2', by: 'w', idea: 'White develops.' },
        { move: 'Re8', by: 'b', idea: 'Use the open e-file.' },
        { move: 'O-O', by: 'w', idea: 'White castles.' },
        { move: 'Nd7', by: 'b', idea: 'Develop; with the bishop pair and easy play, you have a comfortable, low-maintenance game.' },
      ],
    },
    {
      name: '3.e5: Advance (Short System)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'c6', by: 'b', idea: 'The Caro move order.' },
        { move: 'd4', by: 'w', idea: 'Big center.' },
        { move: 'd5', by: 'b', idea: 'Challenge it.' },
        { move: 'e5', by: 'w', idea: 'White grabs space and locks the center — the sharpest, best-scoring try.' },
        { move: 'Bf5', by: 'b', idea: 'Get the bishop out NOW, before …e6 — the whole reason to play the Caro.' },
        { move: 'Nf3', by: 'w', idea: 'The calm Short System — White just develops.' },
        { move: 'e6', by: 'b', idea: 'Now build the chain behind your already-developed bishop.' },
        { move: 'Be2', by: 'w', idea: 'White develops quietly.' },
        { move: 'c5', by: 'b', idea: 'The key break — hit d4 and open lines for your pieces.' },
        { move: 'c3', by: 'w', idea: 'White props up d4.' },
        { move: 'Nc6', by: 'b', idea: 'Pile on d4 and develop.' },
        { move: 'O-O', by: 'w', idea: 'White castles.' },
        { move: 'Nge7', by: 'b', idea: 'Route the knight to g6 or f5; finish developing and castle. Solid with clear counterplay.' },
      ],
    },
    {
      name: '3.e5: Advance vs 4.g4 (sharp)',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'c6', by: 'b', idea: 'Caro.' },
        { move: 'd4', by: 'w', idea: 'Center.' },
        { move: 'd5', by: 'b', idea: 'Challenge.' },
        { move: 'e5', by: 'w', idea: 'The Advance.' },
        { move: 'Bf5', by: 'b', idea: 'Bishop out first.' },
        { move: 'g4', by: 'w', idea: 'The Bayonet Attack — kick the bishop and grab space (aggressive and sharp).' },
        { move: 'Bd7', by: 'b', idea: 'Retreat calmly — DON’T let the bishop get trapped on the kingside. It’ll reroute via b5/e8.' },
        { move: 'c4', by: 'w', idea: 'White grabs more space.' },
        { move: 'e6', by: 'b', idea: 'Open your pieces and prepare to strike back.' },
        { move: 'Nc3', by: 'w', idea: 'White develops.' },
        { move: 'c5', by: 'b', idea: 'Hit the over-extended center — White’s big pawns become targets.' },
        { move: 'dxc5', by: 'w', idea: 'White releases the tension.' },
        { move: 'Bxc5', by: 'b', idea: 'Develop with tempo; your pieces are active and White’s pawns are loose. Black is fine.' },
      ],
    },
    {
      name: '3.exd5: Exchange',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'c6', by: 'b', idea: 'Caro.' },
        { move: 'd4', by: 'w', idea: 'Center.' },
        { move: 'd5', by: 'b', idea: 'Challenge.' },
        { move: 'exd5', by: 'w', idea: 'White trades in the center.' },
        { move: 'cxd5', by: 'b', idea: 'Recapture; you have an easy, symmetrical position.' },
        { move: 'Bd3', by: 'w', idea: 'White develops and stops …Bf5.' },
        { move: 'Nc6', by: 'b', idea: 'Develop and control the center.' },
        { move: 'c3', by: 'w', idea: 'White supports d4.' },
        { move: 'Nf6', by: 'b', idea: 'Develop; eye the e4 and g4 squares.' },
        { move: 'Bf4', by: 'w', idea: 'White develops the bishop.' },
        { move: 'e6', by: 'b', idea: 'Open your dark-squared bishop so it can challenge White’s.' },
        { move: 'Nf3', by: 'w', idea: 'White develops.' },
        { move: 'Bd6', by: 'b', idea: 'Challenge White’s good bishop head-on.' },
        { move: 'Bxd6', by: 'w', idea: 'White trades.' },
        { move: 'Qxd6', by: 'b', idea: 'Recapture; easy development with …O-O and …Bd7/…Bg4 to come.' },
      ],
    },
    {
      name: '3.exd5 4.c4: Panov-Botvinnik',
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
        { move: 'cxd5', by: 'w', idea: 'White clarifies, leaving himself an isolated d4-pawn.' },
        { move: 'Nxd5', by: 'b', idea: 'Recapture and BLOCKADE the isolated pawn — trade pieces and target d4. Your long-term trump.' },
      ],
    },
    {
      name: '3.f3: Fantasy',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'c6', by: 'b', idea: 'Caro.' },
        { move: 'd4', by: 'w', idea: 'Center.' },
        { move: 'd5', by: 'b', idea: 'Challenge.' },
        { move: 'f3', by: 'w', idea: 'The Fantasy — White props up e4 to build a big center (but loosens his kingside).' },
        { move: 'e6', by: 'b', idea: 'The solid, low-risk reply: open your bishop and keep your structure intact. Don’t grab on e4 yet.' },
        { move: 'Nc3', by: 'w', idea: 'White develops.' },
        { move: 'Bb4', by: 'b', idea: 'Pin the knight to pile pressure on e4.' },
        { move: 'Bf4', by: 'w', idea: 'White develops.' },
        { move: 'Ne7', by: 'b', idea: 'Flexible — the knight heads to g6 to hit the f4-bishop, keeping …Nd7 and …c5 ideas.' },
        { move: 'Bd3', by: 'w', idea: 'White develops.' },
        { move: 'Nd7', by: 'b', idea: 'Develop and prepare the freeing …c5 break.' },
        { move: 'Nge2', by: 'w', idea: 'White completes development.' },
        { move: 'c5', by: 'b', idea: 'The thematic break — hit d4 and open the game for your better-coordinated pieces.' },
      ],
    },
    {
      name: '2.Nc3 / 2.Nf3: Two Knights',
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
        { move: 'Nf6', by: 'b', idea: 'Develop and hit e4 — note: never grab the d-pawn here, just develop.' },
        { move: 'd3', by: 'w', idea: 'White supports e4.' },
        { move: 'e6', by: 'b', idea: 'Open your bishop — rock-solid and easy to play.' },
        { move: 'g3', by: 'w', idea: 'White fianchettoes.' },
        { move: 'Bb4', by: 'b', idea: 'Pin and develop; finish with …O-O. A comfortable, balanced game.' },
      ],
    },
    {
      name: '2.d3: King’s Indian Attack',
      line: [
        { move: 'e4', by: 'w', idea: 'Center.' },
        { move: 'c6', by: 'b', idea: 'Caro.' },
        { move: 'd3', by: 'w', idea: 'The King’s Indian Attack — White plays a quiet, passive setup.' },
        { move: 'd5', by: 'b', idea: 'Take the center — White’s passivity lets you grab space.' },
        { move: 'Nd2', by: 'w', idea: 'White develops behind the pawns.' },
        { move: 'e5', by: 'b', idea: 'Seize the FULL center with both pawns — Black is already comfortable.' },
        { move: 'Ngf3', by: 'w', idea: 'White develops.' },
        { move: 'Bd6', by: 'b', idea: 'Develop actively, guarding e5.' },
        { move: 'g3', by: 'w', idea: 'White fianchettoes the bishop.' },
        { move: 'Nf6', by: 'b', idea: 'Develop and protect your big center.' },
        { move: 'Bg2', by: 'w', idea: 'White develops.' },
        { move: 'O-O', by: 'b', idea: 'King safety.' },
        { move: 'O-O', by: 'w', idea: 'White castles.' },
        { move: 'Re8', by: 'b', idea: 'Back up e5; you have more space and an easy plan of …a5, …Nbd7, …Qc7. A great version for Black.' },
      ],
    },
  ],
  plans: [
    'Get the light-squared bishop OUTSIDE the chain (…Bf5 or …Bg6) before playing …e6 — the heart of the Caro.',
    'The …c5 break is your main counterplay, especially against the Advance Variation.',
    'Against the Panov’s isolated pawn, blockade d5, trade pieces, and target the d4-pawn in the endgame.',
    'Want less theory? Use the Tartakower (…Nf6, …exf6) — bishop pair and fast, easy development.',
  ],
  traps: [
    'In the Advance, play …Bf5 BEFORE …e6. If you play …e6 first your bishop is stuck behind the pawns (the French problem you’re avoiding).',
    'Smothered-mate trap: if you ever meet 3.Nc3 with the …Nd7 move order, after 5.Qe2 you MUST play 5…Ndf6 — 5…Ngf6?? allows 6.Nd6 checkmate.',
    'Don’t grab White’s h-pawn with …gxh5 in the h4–h5 lines — it can run into Bxf7#. Make luft with …h6 first and keep the bishop safe.',
    'Against the Fantasy (3.f3), don’t rush …dxe4; the calm …e6 keeps you safe and solid.',
  ],
  offBook:
    'Against other tries (2.c4 Accelerated Panov, 2.Ne2, or gambits), the same ideas apply: …d5, get the bishop out, …e6, develop and castle. ' +
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
