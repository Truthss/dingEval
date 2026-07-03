import type { OptionItem } from '@/types/expense'

export const projects: OptionItem[] = [
  { value: 'walker-1', label: '沃克·供应链项目（一期）' },
  { value: 'walker-2', label: '沃克·数字化平台（二期）' },
  { value: 'walker-3', label: '沃克·海外仓 (Q3)' },
  { value: 'walker-4', label: '沃克·客户成功体系搭建' },
  { value: 'walker-5', label: '沃克·数据中台 PoC' }
]

export function findProjectLabel(value: string | null): string {
  if (!value) return ''
  return projects.find((p) => p.value === value)?.label ?? ''
}
