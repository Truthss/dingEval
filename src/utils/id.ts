import { nanoid } from 'nanoid'

export function uid(prefix?: string): string {
  return prefix ? `${prefix}_${nanoid(8)}` : nanoid(10)
}

export const today = (): string => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
