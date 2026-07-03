export function formatMoney(value: number | null | undefined): string {
  const v = Number(value) || 0
  const fixed = v.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${withCommas}.${decPart}`
}

export function parseMoney(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const cleaned = String(value).replace(/,/g, '').trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

export function isPositiveAmount(value: number | null | undefined): boolean {
  if (value === null || value === undefined) return false
  return Number(value) > 0
}
