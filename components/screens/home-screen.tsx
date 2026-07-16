'use client'

import { useEffect, useState } from 'react'
import { Leaf, Moon, Sun, Zap } from 'lucide-react'
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

const dailyMissions = [
  ['Early Bird', 'Open the app within 15 minutes of your target wake time.'], ['Start Photosynthesis', 'Before 8 AM, keep screen brightness at 80% or higher for 10 minutes.'],
  ['Morning Alertness', 'Use Focus mode for at least 30 minutes during the morning.'], ['Wake-up Challenge', 'Wake within 10 minutes of your target wake time.'], ['Morning Briefing', 'Open the Stats tab after waking and check yesterday’s sleep record.'],
  ['Full Focus', 'Complete one High-focus schedule block.'], ['Deep Work', 'Keep Focus mode active for two consecutive hours.'], ['Afternoon Sunlight', 'Reach 15 minutes of maximum-brightness exposure between noon and 2 PM.'],
  ['Cognitive Switch', 'Place and complete one Low-rest block immediately after a High block.'], ['Scheduler', 'Register at least three schedule blocks for today.'], ['50% Light Intake', 'Fill half of the daily light intake gauge before 3 PM.'],
  ['Stay on Track', 'Keep light synchronization on throughout the daytime.'], ['Blue Light Defense', 'After 9 PM, lower screen brightness to 30% or below.'], ['Digital Sunset', 'Switch to Relax mode at 10 PM.'],
  ['Rest Your Eyes', 'Complete a Low-rest block of 20 minutes or more during the evening.'], ['Night Guardian', 'Keep Focus mode use at zero minutes after 10 PM.'], ['Amber Light Warm-up', 'Set lighting to 3000K or lower from two hours before sleep.'],
  ['Dark Mode Adaptation', 'Turn on your phone’s system dark mode after 8 PM.'], ['Perfect Lights Out', 'Turn on Sleep mode 10 minutes before your target sleep time.'], ['Sleep Ritual', 'Keep smartphone screen-on time below five minutes in the 30 minutes before bed.'],
  ['No Phone in Bed', 'Keep brightness at 10% or lower for one hour after 11 PM.'], ['On-time Finish', 'Finish all app schedules at your target sleep time.'], ['Plan Ahead', 'Set at least three schedule blocks for tomorrow tonight.'],
  ['Point Flex', 'Visit the Lumen Store and browse a theme or report.'], ['Break the Streak', 'Complete at least one daily mission for three consecutive days.'], ['Perfect Day', 'Reach 100% schedule adherence today.'],
  ['Lumen Hunter', 'Earn at least 150 L from schedule completion rewards today.'], ['Circadian Rhythm Master', 'Balance blue-light daytime and red-light nighttime exposure in today’s stats.'], ['Theme Changer', 'Apply a different unlocked cosmic theme in the store.'], ['Self Feedback', 'Open Weekly stats and review your goal completion rate.'],
] as const

function missionsForDate(date: Date) {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  let seed = [...key].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0)
  const first = seed % dailyMissions.length
  seed = (seed * 1664525 + 1013904223) >>> 0
  let second = seed % dailyMissions.length
  if (second === first) second = (second + 1) % dailyMissions.length
  return [dailyMissions[first], dailyMissions[second]]
}

export function HomeScreen({ name, tasks, brightness, onBrightnessChange }: { name: string; tasks: LightTask[]; brightness: number; onBrightnessChange: (brightness: number) => void }) {
  const [mode, setMode] = useState<ModeId>('focus')
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
  const todayMissions = missionsForDate(now)

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

      <div className="flex flex-col gap-3"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Daily missions</p><p className="mt-1 text-xs text-muted-foreground">Two fresh missions are selected each day.</p></div>{todayMissions.map(([title, description]) => <Card key={title} className="border-0 bg-card py-4 ring-1 ring-border"><CardHeader className="px-5"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="px-5"><p className="text-xs leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}</div>
    </section>
  )
}
