const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatWhen(at) {
  const [date, time] = at.split('T')
  const [, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const h12 = ((hh + 11) % 12) + 1
  return `${d} ${MONTHS[m - 1]} · ${h12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'am' : 'pm'}`
}
