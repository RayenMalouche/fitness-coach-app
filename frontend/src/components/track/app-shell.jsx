// The stadium frame around every signed-in page: the board at the top with the
// meet name and who's signed in, the lane strip, and the lane-numbered tabs.
import { LogOut } from 'lucide-react'

import { cn } from '../../lib/cn'

export function AppShell({ eyebrow, title, user, onLeave, tabs, activeTab, onTab, children }) {
  return (
    <div className="min-h-screen">
      <header className="bg-ink text-lane">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 pb-5 pt-6 sm:px-6">
          <div>
            <p className="label !text-lane/60">{eyebrow}</p>
            <h1 className="headline mt-1 text-4xl sm:text-5xl">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-right text-sm leading-tight">
              <span className="block text-lane/60">Signed in</span>
              {user?.name}
            </p>
            <button type="button" onClick={onLeave} className="inline-flex items-center gap-2 border-2 border-lane/25 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] hover:border-lane">
              <LogOut className="h-4 w-4" aria-hidden />
              Leave
            </button>
          </div>
        </div>
      </header>
      <div className="lanes h-[34px]" aria-hidden />

      {tabs && (
        <nav className="border-b-2 border-ink/10 bg-chalk" aria-label="Sections">
          <div role="tablist" className="mx-auto flex max-w-6xl overflow-x-auto px-4 sm:px-6">
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => onTab(tab.id)}
                className={cn(
                  'group flex shrink-0 items-baseline gap-1.5 border-b-4 px-2 py-3 transition-colors sm:gap-2 sm:px-4',
                  activeTab === tab.id ? 'border-tartan text-ink' : 'border-transparent text-cinder hover:text-ink',
                )}
              >
                <span className="font-display text-2xl leading-none">{i + 1}</span>
                <span className="font-mono text-xs uppercase tracking-[0.12em]">{tab.name}</span>
                {tab.count > 0 && <span className="bg-flag px-1.5 font-mono text-[0.65rem] text-ink">{tab.count}</span>}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  )
}

export function Loading({ label = 'On your marks…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4" role="status">
      <div className="h-2 w-40 overflow-hidden bg-ink/10">
        <div className="h-full w-1/3 animate-[run_1.1s_ease-in-out_infinite] bg-tartan" />
      </div>
      <p className="label">{label}</p>
      <style>{'@keyframes run { 0% { transform: translateX(-100%) } 100% { transform: translateX(300%) } }'}</style>
    </div>
  )
}

export function SectionHead({ kicker, title, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker && <p className="label">{kicker}</p>}
        <h2 className="headline mt-1 text-3xl">{title}</h2>
      </div>
      {children}
    </div>
  )
}
