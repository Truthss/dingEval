// src/api/client.ts

export type User = {
  userid: string
  name: string
  avatarUrl?: string
}

export type NotifyPayload = {
  useridList: string[]
  title: string
  content: string
  jumpUrl?: string
}

export class NetworkError extends Error {
  constructor(message = '网络错误') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, init)
  } catch (e) {
    throw new NetworkError(e instanceof Error ? e.message : '网络错误')
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, text || res.statusText)
  }
  return res.json() as Promise<T>
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function ddNotify(payload: NotifyPayload): Promise<void> {
  await apiPost<{ errcode: number }>('/api/dd-notify', payload)
}

export async function ddUsers(): Promise<User[]> {
  const data = await apiGet<{ users: User[] }>('/api/dd-users')
  return data.users ?? []
}
