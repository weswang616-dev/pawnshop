import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/review', label: 'Game Review' },
  { to: '/openings', label: 'Repertoire' },
  { to: '/tactics', label: 'Tactics' },
  { to: '/practice', label: 'Practice' },
]

export default function Nav() {
  return (
    <header className="nav">
      <NavLink to="/" className="brand" end>
        <span className="brand-mark">♟</span> Pawnshop
      </NavLink>
      <nav className="nav-links">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
