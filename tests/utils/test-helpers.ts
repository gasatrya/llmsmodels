/**
 * Test Utilities and Custom Render Functions
 *
 * This module provides reusable utilities for testing React components.
 */

import { render } from '@testing-library/react'

import type { ReactElement, ReactNode } from 'react'
import type { RenderOptions } from '@testing-library/react'

interface CustomRenderOptions extends RenderOptions {
  // Add custom options here if needed
}

export function renderWithProviders(
  ui: ReactElement,
  _options: CustomRenderOptions = {},
) {
  function Wrapper({ children }: { children?: ReactNode }) {
    return children
  }

  return render(ui, { wrapper: Wrapper, ..._options })
}

/**
 * Render component without any providers
 */
export function renderWithoutProviders(
  ui: ReactElement,
  renderOptions?: RenderOptions,
) {
  return render(ui, renderOptions)
}

/**
 * Generate unique test IDs
 */
let testIdCounter = 0

export function generateTestId(prefix = 'test'): string {
  testIdCounter += 1
  return `${prefix}-${testIdCounter}-${Date.now()}`
}

// Re-export everything from @testing-library/react for convenience
export * from '@testing-library/react'
