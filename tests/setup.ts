/**
 * Vitest Test Setup
 *
 * This file runs before each test file and provides global configuration
 * and utilities for testing.
 */

import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, expect, vi } from 'vitest'

// Extend expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test to prevent state leakage between tests
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia before each test
beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((_query: string) => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock window.scrollTo
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

  // Mock window.alert for tests that might trigger alerts
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

// TypeScript declarations for extended matchers
declare module 'vitest' {
  interface Assertion<T> {
    toBeInTheDocument: () => T
    toHaveAttribute: (attr: string, value?: string) => T
    toHaveClass: (className: string) => T
    toBeChecked: () => T
    toBeEnabled: () => T
  }

  interface NotValue<T> {
    toBeInTheDocument: () => T
    toBeChecked: () => T
    toHaveAttribute: (attr: string, value?: string) => T
  }
}
