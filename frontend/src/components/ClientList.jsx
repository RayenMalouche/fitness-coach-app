// The roster: athletes waiting to be admitted, then everyone on the start list
// wearing their bib, with their laps (session credits) on a small track.

import { useEffect, useState } from 'react'

import { useAnnouncer } from './track/announcer'
import { Loading, SectionHead } from './track/app-shell'
import { Bib } from './track/bib'
import { TrackOval } from './track/track-oval'
import { TiltCard } from './ui/tilt-card'
import { clientAPI } from '../services/api'
import { day, errorText } from '../lib/format'

export default function ClientList({ onChange }) {
  const announce = useAnnouncer()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creditAmount, setCreditAmount] = useState('')

  const loadClients = async () => {
    try {
      const response = await clientAPI.getAll()
      setClients(response.data.clients)
    } catch (error) {
      console.error('Failed to load clients:', error)
      announce('Could not load the roster', 'stop')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const refresh = async () => {
    await loadClients()
    onChange?.()
  }

  const handleApprove = async (client) => {
    try {
      await clientAPI.approve(client.id)
      announce(`${client.name} is on the start list`)
      await refresh()
    } catch (error) {
      announce(errorText(error, 'Could not admit athlete'), 'stop')
    }
  }

  const handleReject = async (client) => {
    if (!confirm(`Turn away ${client.name}? This deletes their account.`)) return
    try {
      await clientAPI.reject(client.id)
      announce(`${client.name} turned away`, 'flag')
      await refresh()
    } catch (error) {
      announce(errorText(error, 'Could not turn athlete away'), 'stop')
    }
  }

  const handleUpdateCredits = async (e) => {
    e.preventDefault()
    if (!editing || creditAmount === '') return
    try {
      await clientAPI.updateCredits(editing.id, parseInt(creditAmount, 10))
      announce(`${editing.name}: ${creditAmount} laps`)
      setEditing(null)
      setCreditAmount('')
      await refresh()
    } catch (error) {
      announce(errorText(error, 'Could not update laps'), 'stop')
    }
  }

  if (loading) return <Loading label="Calling the roster…" />

  const pendingClients = clients.filter((c) => !c.approved)
  const approvedClients = clients.filter((c) => c.approved)

  return (
    <div className="space-y-12">
      {pendingClients.length > 0 && (
        <section>
          <SectionHead kicker="Yellow flag" title={`Awaiting the starter · ${pendingClients.length}`} />
          <ul className="divide-y-2 divide-ink/10 border-y-2 border-ink/10 bg-lane">
            {pendingClients.map((client) => (
              <li key={client.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-4">
                <span className="h-10 w-1.5 bg-flag" aria-hidden />
                <div className="min-w-[12rem] flex-1">
                  <p className="text-lg font-semibold">{client.name}</p>
                  <p className="truncate text-sm text-cinder">
                    {client.email} · registered {day(client.createdAt)}
                  </p>
                </div>
                <div className="flex gap-5">
                  <button type="button" onClick={() => handleApprove(client)} className="act-go">
                    Admit
                  </button>
                  <button type="button" onClick={() => handleReject(client)} className="act-dq">
                    Turn away
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionHead kicker="Start list" title={`Athletes · ${approvedClients.length}`} />
        {approvedClients.length === 0 ? (
          <p className="border-2 border-dashed border-ink/15 px-6 py-10 text-center text-cinder">
            Nobody on the start list yet. Admit an athlete above once they register.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {approvedClients.map((client) => {
              const total = client.sessionCredits?.totalCredits ?? 0
              const used = client.sessionCredits?.usedCredits ?? 0
              const isEditing = editing?.id === client.id
              return (
                <li key={client.id}>
                  <TiltCard max={6} className="h-full bg-lane p-5 shadow-[0_1px_0_rgba(22,24,27,0.06)]">
                    <div className="flex items-start gap-4">
                      <Bib id={client.id} name={client.name} />
                      <div className="min-w-0 pt-1">
                        <p className="text-xl font-semibold leading-tight">{client.name}</p>
                        <p className="mt-1 truncate text-sm text-cinder">{client.email}</p>
                      </div>
                    </div>
                    <TrackOval total={total} used={used} size="sm" className="mt-5 w-full" />
                    {isEditing ? (
                      <form onSubmit={handleUpdateCredits} className="mt-4 flex items-end gap-3">
                        <label className="flex-1">
                          <span className="label mb-1 block">Total laps</span>
                          <input
                            type="number"
                            min={used}
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(e.target.value)}
                            className="field py-2"
                            autoFocus
                            required
                          />
                        </label>
                        <button type="submit" className="btn-go px-4 py-2 text-base">
                          Save
                        </button>
                        <button type="button" onClick={() => setEditing(null)} className="act-dq pb-3">
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-mono text-xs text-cinder">
                          {used} run · {Math.max(0, total - used)} left
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(client)
                            setCreditAmount(String(total))
                          }}
                          className="act-go"
                        >
                          Set laps
                        </button>
                      </div>
                    )}
                  </TiltCard>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
