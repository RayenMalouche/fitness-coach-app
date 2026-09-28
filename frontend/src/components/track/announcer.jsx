// The stadium announcer: short messages on a scoreboard strip at the foot of the
// screen. Replaces the browser alert() pop-ups the app used to raise.
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { cn } from '../../lib/cn'

const AnnouncerContext = createContext(() => {})
const MotionDiv = motion.div

const TONES = { go: 'bg-infield', flag: 'bg-flag', stop: 'bg-tartan' }

export function AnnouncerProvider({ children }) {
  const reduceMotion = useReducedMotion()
  const [message, setMessage] = useState(null)
  const timer = useRef(null)

  const announce = useCallback((text, tone = 'go') => {
    clearTimeout(timer.current)
    setMessage({ text, tone, key: Date.now() })
    timer.current = setTimeout(() => setMessage(null), 4500)
  }, [])

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" aria-live="polite" role="status">
        <AnimatePresence>
          {message && (
            <MotionDiv
              key={message.key}
              initial={reduceMotion ? false : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="pointer-events-auto flex max-w-lg items-stretch bg-ink text-lane shadow-xl"
            >
              <span className={cn('w-2 shrink-0', TONES[message.tone])} aria-hidden />
              <p className="px-4 py-3 font-mono text-sm uppercase tracking-[0.08em]">{message.text}</p>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </AnnouncerContext.Provider>
  )
}

export const useAnnouncer = () => useContext(AnnouncerContext)
