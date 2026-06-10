// Turns a repertoire variation into a "video lesson" script: an ordered list of SEGMENTS
// the LessonPlayer steps through like chapters of a YouTube video.
//
// Segment types:
//   intro  — title card + welcome narration on the start position.
//   move   — one ply: board shows the position AFTER the move, an arrow shows the move,
//            and the coach narrates the move plus the idea behind it.
//   drill  — interactive checkpoint: the board rewinds to `startStep` and YOU must replay
//            your moves up to `endStep` from memory (the player answers for the other side).
//            Inserted after every couple of your moves, plus a full-line final test.
//            Variant `drillKind:'fix'` (from the "Your games" chapter): a standalone
//            position (`fen`) with one correct move (`acceptSans`) and no opponent replies.
//   note   — talking-head chapter on a fixed position: the plan after the opening,
//            the middlegame strategy, and the wrap-up.
//
// Pass `gameMoments` (from src/lib/gameMoments.js) to insert a "📺 Your games" chapter —
// positions from the user's own recent chess.com games where they left this opening's book,
// each followed by a fix-it drill. Omitted when there's nothing to show.
//
// Every segment carries `caption` (shown as a subtitle) and `speech` (read aloud — SAN is
// converted to spoken English by speak()).

import { Chess } from 'chess.js'

// How long to "hold" a segment when text-to-speech isn't available (or fails): a rough
// reading time so the lesson still auto-plays like a video.
export function readMs(text) {
  const words = String(text || '').trim().split(/\s+/).length
  return Math.max(2200, 1200 + words * 340)
}

function firstSentences(text, n = 2) {
  const parts = String(text || '').split(/(?<=[.!?])\s+/)
  return parts.slice(0, n).join(' ')
}

// Drop a drill checkpoint after this many of YOUR moves.
const MOVES_PER_DRILL = 2

