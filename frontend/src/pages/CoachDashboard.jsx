// Coach — the four sections of the meet, each on its own lane-numbered tab.
// The tab counts show what is waiting on the coach.

import { useCallback, useEffect, useState } from 'react'

import ClientList from '../components/ClientList'
import MealManagement from '../components/MealManagement'
import PhotoGallery from '../components/PhotoGallery'
import SessionManagement from '../components/SessionManagement'
import { AppShell } from '../components/track/app-shell'
import { useAuth } from '../context/AuthContext'
import { clientAPI, sessionAPI } from '../services/api'

export default function CoachDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('clients')
  const [waiting, setWaiting] = useState({ clients: 0, sessions: 0 })

  const loadWaiting = useCallback(async () => {
    try {
      const [clientsRes, bookingsRes] = await Promise.all([clientAPI.getAll(), sessionAPI.getPendingBookings()])
      setWaiting({
        clients: clientsRes.data.clients.filter((c) => !c.approved).length,
        sessions: bookingsRes.data.bookings.length,
      })
    } catch (error) {
      console.error('Failed to load pending counts:', error)
    }
  }, [])

  useEffect(() => {
    loadWaiting()
  }, [loadWaiting])

  const tabs = [
    { id: 'clients', name: 'Athletes', count: waiting.clients },
    { id: 'sessions', name: 'Heats', count: waiting.sessions },
    { id: 'meals', name: 'Fuel' },
    { id: 'photos', name: 'Photo finish' },
  ]

  return (
    <AppShell eyebrow="Coach's box" title="The meet" user={user} onLeave={logout} tabs={tabs} activeTab={activeTab} onTab={setActiveTab}>
      {activeTab === 'clients' && <ClientList onChange={loadWaiting} />}
      {activeTab === 'sessions' && <SessionManagement onChange={loadWaiting} />}
      {activeTab === 'meals' && <MealManagement />}
      {activeTab === 'photos' && <PhotoGallery />}
    </AppShell>
  )
}
