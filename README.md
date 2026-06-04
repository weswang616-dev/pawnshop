# ♟ Pawnshop — a personal chess trainer

A browser-based chess-improvement app built around **your** games. It finds your blunders,
drills the Italian Game, and serves rated tactics — tuned for climbing out of the sub-1000 range.

Everything runs **client-side**: the Stockfish engine analyzes your games right in your browser,
and all data comes from free, open sources. No backend, no accounts, no data leaves your machine.

## Quick start

```bash
npm install     # also copies the Stockfish engine into public/engine
npm run dev     # open http://localhost:5173
```

On the **Dashboard**, type your chess.com username and hit Connect. That's it.

> Requires Node 18+ (developed on Node 24).

## What's inside

| Page | What it does |
| --- | --- |
| **Dashboard** | Connect your chess.com account, see your ratings, and your level-appropriate plan. |
| **Game Review** | Imports your recent chess.com games and runs Stockfish on every position to flag *your* blunders, mistakes, and inaccuracies — with the move you should have played. |
| **Opening Trainer** | **Learn** mode walks the Italian Game move-by-move with the idea behind each one; **Drill** mode has you play it from memory (I answer for Black, wrong moves are explained). |
| **Tactics** | Real rated puzzles from Lichess, filterable by theme (forks, pins, mates…) and difficulty. |

## How it works (the stack)

- **UI:** React + Vite
- **Board:** [react-chessboard](https://www.npmjs.com/package/react-chessboard) (v5)
- **Chess logic:** [chess.js](https://github.com/jhlywa/chess.js) — move legality, PGN/FEN
- **Engine:** [stockfish.js](https://github.com/nmrugg/stockfish.js) — Stockfish 18 "lite single-threaded"
  WASM build (~7 MB), run in a Web Worker. No special server headers needed.
- **Your games:** [chess.com Published-Data API](https://support.chess.com/en/articles/9650547-published-data-api)
  (public, read-only, no key)
- **Puzzles:** [Lichess puzzle API](https://lichess.org/api) (CC0)

## Project structure

```
src/
  lib/
    engine.js      Stockfish Web Worker wrapper (UCI, White-perspective evals)
    analysis.js    centipawn-loss math + blunder classification
    chesscom.js    chess.com Published-Data API client
    lichess.js     Lichess puzzle fetcher
    italian.js     the Italian Game repertoire (moves + ideas + traps)
  components/      Board, EvalBar, Nav
  pages/           Dashboard, GameReview, OpeningTrainer, Tactics
  hooks/           useLocalStorage
scripts/
  copy-engine.js   copies the Stockfish build into public/engine
```

## Ideas for what's next

- **Spaced-repetition repertoire trainer** (FSRS / per-move scheduling, like Chessable's MoveTrainer)
- More openings + responses to the Sicilian / Caro-Kann / French as Black
- **Weakness-targeted tactics:** auto-detect your most common blunder themes in Game Review,
  then feed you puzzles for exactly those
- A unified dashboard tying your games, mistakes, and repertoire together
- Play-vs-engine at adjustable strength

---

Engine: Stockfish 18 (GPLv3). Game/puzzle data: chess.com & Lichess (CC0). Built to help you improve.
