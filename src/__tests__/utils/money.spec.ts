import { describe, it, expect } from 'vitest'
import { formatMoney, parseMoney, isPositiveAmount } from '@/utils/money'

describe('formatMoney', () => {
  it('formats integer with thousand separators and 2 decimals', () => {
    expect(formatMoney(1280)).toBe('1,280.00')
  })

  it('formats decimal with thousand separators and 2 decimals', () => {
    expect(formatMoney(1234567.891)).toBe('1,234,567.89')
  })

  it('formats zero', () => {
    expect(formatMoney(0)).toBe('0.00')
  })

  it('treats null / undefined / NaN as zero', () => {
    expect(formatMoney(null)).toBe('0.00')
    expect(formatMoney(undefined)).toBe('0.00')
    expect(formatMoney(NaN)).toBe('0.00')
  })

  it('handles negative numbers', () => {
    expect(formatMoney(-1234.5)).toBe('-1,234.50')
  })
})

describe('parseMoney', () => {
  it('parses string with commas', () => {
    expect(parseMoney('1,234.56')).toBe(1234.56)
  })

  it('parses plain number string', () => {
    expect(parseMoney('1280')).toBe(1280)
  })

  it('returns 0 for empty / null / undefined', () => {
    expect(parseMoney('')).toBe(0)
    expect(parseMoney(null)).toBe(0)
    expect(parseMoney(undefined)).toBe(0)
  })

  it('returns 0 for invalid string', () => {
    expect(parseMoney('abc')).toBe(0)
  })
})

describe('isPositiveAmount', () => {
  it('returns true for > 0', () => {
    expect(isPositiveAmount(0.01)).toBe(true)
    expect(isPositiveAmount(100)).toBe(true)
  })

  it('returns false for 0, null, undefined, negative', () => {
    expect(isPositiveAmount(0)).toBe(false)
    expect(isPositiveAmount(null)).toBe(false)
    expect(isPositiveAmount(undefined)).toBe(false)
    expect(isPositiveAmount(-1)).toBe(false)
  })
})
