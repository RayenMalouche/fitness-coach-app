// Formatting shared by the whole track.

export const API_ORIGIN = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

/** A stable three-digit race bib for a user id (UUIDs make poor bib numbers). */
export function bibNumber(id = '') {
  // FNV-1a, then a final avalanche so ids that differ by one character still
  // land on unrelated numbers.
  let h = 0x811c9dc5
  for (const ch of String(id)) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193)
  h ^= h >>> 16
  h = Math.imul(h, 0x45d9f3b)
  h ^= h >>> 16
  return String(100 + ((h >>> 0) % 900))
}

export const clock = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const day = (date) =>
  new Date(date).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })

export const dayLong = (date) =>
  new Date(date).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })

export const errorText = (error, fallback) => error?.response?.data?.error || fallback
