// The signature element: a running track. Session credits are laps — the white
// line is the distance already run (used credits), each tick is one lap, and the
// infield shows how many laps are left.
import { motion, useReducedMotion } from 'framer-motion'

const MotionPath = motion.path

/** A stadium shape (two straights, two bends) inset by `inset` from the box. */
function stadium(w, h, inset) {
  const r = h / 2 - inset
  const x0 = h / 2
  const x1 = w - h / 2
  const top = inset
  const bottom = h - inset
  // Start at the finish line (bottom straight, right side) and run anticlockwise.
  return `M ${x1} ${bottom} L ${x0} ${bottom} A ${r} ${r} 0 0 1 ${x0} ${top} L ${x1} ${top} A ${r} ${r} 0 0 1 ${x1} ${bottom} Z`
}

export function TrackOval({ total = 0, used = 0, size = 'lg', className }) {
  const reduceMotion = useReducedMotion()
  const W = 320
  const H = 180
  const lanes = size === 'lg' ? 5 : 3
  const band = size === 'lg' ? 34 : 26
  const left = Math.max(0, total - used)
  const fraction = total ? Math.min(1, used / total) : 0
  const runLine = stadium(W, H, band - 7)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={total ? `${left} of ${total} session credits left — ${used} used` : 'No session credits yet'}
    >
      {/* Track surface */}
      <path d={stadium(W, H, 0)} fill="#C9472E" />
      {/* Lane lines */}
      {Array.from({ length: lanes + 1 }, (_, i) => (
        <path
          key={i}
          d={stadium(W, H, 2 + (i * (band - 4)) / lanes)}
          fill="none"
          stroke="#fff"
          strokeOpacity={i === 0 || i === lanes ? 0.9 : 0.45}
          strokeWidth={i === 0 || i === lanes ? 1.6 : 1}
        />
      ))}
      {/* Infield */}
      <path d={stadium(W, H, band)} fill="#2E6A48" />

      {/* One tick per lap (credit) on the inside lane — a single dashed stroke */}
      {total > 0 && total <= 60 && (
        <path
          d={runLine}
          pathLength={1}
          fill="none"
          stroke="#16181B"
          strokeOpacity={0.55}
          strokeWidth={9}
          strokeDasharray={`0.004 ${1 / total - 0.004}`}
          strokeDashoffset={0.002}
        />
      )}

      {/* Distance run so far */}
      {fraction > 0 && (
        <MotionPath
          d={runLine}
          fill="none"
          stroke="#fff"
          strokeWidth={4}
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: fraction }}
          transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 }}
        />
      )}

      {/* Finish line */}
      <line x1={W - H / 2} x2={W - H / 2} y1={H - band} y2={H} stroke="#fff" strokeWidth={3} />

      {/* Infield scoreboard */}
      {size === 'lg' ? (
        <g textAnchor="middle" fill="#fff">
          <text x={W / 2} y={H / 2 + 8} fontFamily="Anton, Impact, sans-serif" fontSize={56}>
            {left}
          </text>
          <text x={W / 2} y={H / 2 + 30} fontFamily='"Chivo Mono", monospace' fontSize={10} letterSpacing="0.14em">
            {total ? `OF ${total} LAPS LEFT` : 'NO LAPS YET'}
          </text>
        </g>
      ) : (
        <text x={W / 2} y={H / 2 + 14} textAnchor="middle" fill="#fff" fontFamily="Anton, Impact, sans-serif" fontSize={44}>
          {left}/{total}
        </text>
      )}
    </svg>
  )
}
