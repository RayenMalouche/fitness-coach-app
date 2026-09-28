// Photo finish: every meal photo athletes send in, newest first, filterable by
// athlete. Hover a row to see the shot.

import { useEffect, useState } from 'react'

import { useAnnouncer } from './track/announcer'
import { Loading, SectionHead } from './track/app-shell'
import { PhotoFinish } from './ui/photo-finish'
import { clientAPI, photoAPI } from '../services/api'
import { cn } from '../lib/cn'
import { API_ORIGIN, errorText } from '../lib/format'

export default function PhotoGallery() {
  const announce = useAnnouncer()
  const [photos, setPhotos] = useState([])
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    clientAPI
      .getAll()
      .then((response) => setClients(response.data.clients.filter((c) => c.approved)))
      .catch((error) => console.error('Failed to load clients:', error))
      .finally(() => setLoading(false))
  }, [])

  const loadPhotos = async (who = selectedClient) => {
    try {
      const response = who === 'all' ? await photoAPI.getAllPhotos() : await photoAPI.getClientPhotos(who)
      setPhotos(response.data.photos.slice().sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)))
    } catch (error) {
      console.error('Failed to load photos:', error)
    }
  }

  useEffect(() => {
    loadPhotos(selectedClient)
  }, [selectedClient])

  const handleDeletePhoto = async (photo) => {
    if (!confirm('Remove this photo?')) return
    try {
      await photoAPI.delete(photo.id)
      announce('Photo removed', 'flag')
      await loadPhotos()
    } catch (error) {
      announce(errorText(error, 'Could not remove photo'), 'stop')
    }
  }

  if (loading) return <Loading label="Developing the photo finish…" />

  const chip = (value, label) => (
    <button
      key={value}
      type="button"
      onClick={() => setSelectedClient(value)}
      aria-pressed={selectedClient === value}
      className={cn(
        'border-2 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors',
        selectedClient === value ? 'border-ink bg-ink text-lane' : 'border-ink/15 hover:border-ink',
      )}
    >
      {label}
    </button>
  )

  return (
    <section>
      <SectionHead kicker="What athletes ate" title={`Photo finish · ${photos.length}`} />
      <div className="mb-6 flex flex-wrap gap-2">{[chip('all', 'Everyone'), ...clients.map((c) => chip(c.id, c.name))]}</div>
      {photos.length === 0 ? (
        <p className="border-2 border-dashed border-ink/15 px-6 py-10 text-center text-cinder">No photos across the line yet.</p>
      ) : (
        <PhotoFinish photos={photos} srcFor={(p) => `${API_ORIGIN}${p.imageUrl}`} onDelete={handleDeletePhoto} />
      )}
    </section>
  )
}
