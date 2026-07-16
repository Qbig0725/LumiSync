'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, ChartNoAxesColumn, Home, Settings, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HomeScreen } from '@/components/screens/home-screen'
import { ScheduleScreen } from '@/components/screens/schedule-screen'
import { StatsScreen } from '@/components/screens/stats-screen'
import { SettingsScreen } from '@/components/screens/settings-screen'
import { StoreScreen } from '@/components/screens/store-screen'
import { createWeeklySchedule, currentWeekDay, initialTasks, type LightTask, type WeeklySchedule } from '@/lib/lumi-data'

type Tab = 'home' | 'schedule' | 'stats' | 'settings' | 'store'
export type Chronotype = 'Morning Lark' | 'Intermediate' | 'Night Owl'
export type AppTheme = 'lunar' | 'starlight' | 'saturn' | 'jupiter' | 'nebula' | 'solar' | 'horizon'
export type SettingsData = { wakeTime: string; sleepTime: string; high: number; low: number; govee: boolean; push: boolean; windDown: boolean }
type RewardClaims = { daily?: string; weekly?: string; monthly?: string }
type UserData = { name: string; lumens: number; brightness: number; chronotype: Chronotype; appTheme: AppTheme; ownedThemes: AppTheme[]; tasks: LightTask[]; weeklyTasks: WeeklySchedule; settings: SettingsData; rewardClaims: RewardClaims; firstSeen: string; missionClaimedDate?: string }

const COOKIE_KEY = 'lumisync-user-data'
const defaultSettings: SettingsData = { wakeTime: '06:30', sleepTime: '22:30', high: 76, low: 32, govee: true, push: true, windDown: true }
const defaultData: UserData = { name: '', lumens: 1250, brightness: 68, chronotype: 'Intermediate', appTheme: 'lunar', ownedThemes: ['lunar'], tasks: initialTasks, weeklyTasks: createWeeklySchedule(), settings: defaultSettings, rewardClaims: {}, firstSeen: '' }
const tabs = [
  { id: 'home' as const, label: 'Home', icon: Home }, { id: 'schedule' as const, label: 'Schedule', icon: CalendarDays },
  { id: 'stats' as const, label: 'Stats', icon: ChartNoAxesColumn }, { id: 'settings' as const, label: 'Settings', icon: Settings }, { id: 'store' as const, label: 'Store', icon: ShoppingBag },
]

