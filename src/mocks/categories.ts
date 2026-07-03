import type { OptionItem } from '@/types/expense'

export const categories: OptionItem[] = [
  { value: 'travel', label: '差旅费' },
  { value: 'meal', label: '业务招待费' },
  { value: 'office', label: '办公用品' },
  { value: 'entertain', label: '业务招待' },
  { value: 'communication', label: '通讯费' },
  { value: 'other', label: '其他费用' }
]

export function findCategoryLabel(value: string | null): string {
  if (!value) return ''
  return categories.find((c) => c.value === value)?.label ?? ''
}
