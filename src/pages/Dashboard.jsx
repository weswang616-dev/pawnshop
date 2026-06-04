import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getPlayerProfile, getPlayerStats, summariseStats } from '../lib/chesscom'
import { stats as srsStats } from '../lib/srs'
import { stats as mistakeStats } from '../lib/mistakes'
import { topWeakness } from '../lib/weakness'
import { recordRatings, getRatingHistory } from '../lib/ratingHistory'

const TRAINERS = [
  {
    to: '/review',
    emoji: '🔍',
    title: 'Game Review',
    blurb: 'Import your chess.com games and let Stockfish flag exactly where you went wrong — your #1 way to stop hanging pieces.',
  },
  {
    to: '/openings',
    emoji: '📖',
    title: 'Repertoire',
    blurb: 'Learn, drill, and memorize your openings (Italian for White; solid Black defenses) with spaced repetition.',
  },
  {
    to: '/tactics',
    emoji: '⚡',
    title: 'Tactics',
    blurb: 'Solve real rated puzzles — and train the exact weakness your games reveal. Pattern recognition wins games.',
  },
  {
    to: '/practice?tab=guess',
    emoji: '🎯',
    title: 'Guess the Move',
    blurb: 'Play through the games of Morphy, Anderssen and Marshall — guess each move and learn how the legends attacked.',
  },
]

const PLAN = [
  ['Blunder-check every move', 'Before you move, ask: “Is it safe? What is my opponent threatening?” This one habit is worth hundreds of rating points.'],
  ['Do tactics daily', 'A handful of puzzles a day builds the pattern recognition that wins games at your level.'],
  ['Play longer, then review', 'Play 10–15 min games (not bullet) so you have time to think — then review every loss in Game Review.'],
  ['Know your opening plan', 'A little Italian goes a long way: develop, castle, and aim at f7. Skip deep memorization for now.'],
]

