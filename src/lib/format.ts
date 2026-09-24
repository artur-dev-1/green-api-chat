const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const dayFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

export function formatTime(timestamp: number) {
  return timeFormatter.format(timestamp)
}

/** Time for today, a short date otherwise — as in the chat list of messengers */
export function formatListTime(timestamp: number) {
  return isSameDay(new Date(timestamp), new Date())
    ? timeFormatter.format(timestamp)
    : dateFormatter.format(timestamp)
}

export function formatDayLabel(timestamp: number) {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (isSameDay(date, today)) return 'Сегодня'
  if (isSameDay(date, yesterday)) return 'Вчера'
  return dayFormatter.format(timestamp)
}

export function isDifferentDay(a: number, b: number) {
  return !isSameDay(new Date(a), new Date(b))
}

export function formatPhone(digits: string) {
  return `+${digits}`
}
