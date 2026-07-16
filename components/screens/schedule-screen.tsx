'use client'

import { useState } from 'react'
import { Check, ChevronDown, List, Plus, Rows3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { currentWeekDay, weekDays, type LightTask, type Load, type WeeklySchedule } from '@/lib/lumi-data'

type ScheduledTask = LightTask & { isOverlapping: boolean }

const loadData = {
  high: { label: 'High', border: 'border-l-primary', text: 'text-primary', hint: 'Cool, bright light · 6,500 K' },
  med: { label: 'Med', border: 'border-l-chart-4', text: 'text-chart-4', hint: 'Balanced daylight · 4,500 K' },
  low: { label: 'Low', border: 'border-l-accent', text: 'text-accent', hint: 'Warm, gentle light · 3,200 K' },
}

function timeLabel(time: string) {
  const [hour, minute] = time.split(':').map(Number)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${suffix}`
}

export function ScheduleScreen({ weeklyTasks, onScheduleChange }: { weeklyTasks: WeeklySchedule; onScheduleChange: (schedule: WeeklySchedule) => void }) {
  const [view, setView] = useState<'list' | 'timeline'>('list')
  const [selectedDay, setSelectedDay] = useState(currentWeekDay)
  const tasks = weeklyTasks[selectedDay]
  const onTasksChange = (nextTasks: LightTask[]) => onScheduleChange({ ...weeklyTasks, [selectedDay]: nextTasks })
  const updateTask = (id: string, patch: Partial<LightTask>) => onTasksChange(tasks.map((task) => task.id === id ? { ...task, ...patch } : task))
  const scheduledTasks: ScheduledTask[] = [...tasks]
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((task, index, sorted) => ({
      ...task,
      isOverlapping: index > 0 && task.start < sorted[index - 1].end,
    }))

  function addTask() {
    const id = `task-${Date.now()}`
    onTasksChange([...tasks, { id, start: '20:30', end: '21:00', title: 'New light block', load: 'med', expanded: true, synced: false, done: false }])
  }

  return <section className="flex flex-col gap-5" aria-labelledby="schedule-title">
    <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Light plan</p><h1 id="schedule-title" className="mt-1 text-2xl font-semibold tracking-tight">Weekly schedule</h1><p className="mt-1 text-xs text-muted-foreground">Set a separate light plan for every day.</p></div>
    <div className="grid grid-cols-7 gap-1 rounded-xl bg-card p-1 ring-1 ring-border">{weekDays.map((day) => <button key={day} onClick={() => setSelectedDay(day)} aria-pressed={selectedDay === day} className={cn('rounded-lg py-2 text-[10px] font-semibold', selectedDay === day ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>{day}</button>)}</div>
    <div className="grid grid-cols-2 rounded-xl bg-card p-1 ring-1 ring-border"><button onClick={() => setView('list')} aria-pressed={view === 'list'} className={cn('flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium', view === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground')}><List className="size-4" /> List View</button><button onClick={() => setView('timeline')} aria-pressed={view === 'timeline'} className={cn('flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium', view === 'timeline' ? 'bg-muted text-foreground' : 'text-muted-foreground')}><Rows3 className="size-4" /> Timeline View</button></div>

    {view === 'list' ? <div className="flex flex-col gap-3">{scheduledTasks.map((task) => {
      const load = loadData[task.load]
      return <Card key={task.id} className={cn('border-l-4 py-0 transition-all', task.isOverlapping ? 'border-destructive/50 bg-card ring-1 ring-destructive/50 shadow-[0_0_18px_color-mix(in_srgb,var(--destructive)_22%,transparent)]' : cn('border-y-0 border-r-0 ring-1 ring-border', load.border), task.done ? 'bg-muted/50 opacity-60' : 'bg-card')}>
        <button type="button" className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left" onClick={() => updateTask(task.id, { expanded: !task.expanded })} aria-expanded={task.expanded}>
          <div><p className="font-mono text-[11px] text-muted-foreground">{timeLabel(task.start)}–{timeLabel(task.end)}</p><CardTitle className="mt-1 text-sm">{task.title}</CardTitle><p className={cn('mt-1 text-[10px] font-medium uppercase tracking-wider', load.text)}>{load.label} focus</p>{task.isOverlapping && <p className="mt-1 text-[10px] font-semibold text-destructive" role="alert">⚠️ Time Overlap</p>}</div>
          <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>{task.done ? <span className="flex items-center gap-1 font-mono text-xs text-primary"><Check className="size-4" /> +50 L</span> : <Switch aria-label={`Sync lights for ${task.title}`} checked={task.synced} onCheckedChange={(checked) => updateTask(task.id, { synced: checked })} />}<ChevronDown className={cn('size-4 text-muted-foreground transition-transform', task.expanded && 'rotate-180')} /></div>
        </button>
        {task.expanded && <CardContent className="flex flex-col gap-4 border-t border-border px-4 py-4">
          <label className="flex flex-col gap-2 text-xs text-muted-foreground">Task name<input value={task.title} onChange={(event) => updateTask(task.id, { title: event.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="flex flex-col gap-2 text-xs text-muted-foreground">Start<input type="time" value={task.start} onChange={(event) => updateTask(task.id, { start: event.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground" /></label><label className="flex flex-col gap-2 text-xs text-muted-foreground">End<input type="time" value={task.end} onChange={(event) => updateTask(task.id, { end: event.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground" /></label></div>
          <fieldset><legend className="mb-2 text-xs text-muted-foreground">Cognitive load</legend><div className="grid grid-cols-3 gap-2">{(['high','med','low'] as Load[]).map((item) => <button type="button" key={item} onClick={() => updateTask(task.id, { load: item })} aria-pressed={task.load === item} className={cn('rounded-lg border px-2 py-2 text-xs font-medium', task.load === item ? cn('bg-muted', loadData[item].text, item === 'high' ? 'border-primary' : item === 'med' ? 'border-chart-4' : 'border-accent') : 'border-border text-muted-foreground')}>{loadData[item].label}</button>)}</div></fieldset>
          <p className="text-xs text-muted-foreground">Automation: {load.hint} · {task.synced ? 'Lights synced' : 'Manual control'}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => onTasksChange(tasks.filter((item) => item.id !== task.id))} className="self-start text-destructive"><Trash2 data-icon="inline-start" /> Remove Block</Button>
        </CardContent>}
      </Card>
    })}</div> : <Card className="border-0 bg-card py-5 ring-1 ring-border"><CardContent className="px-5"><div className="relative flex flex-col gap-6 border-l border-border pl-5">{scheduledTasks.map((task) => <div key={task.id} className="relative"><span className={cn('absolute -left-[1.55rem] top-1 size-2.5 rounded-full ring-4 ring-card', task.load === 'high' ? 'bg-primary' : task.load === 'med' ? 'bg-chart-4' : 'bg-accent')} /><p className="font-mono text-[11px] text-muted-foreground">{timeLabel(task.start)}–{timeLabel(task.end)}</p><p className="mt-1 text-sm font-medium">{task.title}</p><p className="mt-1 text-[10px] text-muted-foreground">{loadData[task.load].hint}</p></div>)}</div></CardContent></Card>}

    <div className="sticky bottom-24 flex justify-end"><Button onClick={addTask} className="rounded-full shadow-[0_0_20px_var(--glow-primary)]"><Plus data-icon="inline-start" /> Add Block</Button></div>
  </section>
}
