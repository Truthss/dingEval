// src/__tests__/api.client.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NetworkError, ApiError, apiGet, apiPost, ddNotify, ddUsers } from '@/api/client'

describe('api/client', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    mockFetch.mockReset()
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('apiGet', () => {
    it('apiGet parses 2xx response as JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ foo: 'bar' })
      })
      const result = await apiGet<{ foo: string }>('/api/test')
      expect(result).toEqual({ foo: 'bar' })
      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ method: 'GET' }))
    })
  })

  describe('apiPost', () => {
    it('apiPost serializes body and parses 2xx response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ok: true })
      })
      const result = await apiPost<{ ok: boolean }>('/api/test', { a: 1 })
      expect(result).toEqual({ ok: true })
      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 1 })
      }))
    })
  })

  describe('error handling', () => {
    it('throws NetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
      await expect(apiGet('/api/test')).rejects.toBeInstanceOf(NetworkError)
    })

    it('throws ApiError with status when response is not 2xx', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      })
      try {
        await apiGet('/api/test')
        expect.fail('should have thrown')
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError)
        expect((e as ApiError).status).toBe(500)
        expect((e as ApiError).message).toBe('Internal Server Error')
      }
    })
  })

  describe('domain wrappers', () => {
    it('ddNotify POSTs to /api/dd-notify and returns void on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ errcode: 0 })
      })
      await expect(
        ddNotify({
          useridList: ['u1', 'u2'],
          title: '报销单已提交',
          content: '陆晓锋 提交了日常报销单，金额 ¥200.00'
        })
      ).resolves.toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/dd-notify',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('ddUsers GETs /api/dd-users and returns the user list', async () => {
      const users = [
        { userid: 'u1', name: '张三' },
        { userid: 'u2', name: '李四' }
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ users })
      })
      const result = await ddUsers()
      expect(result).toEqual(users)
    })
  })
})
