import type { OptionItem } from '@/types/expense'

export const accounts: OptionItem[] = [
  { value: 'icbc-001', label: '中国工商银行 (6212****1234)' },
  { value: 'cmb-002', label: '招商银行 (6225****5678)' },
  { value: 'ccb-003', label: '中国建设银行 (6217****9012)' },
  { value: 'boc-004', label: '中国银行 (6216****3456)' },
  { value: 'abc-005', label: '中国农业银行 (6228****7890)' }
]

export function findAccountLabel(value: string | null): string {
  if (!value) return ''
  return accounts.find((a) => a.value === value)?.label ?? ''
}