export default function Dashboard() {
  const [username, setUsername] = useLocalStorage('chesscom-username', '')
  const [input, setInput] = useState(username)
  const [profile, setProfile] = useState(null)
  const [ratings, setRatings] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [puzzleStats] = useLocalStorage('puzzle-stats', { solved: 0, streak: 0, attempts: 0 })
  const navigate = useNavigate()

  // Recomputed each time the dashboard mounts (i.e. every time you come back to it).
  const srs = useMemo(() => srsStats(), [])
  const weakness = useMemo(() => topWeakness(), [])
  const mist = useMemo(() => mistakeStats(), [])
  const history = useMemo(() => getRatingHistory(), [ratings])

  async function load(name) {
    const clean = (name ?? '').trim()
    if (!clean) return
    setStatus('loading')
    setError('')
    try {
      const [p, s] = await Promise.all([getPlayerProfile(clean), getPlayerStats(clean)])
      const summ = summariseStats(s)
      setProfile(p)
      setRatings(summ)
      recordRatings(summ)
      setUsername(clean)
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  useEffect(() => {
    if (username) load(username)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const repTitle = srs.due
    ? `${srs.due} ${srs.due === 1 ? 'review' : 'reviews'} due`
    : srs.fresh
      ? `Learn ${srs.fresh} new moves`
      : 'Repertoire is sharp ✓'

  return (
    <div className="page">
      <section className="hero">
        <h1>
          Train smarter, <span className="accent">climb faster.</span>
        </h1>
        <p className="lead">
          Your personal chess gym — built around <strong>your</strong> games. Find your blunders, drill your
          openings, and grind tactics. Tuned for the climb out of the {`<`}1000 range.
        </p>

        <form
          className="connect"
          onSubmit={(e) => {
            e.preventDefault()
            load(input)
          }}
        >
          <input
            type="text"
            placeholder="your chess.com username"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="chess.com username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Connecting…' : profile ? 'Refresh' : 'Connect'}
          </button>
        </form>
        {status === 'error' && <p className="error">{error}</p>}
      </section>

      {profile && ratings && (
        <section className="profile-card">
          {profile.avatar && <img src={profile.avatar} alt="" className="avatar" />}
          <div className="profile-meta">
            <a href={profile.url} target="_blank" rel="noreferrer" className="profile-name">
              {profile.name || profile.username || username}
            </a>
            <div className="rating-row">
              <Rating label="Rapid" value={ratings.rapid} />
              <Rating label="Blitz" value={ratings.blitz} />
              <Rating label="Bullet" value={ratings.bullet} />
            </div>
          </div>
        </section>
      )}

      <section className="today">
        <h2>Today's plan</h2>
        <div className="today-grid">
          <TodayCard
            emoji="🔍"
            accent
            title="Review your latest game"
            sub={profile ? 'Find the blunders from your last game' : 'Connect your account first'}
            onClick={() => navigate('/review?latest=1')}
            disabled={!profile}
          />
          <TodayCard emoji="🧠" title={repTitle} sub="Spaced repetition keeps your openings memorized" to="/openings" />
          <TodayCard
            emoji="🎯"
            title={weakness ? `Train: ${weakness.label}` : 'Solve some tactics'}
            sub={
              weakness
                ? `Your top leak — ${weakness.count} flagged in your games`
                : puzzleStats.solved
                  ? `${puzzleStats.solved} solved · streak ${puzzleStats.streak}`
                  : 'A few puzzles a day compounds fast'
            }
            to="/tactics"
          />
          <TodayCard
            emoji="🩹"
            title={mist.due ? `Drill ${mist.due} due mistake${mist.due === 1 ? '' : 's'}` : mist.total ? 'Drill your mistakes' : 'No mistakes logged yet'}
            sub={mist.total ? `${mist.total} from your own games` : 'Review games to collect them'}
            to="/practice"
          />
        </div>
      </section>

      {(history.length > 0 || mist.total > 0 || puzzleStats.solved > 0) && (
        <section className="progress-section">
          <h2>Your progress</h2>
          <div className="progress-grid">
            <div className="progress-chart">
              <span className="muted small">Rapid rating over time</span>
              <Sparkline data={history} />
            </div>
            <div className="progress-tiles">
              <ProgTile n={mist.total} label="Mistakes logged" />
              <ProgTile n={srs.due + srs.fresh} label="Reviews to do" />
              <ProgTile n={puzzleStats.solved} label="Puzzles solved" />
              <ProgTile
                n={puzzleStats.attempts ? `${Math.round((puzzleStats.solved / puzzleStats.attempts) * 100)}%` : '—'}
                label="Puzzle accuracy"
              />
            </div>
          </div>
        </section>
      )}

      <section className="cards">
        {TRAINERS.map((t) => (
          <Link key={t.to} to={t.to} className="card">
            <div className="card-emoji">{t.emoji}</div>
            <h2>{t.title}</h2>
            <p>{t.blurb}</p>
          </Link>
        ))}
      </section>

      <section className="plan">
        <h2>Your plan at ~750</h2>
        <p className="plan-sub">
          The fastest gains right now come from <strong>not hanging pieces</strong> and <strong>tactics</strong> — not
          opening memorization. Here is the order that works:
        </p>
        <ol className="plan-list">
          {PLAN.map(([title, body], i) => (
            <li key={i}>
              <span className="plan-num">{i + 1}</span>
              <div>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function TodayCard({ emoji, title, sub, to, onClick, disabled, accent }) {
  const inner = (
    <>
      <div className="today-emoji">{emoji}</div>
      <div className="today-text">
        <strong>{title}</strong>
        <span>{sub}</span>
      </div>
      <span className="today-arrow">→</span>
    </>
  )
  const cls = `today-card ${accent ? 'accent-card' : ''} ${disabled ? 'disabled' : ''}`
  if (disabled) return <div className={cls}>{inner}</div>
  if (to) return <Link to={to} className={cls}>{inner}</Link>
  return <button className={cls} onClick={onClick}>{inner}</button>
}

function Sparkline({ data }) {
  const pts = data.filter((d) => d.rapid != null).map((d) => d.rapid)
  if (pts.length < 2) return <p className="muted small">Connect a few days in a row and your rating trend shows up here.</p>
  const w = 280, h = 64, pad = 6
  const min = Math.min(...pts), max = Math.max(...pts)
  const x = (i) => pad + (i * (w - 2 * pad)) / (pts.length - 1)
  const y = (v) => h - pad - (max === min ? 0.5 : (v - min) / (max - min)) * (h - 2 * pad)
  const d = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="spark" preserveAspectRatio="none" aria-label="rating trend">
      <path d={d} fill="none" stroke="#7cb342" strokeWidth="2" />
    </svg>
  )
}

function ProgTile({ n, label }) {
  return (
    <div className="stat">
      <span className="stat-n">{n}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function Rating({ label, value }) {
  return (
    <div className="rating">
      <span className="rating-val">{value ?? '—'}</span>
      <span className="rating-label">{label}</span>
    </div>
  )
}
