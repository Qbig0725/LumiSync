'use client'

import { useEffect, useMemo, useState } from 'react'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { completedMinutesToday, minutesAt, plannedMinutes, type LightTask } from '@/lib/lumi-data'
import { Button } from '@/components/ui/button'

type Period = 'Daily' | 'Weekly' | 'Monthly'
type RewardPeriod = 'daily' | 'weekly' | 'monthly'
const labels = ['6a', '', '', '9a', '', '', '12p', '', '', '3p', '', '', '6p', '', '', '9p', '', '11p']

function formatMinutes(value: number) {
  return `${Math.floor(value / 60)}h ${String(Math.floor(value % 60)).padStart(2, '0')}m`
}

function rewardKey(period: RewardPeriod, date: Date) {
  if (period === 'daily') return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  if (period === 'monthly') return `${date.getFullYear()}-${date.getMonth() + 1}`
  const start = new Date(date.getFullYear(), 0, 1)
  const week = Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
  return `${date.getFullYear()}-W${week}`
}

export function StatsScreen({ tasks, firstSeen, rewardClaims, onClaimReward }: { tasks: LightTask[]; firstSeen: string; rewardClaims: { daily?: string; weekly?: string; monthly?: string }; onClaimReward: (period: RewardPeriod, key: string, amount: number) => void }) {
  const [period, setPeriod] = useState<Period>('Daily')
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const completed = completedMinutesToday(tasks, now)
  const planned = plannedMinutes(tasks)
  const bars = useMemo(() => Array.from({ length: 18 }, (_, index) => {
    const start = (index + 6) * 60
    const end = start + 60
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    return tasks.filter((task) => task.synced).reduce((total, task) => total + Math.max(0, Math.min(end, Math.min(minutesAt(task.end), currentMinutes)) - Math.max(start, minutesAt(task.start))), 0)
  }), [tasks, now])

  const trackedDays = Math.max(1, Math.ceil((Date.now() - new Date(firstSeen || Date.now()).getTime()) / 86400000))
  const total = period === 'Daily' ? completed : period === 'Weekly' ? completed * Math.min(trackedDays, 7) : completed * Math.min(trackedDays, 30)
  const target = period === 'Daily' ? planned : period === 'Weekly' ? planned * 7 : planned * 30
  const percent = target ? Math.min(100, Math.round(total / target * 100)) : 0
  const suffix = period === 'Daily' ? 'today' : period === 'Weekly' ? 'this week' : 'this month'
  const rewards: { period: RewardPeriod; title: string; amount: number; key: string }[] = [
    { period: 'daily', title: 'Daily rhythm', amount: 10, key: rewardKey('daily', now) },
    { period: 'weekly', title: 'Weekly consistency', amount: 100, key: rewardKey('weekly', now) },
    { period: 'monthly', title: 'Monthly orbit', amount: 500, key: rewardKey('monthly', now) },
  ]

  return <section className="flex flex-col gap-6" aria-labelledby="stats-title">
    <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Analytics</p><h1 id="stats-title" className="mt-1 text-2xl font-semibold tracking-tight">Light exposure</h1></div>
    <div className="grid grid-cols-3 rounded-full bg-card p-1 ring-1 ring-border">{(['Daily', 'Weekly', 'Monthly'] as Period[]).map((item) => <button key={item} onClick={() => setPeriod(item)} className={cn('rounded-full py-2 text-xs font-medium transition-colors', period === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>{item}</button>)}</div>
    <div><div className="flex items-end justify-between gap-4"><div><p className="text-xs text-muted-foreground">Total synced light exposure</p><p className="mt-1 text-2xl font-semibold">{formatMinutes(total)} <span className="text-sm font-normal text-muted-foreground">{suffix}</span></p></div><p className="font-mono text-xs text-primary">{percent}% of plan</p></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} /></div></div>
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border"><div className="mb-5"><h2 className="text-sm font-medium">Today&apos;s wavelength exposure</h2><p className="mt-1 text-xs text-muted-foreground">Minutes accrue automatically while synced blocks are in progress.</p></div><div className="flex h-48 items-end gap-1">{bars.map((minutes, index) => <div key={index} className="flex h-full flex-1 items-end"><span title={`${minutes} min`} style={{ height: `${Math.max(minutes ? 8 : 2, Math.min(100, minutes / 60 * 100))}%` }} className={cn('w-full rounded-sm transition-all', index < 6 ? 'bg-primary' : index < 12 ? 'bg-accent' : 'bg-destructive')} /></div>)}</div><div className="mt-2 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1">{labels.map((label, index) => <span key={index} className="text-center font-mono text-[8px] text-muted-foreground">{label}</span>)}</div></div>
    <div className="rounded-2xl bg-card p-5 ring-1 ring-border"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-muted-foreground">Schedule consistency</p><h2 className="mt-1 text-sm font-medium">Reach 100% to unlock rewards</h2></div><div className="text-right"><p className="font-mono text-xl font-medium">{percent}%</p><p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground"><Lock className="size-3" /> Synced plan</p></div></div><div className="mt-4 grid gap-2">{rewards.map((reward) => { const claimed = rewardClaims[reward.period] === reward.key; const activePeriod = period.toLowerCase() === reward.period; const eligible = activePeriod && percent >= 100; return <div key={reward.period} className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2.5"><div><p className="text-xs font-medium">{reward.title}</p><p className="mt-0.5 font-mono text-[10px] text-primary">+{reward.amount} L</p></div><Button size="sm" variant={claimed ? 'secondary' : 'outline'} disabled={claimed || !eligible} onClick={() => onClaimReward(reward.period, reward.key, reward.amount)}>{claimed ? 'Claimed' : !activePeriod ? 'View tab' : percent < 100 ? `${percent}%` : 'Claim'}</Button></div> })}</div><p className="mt-4 text-xs leading-relaxed text-muted-foreground">Daily, weekly, and monthly rewards are each saved after they are claimed.</p></div>
  </section>
}