function readCookie(): UserData | null {
  const value = document.cookie.split('; ').find((item) => item.startsWith(`${COOKIE_KEY}=`))?.split('=').slice(1).join('=')
  if (!value) return null
  try {
    const saved = JSON.parse(decodeURIComponent(value)) as Partial<UserData>
    const validThemes: AppTheme[] = ['lunar', 'starlight', 'saturn', 'jupiter', 'nebula', 'solar', 'horizon']
    const appTheme = validThemes.includes(saved.appTheme as AppTheme) ? saved.appTheme as AppTheme : 'lunar'
    const ownedThemes = Array.isArray(saved.ownedThemes) ? saved.ownedThemes.filter((theme): theme is AppTheme => validThemes.includes(theme as AppTheme)) : []
    const legacyTasks = Array.isArray(saved.tasks) ? saved.tasks : initialTasks
    return { ...defaultData, ...saved, tasks: legacyTasks, weeklyTasks: saved.weeklyTasks ?? createWeeklySchedule(legacyTasks), settings: { ...defaultSettings, ...saved.settings }, rewardClaims: saved.rewardClaims ?? {}, appTheme, ownedThemes: Array.from(new Set(['lunar', ...ownedThemes])) }
  } catch { return null }
}

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function LumiSyncApp() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [data, setData] = useState<UserData>(defaultData)
  const [ready, setReady] = useState(false)
  const [nameInput, setNameInput] = useState('')
  useEffect(() => { const saved = readCookie(); if (saved) setData(saved); setReady(true) }, [])
  useEffect(() => { if (ready && data.name) document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(data))}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax` }, [data, ready])
  const update = (patch: Partial<UserData>) => setData((current) => ({ ...current, ...patch }))
  const spendLumens = (cost: number) => { if (data.lumens < cost) return false; update({ lumens: data.lumens - cost }); return true }
  const completeOnboarding = () => update({ name: nameInput.trim() || 'Lumi explorer', firstSeen: new Date().toISOString() })
  const todayTasks = data.weeklyTasks[currentWeekDay()] ?? data.tasks

  if (!ready) return <main className="min-h-dvh bg-slate-950" />
  if (!data.name) return <main className="flex min-h-dvh items-center justify-center bg-slate-950 p-6 text-slate-100"><section className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-2xl"><span className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-cyan-400 shadow-[0_0_30px_rgba(56,189,248,.35)]"><span className="size-3 rounded-full bg-slate-950" /></span><p className="text-xs font-medium uppercase tracking-[.18em] text-cyan-400">Welcome to LumiSync</p><h1 className="mt-2 text-2xl font-semibold">What should we call you?</h1><p className="mt-2 text-sm leading-relaxed text-slate-400">Your name personalizes your light rhythm. Your settings and progress stay saved in this browser.</p><form className="mt-6 flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); completeOnboarding() }}><label className="text-sm text-slate-300">Name<input autoFocus value={nameInput} onChange={(event) => setNameInput(event.target.value)} placeholder="Enter your name" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400" /></label><button className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950">Start my rhythm</button></form></section></main>

  return <main data-chronotype={data.chronotype} data-app-theme={data.appTheme} className={cn('min-h-dvh font-sans transition-colors duration-500', `theme-${data.appTheme}`)}>
    <div className="mx-auto min-h-dvh w-full max-w-md border-x border-current/10 bg-inherit shadow-2xl shadow-black/20"><header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-card/90 px-5 pb-3 pt-5 shadow-lg shadow-black/10 backdrop-blur-xl"><button className="flex items-center gap-2 text-left" onClick={() => setActiveTab('home')} aria-label="Go to home"><span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_20px_var(--glow-primary)]"><span className="size-2 rounded-full bg-primary-foreground" /></span><span><span className="block text-sm font-semibold tracking-tight">LumiSync</span><span className="block text-[11px] text-muted-foreground">Circadian companion</span></span></button><div className="rounded-full border border-border bg-secondary/80 px-3 py-1.5 font-mono text-xs font-semibold shadow-sm backdrop-blur-xl">{data.lumens.toLocaleString()} L</div></header>
      <div className="px-5 pb-28 pt-3">{activeTab === 'home' && <HomeScreen name={data.name} tasks={todayTasks} brightness={data.brightness} onBrightnessChange={(brightness) => update({ brightness })} missionClaimedDate={data.missionClaimedDate} onClaimMission={() => update({ lumens: data.lumens + 10, missionClaimedDate: localDateKey() })} />}{activeTab === 'schedule' && <ScheduleScreen weeklyTasks={data.weeklyTasks} onScheduleChange={(weeklyTasks) => update({ weeklyTasks })} />}{activeTab === 'stats' && <StatsScreen tasks={todayTasks} firstSeen={data.firstSeen} rewardClaims={data.rewardClaims} onClaimReward={(period, key, amount) => update({ lumens: data.lumens + amount, rewardClaims: { ...data.rewardClaims, [period]: key } })} />}{activeTab === 'settings' && <SettingsScreen chronotype={data.chronotype} settings={data.settings} onChronotypeChange={(chronotype) => update({ chronotype })} onSettingsChange={(settings) => update({ settings })} />}{activeTab === 'store' && <StoreScreen lumens={data.lumens} onSpend={spendLumens} appTheme={data.appTheme} onThemeChange={(appTheme) => update({ appTheme })} owned={data.ownedThemes} onOwnTheme={(theme) => update({ ownedThemes: data.ownedThemes.includes(theme) ? data.ownedThemes : [...data.ownedThemes, theme] })} />}</div>
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-border/70 bg-card/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_28px_rgb(0_0_0_/_0.12)] backdrop-blur-xl" aria-label="Primary navigation"><ul className="grid grid-cols-5">{tabs.map(({ id, label, icon: Icon }) => <li key={id}><button onClick={() => setActiveTab(id)} className={cn('flex w-full flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors', activeTab === id ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}><Icon className={cn('size-5', activeTab === id && 'drop-shadow-[0_0_7px_var(--primary)]')} />{label}</button></li>)}</ul></nav>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 bg-black transition-opacity duration-300" style={{ opacity: (100 - data.brightness) / 100 * 0.78 }} />
    </div></main>
}
