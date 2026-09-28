// Athlete — your laps on the track, booking the next heat, today's fuel, and
// your heats so far. Until the coach admits you, you wait at the start.

import { useCallback, useEffect, useState } from 'react'
import { Flag } from 'lucide-react'

import Calendar from '../components/Calendar'
import MealCard from '../components/MealCard'
import PhotoUpload from '../components/PhotoUpload'
import { AppShell, Loading, SectionHead } from '../components/track/app-shell'
import { Bib } from '../components/track/bib'
import { TrackOval } from '../components/track/track-oval'
import { useAuth } from '../context/AuthContext'
import { clientAPI, mealAPI, sessionAPI } from '../services/api'
import { clock, day } from '../lib/format'

const STATUS = {
  APPROVED: { label: 'On', swatch: 'bg-infield' },
  PENDING: { label: 'Awaiting coach', swatch: 'bg-flag' },
  REJECTED: { label: 'Declined', swatch: 'bg-ink' },
}

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const [credits, setCredits] = useState(null)
  const [todaysMeals, setTodaysMeals] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    try {
      const [creditsRes, mealsRes, bookingsRes] = await Promise.all([clientAPI.getMyCredits(), mealAPI.getTodaysMeals(), sessionAPI.getMyBookings()])
      setCredits(creditsRes.data)
      setTodaysMeals(mealsRes.data.meals)
      setMyBookings(bookingsRes.data.bookings)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.approved) loadDashboardData()
    else setLoading(false)
  }, [user, loadDashboardData])

  if (!user?.approved) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="lanes h-[34px]" aria-hidden />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center bg-flag">
              <Flag className="h-8 w-8" aria-hidden />
            </div>
            <p className="label mt-6">Yellow flag</p>
            <h1 className="headline mt-1 text-5xl">Waiting at the start</h1>
            <p className="mt-4 text-lg text-cinder">
              Your coach hasn’t admitted you to the start list yet. Once they do, you can book heats and see your meal plan.
            </p>
            <div className="mt-6 flex justify-center">
              <Bib id={user?.id} name={user?.name} />
            </div>
            <button type="button" onClick={logout} className="btn-ghost mt-8">
              Leave
            </button>
          </div>
        </div>
      </div>
    )
  }

  const total = credits?.totalCredits ?? 0
  const used = credits?.usedCredits ?? 0
  const left = credits?.remainingCredits ?? Math.max(0, total - used)
  const upcoming = myBookings
    .filter((b) => new Date(b.session.dateTime) >= new Date())
    .sort((a, b) => new Date(a.session.dateTime) - new Date(b.session.dateTime))
  const next = upcoming.find((b) => b.status === 'APPROVED')

  return (
    <AppShell eyebrow={`Bib · ${user?.name}`} title="Your track" user={user} onLeave={logout}>
      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-12">
          {/* Laps */}
          <section className="grid items-center gap-8 lg:grid-cols-[3fr_2fr]">
            <TrackOval total={total} used={used} className="w-full" />
            <div>
              <p className="label">Session credits</p>
              <p className="headline mt-1 text-6xl">
                {left} <span className="text-3xl text-cinder">laps left</span>
              </p>
              <p className="mt-3 text-lg">
                {used} of {total} run. Each approved session is one lap.
              </p>
              {next ? (
                <p className="mt-6 border-l-4 border-infield bg-lane px-4 py-3">
                  <span className="label block">Next heat</span>
                  <span className="font-display text-2xl uppercase">
                    {day(next.session.dateTime)} · {clock(next.session.dateTime)}
                  </span>
                </p>
              ) : (
                <p className="mt-6 text-cinder">No heat booked yet — pick one below.</p>
              )}
            </div>
          </section>

          <div className="lanes h-[22px]" aria-hidden />

          <div className="grid gap-10 lg:grid-cols-2">
            <section>
              <SectionHead kicker="Book" title="Next heat" />
              <div className="bg-lane p-5">
                <Calendar remainingCredits={left} onBookingComplete={loadDashboardData} />
              </div>
            </section>

            <div className="space-y-10">
              <section>
                <SectionHead kicker="Today" title="Fuel" />
                {todaysMeals.length === 0 ? (
                  <p className="border-2 border-dashed border-ink/15 px-6 py-8 text-center text-cinder">Nothing planned for today.</p>
                ) : (
                  <ul className="space-y-4">
                    {todaysMeals.map((meal) => (
                      <li key={meal.id}>
                        <MealCard meal={meal} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <SectionHead kicker="Log a meal" title="Send a photo" />
                <div className="bg-lane p-5">
                  <PhotoUpload />
                </div>
              </section>
            </div>
          </div>

          <section>
            <SectionHead kicker="Your results" title="Heats" />
            {myBookings.length === 0 ? (
              <p className="border-2 border-dashed border-ink/15 px-6 py-8 text-center text-cinder">No heats yet.</p>
            ) : (
              <ol className="divide-y divide-ink/10 border-y-2 border-ink bg-lane">
                {myBookings
                  .slice()
                  .sort((a, b) => new Date(b.session.dateTime) - new Date(a.session.dateTime))
                  .map((booking) => {
                    const status = STATUS[booking.status] ?? { label: booking.status, swatch: 'bg-cinder' }
                    return (
                      <li key={booking.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3">
                        <span className="min-w-[9rem] font-mono">{day(booking.session.dateTime)}</span>
                        <span className="font-mono text-lg tabular-nums">{clock(booking.session.dateTime)}</span>
                        <span className="ml-auto inline-flex items-center gap-2 text-sm font-semibold">
                          <span className={`h-2.5 w-2.5 ${status.swatch}`} aria-hidden />
                          {status.label}
                        </span>
                      </li>
                    )
                  })}
              </ol>
            )}
          </section>
        </div>
      )}
    </AppShell>
  )
}
