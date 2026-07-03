import type { OptionItem } from '@/types/expense'

export const customers: OptionItem[] = [
  { value: 'walker', label: '上海沃克供应链管理有限公司' },
  { value: 'bosch', label: '博世（中国）投资有限公司' },
  { value: 'huawei', label: '华为技术有限公司' },
  { value: 'sany', label: '三一重工股份有限公司' },
  { value: 'haier', label: '海尔智家股份有限公司' },
  { value: 'midea', label: '美的集团股份有限公司' }
]

export function findCustomerLabel(value: string | null): string {
  if (!value) return ''
  return customers.find((c) => c.value === value)?.label ?? ''
}
