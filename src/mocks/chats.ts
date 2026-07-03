import type { ChatOption } from '@/types/expense'

const PALETTE = ['#5AC8FA', '#007FFF', '#00B042', '#FF9200', '#FF5219']

export const chats: ChatOption[] = [
  { value: 'lina', label: '李娜', title: 'HR 经理', avatarColor: PALETTE[0] },
  { value: 'chenyu', label: '陈宇', title: '项目总监', avatarColor: PALETTE[1] },
  { value: 'sunlei', label: '孙磊', title: '研发负责人', avatarColor: PALETTE[2] },
  { value: 'zhaoyan', label: '赵燕', title: '运营经理', avatarColor: PALETTE[3] },
  { value: 'zhengtao', label: '郑涛', title: '法务总监', avatarColor: PALETTE[4] }
]

export function findChat(value: string | null): ChatOption | undefined {
  if (!value) return undefined
  return chats.find((c) => c.value === value)
}
