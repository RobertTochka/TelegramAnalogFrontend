export function formatLastSeen(timestamp: string): string {
  const lastSeen = new Date(timestamp)
  const now = new Date()

  const diffInSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  // Меньше минуты назад
  if (diffInSeconds < 60) {
    return 'был(а) только что'
  }

  // Минуты
  if (diffInMinutes < 60) {
    const minutes = diffInMinutes
    const word = getMinutesWord(minutes)
    return `был(а) ${minutes} ${word} назад`
  }

  // Часы
  if (diffInHours < 24) {
    const hours = diffInHours
    const word = getHoursWord(hours)
    return `был(а) ${hours} ${word} назад`
  }

  // Дни
  if (diffInDays < 7) {
    const days = diffInDays
    const word = getDaysWord(days)
    return `был(а) ${days} ${word} назад`
  }

  // Недели
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    const word = getWeeksWord(weeks)
    return `был(а) ${weeks} ${word} назад`
  }

  // Месяцы
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    const word = getMonthsWord(months)
    return `был(а) ${months} ${word} назад`
  }

  // Годы
  const years = Math.floor(diffInDays / 365)
  const word = getYearsWord(years)
  return `был(а) ${years} ${word} назад`
}

// Вспомогательные функции для склонения слов
function getMinutesWord(minutes: number): string {
  if (minutes % 10 === 1 && minutes % 100 !== 11) return 'минуту'
  if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100))
    return 'минуты'
  return 'минут'
}

function getHoursWord(hours: number): string {
  if (hours % 10 === 1 && hours % 100 !== 11) return 'час'
  if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100))
    return 'часа'
  return 'часов'
}

function getDaysWord(days: number): string {
  if (days % 10 === 1 && days % 100 !== 11) return 'день'
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100))
    return 'дня'
  return 'дней'
}

function getWeeksWord(weeks: number): string {
  if (weeks % 10 === 1 && weeks % 100 !== 11) return 'неделю'
  if ([2, 3, 4].includes(weeks % 10) && ![12, 13, 14].includes(weeks % 100))
    return 'недели'
  return 'недель'
}

function getMonthsWord(months: number): string {
  if (months % 10 === 1 && months % 100 !== 11) return 'месяц'
  if ([2, 3, 4].includes(months % 10) && ![12, 13, 14].includes(months % 100))
    return 'месяца'
  return 'месяцев'
}

function getYearsWord(years: number): string {
  if (years % 10 === 1 && years % 100 !== 11) return 'год'
  if ([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100))
    return 'года'
  return 'лет'
}
