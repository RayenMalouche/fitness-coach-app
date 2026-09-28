// From component-lab `project-showcase.tsx` (21st.dev). Kept: the row list with
// the hover underline and slide-in arrow, and the preview image that trails the
// cursor on a lerp. Changed: rows are meal photos (athlete, caption, time)
// rather than projects; the preview is square-cornered with a finish-line
// timestamp; on touch screens, where there is no cursor to follow, each row
// shows its own thumbnail instead; and there is a delete action per row.
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { Bib } from '../track/bib'
import { cn } from '../../lib/cn'
import { clock, day } from '../../lib/format'

export function PhotoFinish({ photos, srcFor, onDelete }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const lerp = (start, end, factor) => start + (end - start) * factor
    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.15),
        y: lerp(prev.y, mousePosition.y, 0.15),
      }))
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [mousePosition])

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <section ref={containerRef} onMouseMove={handleMouseMove} className="relative">
      {/* Cursor-following preview (pointer devices only) */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-40 hidden overflow-hidden shadow-2xl [@media(hover:hover)]:block"
        style={{
          transform: `translate3d(${smoothPosition.x + 24}px, ${smoothPosition.y - 120}px, 0)`,
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.85,
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        aria-hidden
      >
        <div className="relative h-[200px] w-[300px] bg-ink">
          {photos.map((photo, index) => (
            <img
              key={photo.id}
              src={srcFor(photo)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out"
              style={{
                opacity: hoveredIndex === index ? 1 : 0,
                scale: hoveredIndex === index ? 1 : 1.1,
                filter: hoveredIndex === index ? 'none' : 'blur(10px)',
              }}
            />
          ))}
          {/* Finish-line timing strip */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/80 px-3 py-1.5 font-mono text-[0.7rem] text-lane">
            <span>PHOTO FINISH</span>
            <span>{hoveredIndex != null && photos[hoveredIndex] ? clock(photos[hoveredIndex].sentAt) : ''}</span>
          </div>
          <div className="absolute inset-y-0 left-1/2 w-px bg-tartan/80" />
        </div>
      </div>

      <ul>
        {photos.map((photo, index) => (
          <li
            key={photo.id}
            className="group relative border-t-2 border-ink/10 last:border-b-2"
            onMouseEnter={() => {
              setHoveredIndex(index)
              setIsVisible(true)
            }}
            onMouseLeave={() => {
              setHoveredIndex(null)
              setIsVisible(false)
            }}
          >
            <div
              className={cn(
                'absolute inset-0 -mx-3 bg-lane transition-all duration-300 ease-out',
                hoveredIndex === index ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
              )}
            />
            <div className="relative flex items-center gap-4 py-4">
              <img
                src={srcFor(photo)}
                alt={photo.caption ? `Meal: ${photo.caption}` : `Meal photo from ${photo.client?.name ?? 'athlete'}`}
                className="h-16 w-16 shrink-0 object-cover [@media(hover:hover)]:hidden"
              />
              <Bib id={photo.client?.id ?? photo.clientId} size="sm" className="hidden [@media(hover:hover)]:flex" />
              <a href={srcFor(photo)} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-2">
                  <span className="relative text-lg font-semibold">
                    {photo.client?.name ?? 'Athlete'}
                    <span
                      className={cn(
                        'absolute -bottom-0.5 left-0 h-0.5 bg-tartan transition-all duration-300 ease-out',
                        hoveredIndex === index ? 'w-full' : 'w-0',
                      )}
                    />
                  </span>
                  <ArrowUpRight
                    className={cn(
                      'h-4 w-4 text-cinder transition-all duration-300 ease-out',
                      hoveredIndex === index ? 'translate-x-0 translate-y-0 opacity-100' : '-translate-x-2 translate-y-2 opacity-0',
                    )}
                    aria-hidden
                  />
                </span>
                <span className="mt-0.5 block truncate text-cinder">{photo.caption || 'No caption'}</span>
              </a>
              <span className="hidden text-right font-mono text-xs tabular-nums text-cinder sm:block">
                {day(photo.sentAt)}
                <br />
                {clock(photo.sentAt)}
              </span>
              {onDelete && (
                <button type="button" onClick={() => onDelete(photo)} className="act-dq relative shrink-0">
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
