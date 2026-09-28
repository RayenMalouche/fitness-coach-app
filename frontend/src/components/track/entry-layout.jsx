// Login and registration share one layout: the lane block with the meet's
// headline on one side, the form (the entry desk) on the other.
import { TextEffect } from '../ui/text-effect'

export function EntryLayout({ headline, sub, children, aside }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[5fr_6fr]">
      <section className="lanes relative flex flex-col justify-between overflow-hidden px-6 py-8 text-lane sm:px-10 sm:py-12">
        <p className="relative inline-block self-start bg-ink px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em]">Fitness Coach · Track</p>
        <div className="relative py-10 lg:py-0">
          <TextEffect as="h1" per="word" preset="slide" className="headline -ml-3 inline-block max-w-md bg-tartan px-3 pt-1 text-6xl sm:text-7xl lg:text-8xl">
            {headline}
          </TextEffect>
          <p className="-ml-3 mt-4 max-w-sm bg-tartan px-3 py-2 text-lg">{sub}</p>
        </div>
        <div className="relative hidden lg:block">{aside}</div>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </div>
  )
}

export function FormError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="flex items-stretch bg-lane text-sm">
      <span className="w-1.5 shrink-0 bg-tartan" aria-hidden />
      <span className="px-4 py-3">{children}</span>
    </p>
  )
}

export function Field({ id, label, hint, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="label mb-2 block !text-ink">
        {label}
      </label>
      <input id={id} className="field" {...props} />
      {hint && <p className="mt-1.5 text-sm text-cinder">{hint}</p>}
    </div>
  )
}
