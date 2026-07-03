import type { OptionItem } from '@/types/expense'

export const entities: OptionItem[] = [
  { value: 'walker-cn', label: '沃克（中国）供应链管理有限公司' },
  { value: 'walker-sh', label: '上海沃克物流有限公司' },
  { value: 'walker-bj', label: '北京沃克信息技术有限公司' },
  { value: 'walker-sz', label: '深圳沃克智能科技股份有限公司' }
]

export function findEntityLabel(value: string | null): string {
  if (!value) return ''
  return entities.find((e) => e.value === value)?.label ?? ''
}
