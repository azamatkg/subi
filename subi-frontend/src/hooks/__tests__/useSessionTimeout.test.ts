import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'

// Mock dependencies
vi.mock('@/utils/auth', () => ({
  getStoredToken: vi.fn(),
  isTokenExpired: vi.fn(),
  clearStoredAuth: vi.fn(),
}))

vi.mock('@/store/hooks', () => ({
  useAppDispatch: vi.fn(() => vi.fn()),
}))

const mockGetStoredToken = vi.mocked(
  await import('@/utils/auth')
).getStoredToken
const mockIsTokenExpired = vi.mocked(
  await import('@/utils/auth')
).isTokenExpired
const mockClearStoredAuth = vi.mocked(
  await import('@/utils/auth')
).clearStoredAuth

describe('useSessionTimeout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with no timeout warning', () => {
    mockGetStoredToken.mockReturnValue('valid-token')
    mockIsTokenExpired.mockReturnValue(false)

    const { result } = renderHook(() => useSessionTimeout())

    expect(result.current.showTimeoutWarning).toBe(false)
    expect(result.current.timeRemaining).toBe(null)
  })

  it('should show timeout warning when session is about to expire', () => {
    mockGetStoredToken.mockReturnValue('expiring-token')
    mockIsTokenExpired.mockReturnValue(false)

    const { result } = renderHook(() =>
      useSessionTimeout({ warningThreshold: 300 }) // 5 minutes
    )

    // Mock token expiration in 4 minutes
    act(() => {
      vi.advanceTimersByTime(240000) // 4 minutes
    })

    expect(result.current.showTimeoutWarning).toBe(true)
    expect(result.current.timeRemaining).toBeLessThanOrEqual(300)
  })

  it('should trigger logout when session expires', () => {
    const mockOnTimeout = vi.fn()
    mockGetStoredToken.mockReturnValue('expiring-token')
    mockIsTokenExpired.mockReturnValue(false)

    renderHook(() =>
      useSessionTimeout({
        warningThreshold: 300,
        onTimeout: mockOnTimeout
      })
    )

    // Mock token becoming expired
    act(() => {
      mockIsTokenExpired.mockReturnValue(true)
      vi.advanceTimersByTime(1000)
    })

    expect(mockOnTimeout).toHaveBeenCalled()
    expect(mockClearStoredAuth).toHaveBeenCalled()
  })

  it('should extend session when user is active', () => {
    const mockOnTimeout = vi.fn()
    mockGetStoredToken.mockReturnValue('valid-token')
    mockIsTokenExpired.mockReturnValue(false)

    const { result } = renderHook(() =>
      useSessionTimeout({
        warningThreshold: 300,
        onTimeout: mockOnTimeout
      })
    )

    // Show warning
    act(() => {
      vi.advanceTimersByTime(240000) // 4 minutes
    })

    expect(result.current.showTimeoutWarning).toBe(true)

    // Extend session
    act(() => {
      result.current.extendSession()
    })

    expect(result.current.showTimeoutWarning).toBe(false)
    expect(mockOnTimeout).not.toHaveBeenCalled()
  })

  it('should handle token refresh events', () => {
    mockGetStoredToken.mockReturnValue('old-token')
    mockIsTokenExpired.mockReturnValue(false)

    const { result } = renderHook(() => useSessionTimeout())

    // Show timeout warning
    act(() => {
      vi.advanceTimersByTime(240000)
    })

    expect(result.current.showTimeoutWarning).toBe(true)

    // Simulate token refresh event
    act(() => {
      window.dispatchEvent(new CustomEvent('token-refreshed', {
        detail: { accessToken: 'new-token' }
      }))
    })

    expect(result.current.showTimeoutWarning).toBe(false)
  })

  it('should handle auth error events', () => {
    const mockOnTimeout = vi.fn()
    mockGetStoredToken.mockReturnValue('valid-token')
    mockIsTokenExpired.mockReturnValue(false)

    renderHook(() =>
      useSessionTimeout({ onTimeout: mockOnTimeout })
    )

    // Simulate auth error event
    act(() => {
      window.dispatchEvent(new CustomEvent('auth-error'))
    })

    expect(mockOnTimeout).toHaveBeenCalled()
  })

  it('should cleanup timers on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    mockGetStoredToken.mockReturnValue('valid-token')
    mockIsTokenExpired.mockReturnValue(false)

    const { unmount } = renderHook(() => useSessionTimeout())

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })

  it('should pause timeout checking when user is inactive', () => {
    const mockOnTimeout = vi.fn()
    mockGetStoredToken.mockReturnValue('valid-token')
    mockIsTokenExpired.mockReturnValue(false)

    const { result } = renderHook(() =>
      useSessionTimeout({
        onTimeout: mockOnTimeout,
        checkInactivity: true,
        inactivityTimeout: 30000 // 30 seconds
      })
    )

    // User becomes inactive
    act(() => {
      result.current.pauseTimeoutCheck()
      vi.advanceTimersByTime(600000) // 10 minutes
    })

    expect(mockOnTimeout).not.toHaveBeenCalled()

    // Resume when user becomes active
    act(() => {
      result.current.resumeTimeoutCheck()
    })

    expect(result.current.showTimeoutWarning).toBe(false)
  })

  it('should provide correct time remaining calculation', () => {
    mockGetStoredToken.mockReturnValue('token-with-known-expiry')
    mockIsTokenExpired.mockReturnValue(false)

    // Mock JWT decode to return specific expiry time
    const futureTime = Math.floor(Date.now() / 1000) + 600 // 10 minutes from now
    vi.doMock('jwt-decode', () => ({
      default: vi.fn(() => ({ exp: futureTime }))
    }))

    const { result } = renderHook(() => useSessionTimeout())

    expect(result.current.timeRemaining).toBeGreaterThan(500) // Should be close to 600 seconds
    expect(result.current.timeRemaining).toBeLessThanOrEqual(600)
  })
})