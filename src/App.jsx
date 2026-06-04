import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Dashboard from './pages/Dashboard.jsx'
import GameReview from './pages/GameReview.jsx'
import OpeningTrainer from './pages/OpeningTrainer.jsx'
import Tactics from './pages/Tactics.jsx'
import Practice from './pages/Practice.jsx'

export default function App() {
  return (
    <div className="app">
      <Nav />
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/review" element={<GameReview />} />
          <Route path="/openings" element={<OpeningTrainer />} />
          <Route path="/tactics" element={<Tactics />} />
          <Route path="/practice" element={<Practice />} />
        </Routes>
      </main>
      <footer className="footer">
        Built to help you improve · Engine: Stockfish&nbsp;18 (lite, in-browser) · Data: chess.com &amp; Lichess (CC0)
      </footer>
    </div>
  )
}
