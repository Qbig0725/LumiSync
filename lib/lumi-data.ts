export type Load = 'high' | 'med' | 'low'
export type LightTask = {
  id: string
  start: string
  end: string
  title: string
  load: Load
  expanded: boolean
  synced: boolean
  done: boolean
}

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export type WeekDay = typeof weekDays[number]
export type WeeklySchedule = Record<WeekDay, LightTask[]>

export function createWeeklySchedule(tasks = initialTasks): WeeklySchedule {
  return weekDays.reduce((schedule, day) => ({ ...schedule, [day]: tasks.map((task) => ({ ...task })) }), {} as WeeklySchedule)
}

export function currentWeekDay(date = new Date()): WeekDay {
  return weekDays[(date.getDay() + 6) % 7]
}

export const initialTasks: LightTask[] = [
  { id: 'morning', start: '06:00', end: '07:30', title: 'Morning light', load: 'high', expanded: false, synced: true, done: false },
  { id: 'deep-work', start: '09:00', end: '11:30', title: 'Deep work', load: 'high', expanded: false, synced: true, done: false },
  { id: 'reset', start: '13:00', end: '14:00', title: 'Post-lunch reset', load: 'low', expanded: false, synced: false, done: false },
  { id: 'evening', start: '18:00', end: '19:30', title: 'Evening transition', load: 'low', expanded: false, synced: true, done: false },
]

export function minutesAt(time: string) {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

export function durationMinutes(task: LightTask) {
  return Math.max(0, minutesAt(task.end) - minutesAt(task.start))
}

export function completedMinutesToday(tasks: LightTask[], now = new Date()) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
  return tasks.filter((task) => task.synced).reduce((total, task) => {
    const elapsed = Math.min(Math.max(nowMinutes - minutesAt(task.start), 0), durationMinutes(task))
    return total + elapsed
  }, 0)
}

export function plannedMinutes(tasks: LightTask[]) {
  return tasks.filter((task) => task.synced).reduce((total, task) => total + durationMinutes(task), 0)
}
