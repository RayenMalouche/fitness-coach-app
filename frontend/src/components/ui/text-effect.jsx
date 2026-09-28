// From component-lab `text-effect.tsx` (21st.dev). Ported to JSX; adds a
// "write" preset (each letter inks in, as if handwritten) and honours reduced motion.
import { memo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { cn } from '../../lib/cn'

const defaultStaggerTimes = { char: 0.03, word: 0.05, line: 0.1 }

const defaultContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
}

const presetVariants = {
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(12px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(12px)' },
    },
  },
  fade: {
    container: defaultContainerVariants,
    item: { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } },
  },
  slide: {
    container: defaultContainerVariants,
    item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 } },
  },
  write: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 2, filter: 'blur(1.5px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.18 } },
      exit: { opacity: 0 },
    },
  },
}

const Segment = memo(function Segment({ segment, variants, per }) {
  if (per === 'line') {
    return (
      <motion.span variants={variants} className="block">
        {segment}
      </motion.span>
    )
  }
  if (per === 'word') {
    return (
      <motion.span aria-hidden="true" variants={variants} className="inline-block whitespace-pre">
        {segment}
      </motion.span>
    )
  }
  return (
    <span className="inline-block whitespace-pre">
      {segment.split('').map((char, i) => (
        <motion.span key={i} aria-hidden="true" variants={variants} className="inline-block whitespace-pre">
          {char}
        </motion.span>
      ))}
    </span>
  )
})

export function TextEffect({ children, per = 'word', as = 'p', className, preset = 'fade', delay = 0, trigger = true }) {
  const reduceMotion = useReducedMotion()
  const Tag = as

  if (reduceMotion) return <Tag className={cn('whitespace-pre-wrap', className)}>{children}</Tag>

  // Per-char still splits on words first, so a word never breaks across lines.
  const segments = per === 'line' ? children.split('\n') : children.split(/(\s+)/)
  const MotionTag = motion[as]
  const { container, item } = presetVariants[preset]
  const stagger = defaultStaggerTimes[per]

  const delayed = {
    ...container,
    visible: {
      ...container.visible,
      transition: { ...container.visible.transition, staggerChildren: stagger, delayChildren: delay },
    },
  }

  return (
    <AnimatePresence mode="popLayout">
      {trigger && (
        <MotionTag
          initial="hidden"
          animate="visible"
          exit="exit"
          aria-label={per === 'line' ? undefined : children}
          variants={delayed}
          className={cn('whitespace-pre-wrap', className)}
        >
          {segments.map((segment, index) => (
            <Segment key={`${per}-${index}-${segment}`} segment={segment} variants={item} per={per} />
          ))}
        </MotionTag>
      )}
    </AnimatePresence>
  )
}
