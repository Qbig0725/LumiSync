'use client'

import { useState } from 'react'
import { Check, CircleDot, Flame, MoonStar, Orbit, Sparkles, SunMedium } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AppTheme } from '@/components/lumisync-app'

const themes: { id: AppTheme; name: string; korean: string; cost: number; colors: string; description: string; icon: typeof MoonStar }[] = [
  { id: 'lunar', name: 'Lunar Dust', korean: '달의 먼지', cost: 0, colors: 'Pale Silver & White', description: '튀는 색 없이 가장 깔끔하고 미니멀한 화이트/그레이 네온.', icon: MoonStar },
  { id: 'starlight', name: 'Starlight', korean: '별빛', cost: 500, colors: 'Ice Blue & Cyan', description: '시원하고 날카로운 푸른빛으로 집중력을 높여주는 색감.', icon: Sparkles },
  { id: 'saturn', name: "Saturn's Ring", korean: '토성의 고리', cost: 1000, colors: 'Soft Gold & Pale Yellow', description: '눈이 가장 편안한 따뜻한 상아색 네온.', icon: CircleDot },
  { id: 'jupiter', name: "Jupiter's Eye", korean: '목성의 눈', cost: 1500, colors: 'Terracotta & Coral Red', description: '차분한 붉은색과 적갈색이 섞여 심야에 쓰기 좋은 색감.', icon: Orbit },
  { id: 'nebula', name: 'Nebula Glow', korean: '성운', cost: 2000, colors: 'Deep Violet & Indigo', description: '핑크를 뺀 신비롭고 고급스러운 보라빛 네온.', icon: Sparkles },
  { id: 'solar', name: 'Solar Flare', korean: '태양풍', cost: 2500, colors: 'Fiery Orange & Bright Amber', description: '에너지가 넘치는 강렬한 주황빛. 아침에 눈을 깨우는 테마.', icon: SunMedium },
  { id: 'horizon', name: 'Event Horizon', korean: '사건의 지평선', cost: 3000, colors: 'Subtle Gold & Deep Burnt Orange', description: '완벽한 암흑 속 금빛과 진한 주황빛이 만드는 묵직한 글로우.', icon: Flame },
]

const reports = ['Your saved schedule is building a steady light rhythm.', 'Your synced light blocks are helping maintain a consistent routine.', 'Try keeping evening blocks warm and gentle before sleep.']

export function StoreScreen({ lumens, onSpend, appTheme, onThemeChange, owned, onOwnTheme }: { lumens: number; onSpend: (cost: number) => boolean; appTheme: AppTheme; onThemeChange: (theme: AppTheme) => void; owned: AppTheme[]; onOwnTheme: (theme: AppTheme) => void }) {
  const [report, setReport] = useState('')
  const [message, setMessage] = useState('')
  function chooseTheme(theme: AppTheme, cost: number) {
    if (owned.includes(theme)) { onThemeChange(theme); setMessage(`${themes.find((item) => item.id === theme)?.name} 테마를 적용했습니다.`); return }
    if (!onSpend(cost)) { setMessage(`잠금 해제까지 ${cost - lumens} L이 더 필요합니다.`); return }
    onOwnTheme(theme); onThemeChange(theme); setMessage('테마를 잠금 해제하고 적용했습니다.')
  }
  function generateReport() { if (!onSpend(500)) { setMessage(`리포트 생성까지 ${500 - lumens} L이 더 필요합니다.`); return }; setReport(reports[Math.floor(Math.random() * reports.length)]); setMessage('서카디안 리포트를 생성했습니다.') }
  return <section className="flex flex-col gap-6" aria-labelledby="store-title"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Rewards</p><h1 id="store-title" className="mt-1 text-2xl font-semibold tracking-tight">Lumen Store</h1></div><Badge variant="secondary" className="font-mono text-sm">{lumens.toLocaleString()} L</Badge></div><div className="flex flex-col gap-3"><div><h2 className="text-sm font-semibold">Cosmic Themes</h2><p className="mt-1 text-xs text-muted-foreground">루멘으로 나만의 우주 빛을 잠금 해제하세요.</p></div>{themes.map(({ id, name, korean, cost, colors, description, icon: Icon }) => { const isOwned = owned.includes(id); const equipped = appTheme === id; return <Card key={id} className={cn('overflow-hidden py-0 transition-shadow', `theme-preview-${id}`, equipped && 'ring-2 ring-primary shadow-[0_0_24px_var(--glow-primary)]')}><CardContent className="flex gap-3 px-4 py-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary"><Icon className="size-5 text-primary" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><CardTitle className="text-sm">{name}</CardTitle><span className="text-[10px] text-muted-foreground">{korean}</span></div><CardDescription className="mt-1 font-mono text-[10px]">{colors}</CardDescription><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p><div className="mt-3 flex items-center justify-between gap-3"><span className="font-mono text-xs font-semibold text-primary">{isOwned ? 'OWNED' : `${cost.toLocaleString()} L`}</span><Button size="sm" variant={equipped ? 'secondary' : 'outline'} disabled={equipped} onClick={() => chooseTheme(id, cost)}>{equipped ? <><Check data-icon="inline-start" /> Applied</> : isOwned ? 'Apply' : 'Buy'}</Button></div></div></CardContent></Card> })}</div><Card className="overflow-hidden border-primary/30 bg-card py-0 ring-1 ring-primary/20"><CardHeader className="px-5 pt-5"><CardTitle>Rhythm insight</CardTitle><CardDescription className="mt-1">Your saved light plan, summarized</CardDescription></CardHeader><CardContent className="px-5">{report ? <div className="rounded-xl bg-secondary p-4 text-sm leading-relaxed">{report}</div> : <p className="text-sm text-muted-foreground">Analyze your recent light exposure and sleep schedule for a personalized recommendation.</p>}</CardContent><CardFooter className="px-5 pb-5"><Button className="w-full" onClick={generateReport}>Generate insight (500 L)</Button></CardFooter></Card><p className="min-h-5 text-center text-xs text-muted-foreground" aria-live="polite">{message}</p></section>
}
