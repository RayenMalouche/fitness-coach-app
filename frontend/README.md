# Fitness Coach — the track

The frontend for the fitness-coach API. React 19 + Vite, React Router, Tailwind v3,
framer-motion.

```bash
npm install
npm run dev        # http://localhost:5173 — expects the API at http://localhost:5000/api
npm run build      # → dist/
```

Point it at another API with `VITE_API_URL=http://host:5000/api`.

## The design

The app is run like **a track meet**. A coach and their athletes already talk in
laps, heats and splits, so every visual device comes from the stadium rather than
from a generic dashboard:

- **The track** (`components/track/track-oval.jsx`) is the signature element.
  Session credits are laps: each tick on the inside lane is one lap, the white
  line is the distance already run (used credits), and the infield shows what's
  left. Athletes see it full size; the coach sees a small one on every athlete's card.
- **Race bibs** (`bib.jsx`): every athlete wears a bib number, derived from their
  id so it never changes. The coach picks an athlete by bib in *Fuel*.
- **Heats** are sessions, shown as a start list grouped by day with the gun time in
  mono. Open heats are green, taken ones black.
- **The yellow flag** marks anything waiting on someone: athletes waiting to be
  admitted, bookings waiting for approval, and an athlete's own "waiting at the
  start" screen.
- **Photo finish** is where the meal photos athletes send in show up. Hover a row
  to see the shot on a finish-line frame.
- **The announcer** (`announcer.jsx`) is a scoreboard strip at the foot of the
  screen that replaces the browser `alert()` pop-ups the app used before.
- **Lane lines** are the page's dividers: under the header, on the entry pages, and
  between sections.

**Palette**: defined once in `tailwind.config.js`. Each colour has one job:

| Token | Hex | Role |
| --- | --- | --- |
| `chalk` | `#F4F1EA` | page ground |
| `tartan` | `#C9472E` | the track: primary actions and the signature |
| `infield` | `#2E6A48` | go: approved, open, done |
| `flag` | `#F2C230` | the yellow flag: waiting on someone |
| `ink` | `#16181B` | type, bib numbers, the header board |
| `cinder` | `#6B6660` | secondary text |
| `lane` | `#FFFFFF` | lane lines, bib paper, cards |

Destructive actions (turn away, remove, decline) are plain ink text links. They
never get a colour of their own, so red stays the track's.

**Type**: three roles. *Anton* for headlines and bib numbers, *Barlow* for
reading, and *Chivo Mono* for anything timed (gun times, dates, labels). All are
self-hosted through `@fontsource`.

**Motion**: the laps run in along the track, the entry headline slides in word by
word, bibs tilt under the pointer, and the photo-finish preview trails the cursor.
Under `prefers-reduced-motion` everything appears in place.

## Reused from component-lab

| Component | Used for |
| --- | --- |
| `be-ui-tilt-card.tsx` | `ui/tilt-card.jsx`: the athlete cards on the coach's roster (tilt reduced to 6°, white glare, square corners) |
| `project-showcase.tsx` | `ui/photo-finish.jsx`: the photo list with the cursor-trailing preview; rows are meal photos, with a thumbnail per row on touch screens |
| `text-effect.tsx` | `ui/text-effect.jsx`: the "On your marks." / "Get set." headlines |

Hand-built for this design instead: the track, bibs, start lists, announcer,
booking calendar skin and every page layout. Considered and rejected: the
`stats-card` family (bar charts would read as a dashboard, and the track already
shows the one number that matters) and `be-ui-otp-input` (the API has no code
verification to feed it).

## Notes

- `npm run build` used to run `tsc -b` first, which failed because there are no
  TypeScript sources. It now runs `vite build` only.
- The ESLint config only matches `*.ts`/`*.tsx`, so `npm run lint` checks nothing
  in this JavaScript project. That's left as it was.
