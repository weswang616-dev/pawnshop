import { useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { loadGameMoments } from '../lib/gameMoments'

// Recent "you left book here" moments from the user's chess.com games, for Lesson mode.
// Returns null while loading, [] when there's nothing to show (no username, no departures,
// or a network error — the lesson must never break because chess.com is unreachable).
export function useGameMoments(rep, enabled = true) {
  const [username] = useLocalStorage('chesscom-username', '')
  const [moments, setMoments] = useState(null)

  useEffect(() => {
    if (!enabled || !username) {
      setMoments([])
      return
    }
    let alive = true
    setMoments(null)
    loadGameMoments(username, rep)
      .then((m) => alive && setMoments(m))
      .catch(() => alive && setMoments([]))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, rep.id, enabled])

  return moments
}