export function buildLesson(rep, variation, gameMoments = null) {
  const line = variation.line
  const userColor = rep.color === 'white' ? 'w' : 'b'
  const you = rep.color === 'white' ? 'White' : 'Black'
  const them = rep.color === 'white' ? 'Black' : 'White'

  // Precompute positions and from/to squares for arrows.
  const c = new Chess()
  const positions = [c.fen()]
  const fromTo = []
  for (const ply of line) {
    const m = c.move(ply.move)
    fromTo.push({ from: m.from, to: m.to })
    positions.push(c.fen())
  }
  const finalFen = positions[positions.length - 1]

  const segments = []

  segments.push({
    type: 'intro',
    chapter: '👋 Intro',
    fen: positions[0],
    caption: `${rep.name} — ${variation.name}. You play ${you}.`,
    speech:
      `Welcome to your lesson on the ${rep.name}: the ${variation.name} line. You play ${you}. ` +
      `I'll show every move and the idea behind it — and every few moves, you'll play them back yourself. ` +
      `${firstSentences(rep.whyItWorks, 2)} Let's begin.`,
  })

  // Moves, with a drill checkpoint after every MOVES_PER_DRILL of the user's moves.
  let chunkStart = 0
  let chunkUserMoves = 0
  let drillNo = 0
  line.forEach((ply, i) => {
    const moveLabel = `${Math.ceil((i + 1) / 2)}${ply.by === 'w' ? '.' : '…'} ${ply.move}`
    segments.push({
      type: 'move',
      fen: positions[i + 1],
      arrows: [
        {
          startSquare: fromTo[i].from,
          endSquare: fromTo[i].to,
          color: ply.by === 'w' ? '#7cb342' : '#5b8def',
        },
      ],
      moveLabel,
      caption: `${moveLabel} — ${ply.idea}`,
      speech: `${ply.by === 'w' ? 'White' : 'Black'} plays ${ply.move}. ${ply.idea}`,
    })
    if (ply.by === userColor) chunkUserMoves += 1
    const isLast = i === line.length - 1
    if (chunkUserMoves > 0 && (chunkUserMoves >= MOVES_PER_DRILL || isLast)) {
      drillNo += 1
      segments.push({
        type: 'drill',
        chapter: `✋ Drill ${drillNo}`,
        startStep: chunkStart,
        endStep: i + 1,
        caption: `Your turn — replay your last ${chunkUserMoves} move${chunkUserMoves > 1 ? 's' : ''} from memory.`,
        speech:
          `Your turn. The board rewinds — now play your last ${chunkUserMoves} ` +
          `${you} move${chunkUserMoves > 1 ? 's' : ''} from memory. I'll answer for ${them}.`,
      })
      chunkStart = i + 1
      chunkUserMoves = 0
    }
  })

  if (variation.plan) {
    segments.push({
      type: 'note',
      chapter: '🎯 After the opening',
      fen: finalFen,
      caption: variation.plan,
      speech:
        `The book line ends here — and this is where most videos stop. ` +
        `But you're not lost, because you know the plan: ${variation.plan}`,
    })
  }
  segments.push({
    type: 'note',
    chapter: '🧭 Middlegame strategy',
    fen: finalFen,
    caption: rep.middlegame,
    speech: `Zooming out, the whole opening follows one strategy. ${rep.middlegame}`,
  })

  // "📺 Your games" — where YOU left book recently, each with a one-move fix-it drill.
  // `gamesAt` marks the insertion point so the player can remap a mid-lesson index when
  // the (async-loaded) moments arrive and the tail segments shift.
  const gamesAt = segments.length
  if (gameMoments && gameMoments.length) {
    gameMoments.forEach((m, gi) => {
      segments.push({
        type: 'note',
        chapter: gi === 0 ? '📺 Your games' : undefined,
        fen: m.fen,
        arrows: [
          { startSquare: m.playedFrom, endSquare: m.playedTo, color: '#d9534f' },
          ...(m.bookFrom ? [{ startSquare: m.bookFrom, endSquare: m.bookTo, color: '#7cb342' }] : []),
        ],
        caption:
          `${m.dateStr} vs ${m.opponent} (you ${m.resultWord}) — move ${m.moveNo}: ` +
          `you played ${m.playedSan} (red), but your repertoire plays ${m.bookSan} (green).`,
        speech:
          (gi === 0
            ? `Now for the part no video can give you — your own games. `
            : `Here's another one. `) +
          `On ${m.dateStr}, against ${m.opponent} — a game you ${m.resultWord} — you reached this position. ` +
          `On move ${m.moveNo} you played ${m.playedSan}, but your repertoire plays ${m.bookSan}. ${m.idea}`,
      })
      segments.push({
        type: 'drill',
        drillKind: 'fix',
        fen: m.fen,
        expectedSan: m.bookSan,
        acceptSans: m.bookSans,
        idea: m.idea,
        caption: `Fix it — play the move your repertoire wanted against ${m.opponent}.`,
        speech: `Your turn — fix it. Play the book move here.`,
      })
    })
  }

  // Capstone: play the entire line from move one.
  segments.push({
    type: 'drill',
    chapter: '🏁 Final test',
    startStep: 0,
    endStep: line.length,
    caption: 'Final test — play the whole line from move one.',
    speech: `Final test. Play the entire line from move one — every ${you} move. I'll play ${them}. Good luck!`,
  })

  const trap = rep.traps && rep.traps[0] ? ` One thing to watch out for: ${rep.traps[0]}` : ''
  segments.push({
    type: 'note',
    chapter: '🎉 Wrap-up',
    fen: finalFen,
    caption: 'Lesson complete! Drill other variations, then let Memorize keep them sharp.',
    speech:
      `That's the lesson — you've watched the line, played it back, and you know the plan that follows.` +
      trap +
      ` Next, pick another variation, or open Memorize mode so spaced repetition locks this in. See you in the next lesson.`,
  })

  return { segments, positions, line, userColor, gamesAt }
}
