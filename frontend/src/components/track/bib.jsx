// A race bib: every athlete (client) wears one. The number is derived from
// their id so it never changes.
import { cn } from '../../lib/cn'
import { bibNumber } from '../../lib/format'

export function Bib({ id, name, className, size = 'md' }) {
  const pin = 'absolute h-2 w-2 rounded-full border border-ink/25 bg-chalk'
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center bg-lane text-ink shadow-[0_1px_0_rgba(22,24,27,0.08),0_6px_16px_-10px_rgba(22,24,27,0.45)]',
        size === 'sm' ? 'h-14 w-16 pt-1.5' : 'h-24 w-28 pt-2',
        className,
      )}
      aria-label={`Bib ${bibNumber(id)}${name ? `, ${name}` : ''}`}
    >
      <span className="absolute inset-x-0 top-0 h-1.5 bg-tartan" aria-hidden />
      <span className={cn(pin, 'left-1.5 top-3')} aria-hidden />
      <span className={cn(pin, 'right-1.5 top-3')} aria-hidden />
      <span className={cn(pin, 'bottom-1.5 left-1.5')} aria-hidden />
      <span className={cn(pin, 'bottom-1.5 right-1.5')} aria-hidden />
      <span className={cn('font-display leading-none', size === 'sm' ? 'text-2xl' : 'text-5xl')} aria-hidden>
        {bibNumber(id)}
      </span>
      {size !== 'sm' && name && (
        <span className="mt-1 max-w-[90%] truncate font-mono text-[0.6rem] uppercase tracking-[0.12em] text-cinder" aria-hidden>
          {name.split(' ')[0]}
        </span>
      )}
    </div>
  )
}
