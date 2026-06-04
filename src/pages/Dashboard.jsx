import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getPlayerProfile, getPlayerStats, summariseStats } from '../lib/chesscom'
import { stats as srsStats } from '../lib/srs'
import { topWeakness } from '../lib/weakness'

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

  async function load(name) {
    const clean = (name ?? '').trim()
    if (!clean) return
    setStatus('loading')
    setError('')
    try {
      const [p, s] = await Promise.all([getPlayerProfile(clean), getPlayerStats(clean)])
      setProfile(p)
      setRatings(summariseStats(s))
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
        </div>
      </section>

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

function Rating({ label, value }) {
  return (
    <div className="rating">
      <span className="rating-val">{value ?? '—'}</span>
      <span className="rating-label">{label}</span>
    </div>
  )
}
