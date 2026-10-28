// Single source of truth for Scoin ↔ rupee conversion. Every ₹ figure in the UI goes through here.
export const SCOINS_PER_RUPEE = { inApp: 5, bank: 10 }

export const inAppValue = (scoins) => scoins / SCOINS_PER_RUPEE.inApp
export const bankValue = (scoins) => scoins / SCOINS_PER_RUPEE.bank
export const scoinsForRupees = (rupees) => rupees * SCOINS_PER_RUPEE.inApp

export function formatRupees(value) {
  const rounded = Math.round(value * 100) / 100
  const hasPaise = Math.abs(rounded % 1) > 0
  return '₹' + rounded.toLocaleString('en-IN', {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: hasPaise ? 2 : 0,
  })
}

export const formatScoins = (scoins) => Math.round(scoins).toLocaleString('en-IN')

export function formatSigned(scoins) {
  const sign = scoins > 0 ? '+' : scoins < 0 ? '−' : ''
  return sign + formatScoins(Math.abs(scoins))
}
