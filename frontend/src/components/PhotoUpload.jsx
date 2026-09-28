// Athletes log a meal by sending a photo to their coach.

import { useEffect, useState } from 'react'
import { Camera } from 'lucide-react'

import { useAnnouncer } from './track/announcer'
import { photoAPI } from '../services/api'
import { errorText } from '../lib/format'

export default function PhotoUpload() {
  const announce = useAnnouncer()
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return announce('That is not an image', 'stop')
    if (file.size > 5 * 1024 * 1024) return announce('Photos must be under 5 MB', 'stop')
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) return
    setLoading(true)
    // The coach is taken from the signed-in athlete on the server.
    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('caption', caption)
    try {
      await photoAPI.upload(formData)
      announce('Photo sent to your coach')
      setSelectedFile(null)
      setPreview(null)
      setCaption('')
    } catch (error) {
      announce(errorText(error, 'Could not send photo'), 'stop')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <label className="relative flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center overflow-hidden border-2 border-dashed border-ink/25 bg-chalk transition-colors hover:border-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-tartan">
        {preview ? (
          <img src={preview} alt="Meal to send" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <>
            <Camera className="h-8 w-8 text-cinder" aria-hidden />
            <span className="mt-2 font-semibold">Snap or choose a photo</span>
            <span className="text-sm text-cinder">PNG or JPG, up to 5 MB</span>
          </>
        )}
        <input type="file" accept="image/*" onChange={handleFileSelect} className="sr-only" />
      </label>

      {selectedFile && (
        <>
          <label className="block">
            <span className="label mb-2 block !text-ink">Note for your coach (optional)</span>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} className="field" placeholder="Post-run lunch, a bit bigger than planned…" />
          </label>
          <div className="flex items-center gap-4">
            <button type="submit" disabled={loading} className="btn-go flex-1">
              {loading ? 'Sending…' : 'Send photo'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null)
                setPreview(null)
              }}
              className="act-dq"
            >
              Discard
            </button>
          </div>
        </>
      )}
    </form>
  )
}
