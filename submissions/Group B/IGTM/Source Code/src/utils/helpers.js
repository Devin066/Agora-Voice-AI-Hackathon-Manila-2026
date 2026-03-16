export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const formatDuration = (start, end) => {
  if (!start || !end) return '0:00'
  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = `${totalSeconds % 60}`.padStart(2, '0')
  return `${minutes}:${seconds}`
}

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const average = (values) => {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export const extractSalaryNumber = (text) => {
  const salaryMatch = text.replaceAll(',', '').match(/\$?\s?(\d{2,6})/g)
  if (!salaryMatch?.length) return null
  const numbers = salaryMatch
    .map((token) => Number(token.replace(/[^0-9]/g, '')))
    .filter(Boolean)
  if (!numbers.length) return null
  return Math.max(...numbers)
}
