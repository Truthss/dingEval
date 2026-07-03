import type { PersonOption } from '@/types/expense'

export const persons: PersonOption[] = [
  { value: 'zhangming', label: '张明', title: '财务经理' },
  { value: 'wangfang', label: '王芳', title: '财务总监' },
  { value: 'liuhua', label: '刘华', title: 'CFO' },
  { value: 'lina', label: '李娜', title: 'HR 经理' },
  { value: 'chenyu', label: '陈宇', title: '项目总监' },
  { value: 'sunlei', label: '孙磊', title: '研发负责人' },
  { value: 'zhaoyan', label: '赵燕', title: '运营经理' },
  { value: 'zhengtao', label: '郑涛', title: '法务总监' }
]

export function findPerson(value: string | null): PersonOption | undefined {
  if (!value) return undefined
  return persons.find((p) => p.value === value)
}

export function findPersonDisplay(value: string | null): string {
  const p = findPerson(value)
  return p ? `${p.label} · ${p.title}` : ''
}
