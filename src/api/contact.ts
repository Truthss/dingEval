// src/api/contact.ts
import { ddUsers, type User } from './client'

let cache: User[] | null = null
let inflight: Promise<User[]> | null = null

export function getCachedContacts(): User[] | null {
  return cache
}

export function clearContactCache(): void {
  cache = null
  inflight = null
}

export async function fetchContacts(): Promise<User[]> {
  if (cache) return cache
  if (inflight) return inflight
  inflight = ddUsers()
  try {
    cache = await inflight
    return cache
  } finally {
    inflight = null
  }
}

export function searchContacts(query: string, users: User[]): User[] {
  const q = query.trim().toLowerCase()
  if (!q) return users
  return users.filter((u) => u.name.toLowerCase().includes(q))
}
