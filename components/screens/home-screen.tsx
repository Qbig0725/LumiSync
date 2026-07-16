'use client'

import { useEffect, useState } from 'react'
import { Check, Leaf, Moon, Sun, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { completedMinutesToday, plannedMinutes, type LightTask } from '@/lib/lumi-data'

type ModeId = 'focus' | 'relax' | 'sleep'

const modes = [
  { id: 'focus' as const, label: 'Focus', load: 'high' as const, icon: Zap, color: 'var(--primary)' },
  { id: 'relax' as const, label: 'Relax', load: 'med' as const, icon: Leaf, color: 'var(--accent)' },
  { id: 'sleep' as const, label: 'Sleep', load: 'low' as const, icon: Moon, color: 'var(--destructive)' },
]

function brightnessHint(value: number) {
  if (value < 20) return 'SCN-protective level for late evening.'
  if (value < 50) return 'Gentle ambient light for winding down.'
  if (value < 80) return 'Balanced brightness for daily activity.'
  return 'Bright light supports alertness and focus.'
}

function formatMinutes(value: number) { const hours = Math.floor(value / 60); const minutes = Math.floor(value % 60); return `${hours}h ${String(minutes).padStart(2, '0')}m` }

export function HomeScreen({ name, tasks, brightness, onBrightnessChange, missionClaimedDate, onClaimMission }: { name: string; tasks: LightTask[]; brightness: number; onBrightnessChange: (brightness: number) => void; missionClaimedDate?: string; onClaimMission: () => void }) {
  const [mode, setMode] = useState<ModeId>('focus')
  const [missionMessage, setMissionMessage] = useState('')
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer) }, [])
  const selectedMode = modes.find((item) => item.id === mode) ?? modes[0]
  const wavelengthTasks = tasks.filter((task) => task.load === selectedMode.load)
  const completed = completedMinutesToday(wavelengthTasks, now)
  const planned = plannedMinutes(wavelengthTasks)
  const percentage = planned ? Math.min(100, Math.round((completed / planned) * 100)) : 0
  const circumference = 2 * Math.PI * 92
  const dashOffset = circumference * (1 - percentage / 100)
  const hour = now.getHours()
  const greeting = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : hour < 22 ? 'Good evening' : 'Good night'
  const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(now)
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const claimed = missionClaimedDate === todayKey
  const missionReady = brightness <= 20

  function claimMission() {
    if (claimed) { setMissionMessage('Today’s reward has already been claimed.'); return }
    if (!missionReady) { setMissionMessage('Set brightness to 20% or lower to complete this mission.'); return }
    onClaimMission()
    setMissionMessage('Mission complete! +10 Lumens added.')
  }

  return (
    <section className="flex flex-col gap-6" aria-labelledby="home-title">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{dateLabel}</p>
        <h1 id="home-title" className="mt-1 text-balance text-2xl font-semibold tracking-tight">{greeting}, {name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your synced schedule updates your exposure in real time.</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative size-56">
          <svg className="size-full -rotate-90" viewBox="0 0 220 220" role="img" aria-label={`${selectedMode.label} light exposure ${percentage} percent`}>
            <defs><linearGradient id="gauge" x1="0" x2="1"><stop offset="0%" stopColor={selectedMode.color} /><stop offset="100%" stopColor={selectedMode.color} /></linearGradient></defs>
            <circle cx="110" cy="110" r="92" fill="none" stroke="var(--muted)" strokeWidth="10" />
            <circle cx="110" cy="110" r="92" fill="none" stroke="url(#gauge)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} className="transition-all duration-500 drop-shadow-[0_0_8px_var(--glow-primary)]" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Sun className="mb-2 size-5" style={{ color: selectedMode.color }} />
            <strong className="font-mono text-4xl font-medium tracking-tight">{percentage}%</strong>
            <span className="mt-1 text-xs text-muted-foreground">{selectedMode.label} wavelength</span>
          </div>
        </div>
        <p className="-mt-1 font-mono text-xs text-muted-foreground">{formatMinutes(completed)} of {formatMinutes(planned)} {selectedMode.label.toLowerCase()} wavelength</p>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-card p-1.5 ring-1 ring-border">
        {modes.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setMode(id)} className={cn('flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-medium transition-all', mode === id ? 'bg-primary text-primary-foreground shadow-[0_0_16px_var(--glow-primary)]' : 'text-muted-foreground hover:text-foreground')} aria-pressed={mode === id}><Icon className="size-4" />{label}</button>)}
      </div>

      <Card className="border-0 bg-card/70 py-5 ring-1 ring-border">
        <CardHeader className="px-5"><div className="flex items-end justify-between gap-3"><div><CardDescription className="text-xs uppercase tracking-[0.14em]">Smart lights</CardDescription><CardTitle className="mt-1">Brightness</CardTitle></div><output htmlFor="smart-light-brightness" className="font-mono text-2xl font-medium text-primary" aria-live="polite">{brightness}%</output></div></CardHeader>
        <CardContent className="flex flex-col gap-3 px-5"><input id="smart-light-brightness" aria-label="Smart light brightness" type="range" value={brightness} onChange={(event) => onBrightnessChange(Number(event.target.value))} min="0" max="100" step="1" className="native-lumi-slider" /><p className="text-xs leading-relaxed text-muted-foreground">{brightnessHint(brightness)}</p></CardContent>
      </Card>

      <Card className="border-0 bg-card py-5 ring-1 ring-border">
        <CardHeader className="px-5"><CardDescription className="text-xs uppercase tracking-[0.14em] text-accent">Live mission</CardDescription><CardTitle className="max-w-xs text-pretty text-base">Dim screen below 20% for SCN protection</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between gap-4 px-5"><div><p className="text-xs leading-relaxed text-muted-foreground">Reduce brightness to 20% or below before claiming today&apos;s reward.</p>{missionMessage && <p className="mt-1 text-[11px] text-primary" aria-live="polite">{missionMessage}</p>}</div><Button size="sm" variant="outline" onClick={claimMission} disabled={claimed} className="shrink-0 font-mono">{claimed ? <><Check data-icon="inline-start" /> Claimed</> : '+10 Lumens'}</Button></CardContent>
      </Card>
    </section>
  )
}
