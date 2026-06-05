import SpeakButton from './SpeakButton'
import { coachReportToText } from '../lib/coach'

// Whole-game, plain-English coaching: strengths, the turning point, positional ideas to try,
// and takeaways. Built from heuristics over the Stockfish review — no engine call here.
export default function CoachReport({ report }) {
  if (!report) return null
  const tp = report.turningPoint
  return (
    <div className="coach-report">
      <div className="study-head">
        <strong>🧑‍🏫 Coach's take</strong>
        <SpeakButton text={coachReportToText(report)} label="Hear the analysis" />
      </div>

      {report.strengths.length > 0 && (
        <div className="cr-block">
          <span className="cr-eyebrow good">✅ What you did well</span>
          <ul>
            {report.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {tp && (
        <div className="cr-block">
          <span className="cr-eyebrow bad">⚠️ Turning point</span>
          <p>
            Move <b>{tp.moveNo}</b>: you played <b>{tp.played}</b> ({tp.lossText}).
            {tp.better && (
              <>
                {' '}
                Better was <b>{tp.better}</b>
                {tp.reason ? ` — ${tp.reason}` : ''}.
              </>
            )}
          </p>
          {tp.lineSan?.length > 1 && (
            <p className="coach-line">
              The idea: <code>{tp.lineSan.join(' ')}</code>
            </p>
          )}
        </div>
      )}

      {report.ideas.length > 0 && (
        <div className="cr-block">
          <span className="cr-eyebrow idea">💡 Ideas to try in future games</span>
          <ul>
            {report.ideas.map((idea, i) => (
              <li key={i}>
                <b>{idea.title}.</b> {idea.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.workOn.length > 0 && (
        <div className="cr-block">
          <span className="cr-eyebrow">🎯 Work on</span>
          <ul>
            {report.workOn.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
