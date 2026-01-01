/**
 * Filter Test Fixtures
 *
 * This module provides reusable test fixtures for filter-related testing.
 * Fixtures include sample filter states, mock data, and helper functions.
 */

import { vi } from 'vitest'

import type { SimpleFiltersState } from '@/types/filters'

/**
 * Sample filter states for testing
 */
export const FILTER_FIXTURES = {
  /** Empty filter state with all filters undefined */
  empty: {
    reasoning: undefined,
    toolCall: undefined,
    openWeights: undefined,
  } as SimpleFiltersState,

  /** All filters active */
  allActive: {
    reasoning: true,
    toolCall: true,
    openWeights: true,
  } as SimpleFiltersState,

  /** Only reasoning filter active */
  reasoningOnly: {
    reasoning: true,
    toolCall: undefined,
    openWeights: undefined,
  } as SimpleFiltersState,

  /** Only tool call filter active */
  toolCallOnly: {
    reasoning: undefined,
    toolCall: true,
    openWeights: undefined,
  } as SimpleFiltersState,

  /** Only open weights filter active */
  openWeightsOnly: {
    reasoning: undefined,
    toolCall: undefined,
    openWeights: true,
  } as SimpleFiltersState,

  /** Reasoning and tool call active */
  reasoningAndToolCall: {
    reasoning: true,
    toolCall: true,
    openWeights: undefined,
  } as SimpleFiltersState,

  /** Reasoning and open weights active */
  reasoningAndOpenWeights: {
    reasoning: true,
    toolCall: undefined,
    openWeights: true,
  } as SimpleFiltersState,

  /** Tool call and open weights active */
  toolCallAndOpenWeights: {
    reasoning: undefined,
    toolCall: true,
    openWeights: true,
  } as SimpleFiltersState,

  /** All filters set to false (inactive) */
  allFalse: {
    reasoning: false,
    toolCall: false,
    openWeights: false,
  } as SimpleFiltersState,
}

/**
 * Helper function to create custom filter states
 */
export function createFilterState(
  overrides: Partial<SimpleFiltersState> = {},
): SimpleFiltersState {
  return {
    reasoning: undefined,
    toolCall: undefined,
    openWeights: undefined,
    ...overrides,
  }
}

/**
 * Generator function for creating random filter states
 * Useful for property-based testing
 */
export function generateRandomFilterState(): SimpleFiltersState {
  const booleanOptions: Array<boolean | undefined> = [true, false, undefined]

  return {
    reasoning:
      booleanOptions[Math.floor(Math.random() * booleanOptions.length)],
    toolCall: booleanOptions[Math.floor(Math.random() * booleanOptions.length)],
    openWeights:
      booleanOptions[Math.floor(Math.random() * booleanOptions.length)],
  }
}

/**
 * Expected filter state transitions after toggle
 * Format: [initialState, toggledKey, expectedState]
 */
export const FILTER_TRANSITIONS: Array<
  [SimpleFiltersState, keyof SimpleFiltersState, SimpleFiltersState]
> = [
  // Toggle undefined to true
  [FILTER_FIXTURES.empty, 'reasoning', FILTER_FIXTURES.reasoningOnly],
  [FILTER_FIXTURES.empty, 'toolCall', FILTER_FIXTURES.toolCallOnly],
  [FILTER_FIXTURES.empty, 'openWeights', FILTER_FIXTURES.openWeightsOnly],

  // Toggle true to undefined
  [FILTER_FIXTURES.reasoningOnly, 'reasoning', FILTER_FIXTURES.empty],
  [FILTER_FIXTURES.toolCallOnly, 'toolCall', FILTER_FIXTURES.empty],
  [FILTER_FIXTURES.openWeightsOnly, 'openWeights', FILTER_FIXTURES.empty],

  // Toggle between active filters
  [
    FILTER_FIXTURES.reasoningAndToolCall,
    'openWeights',
    FILTER_FIXTURES.allActive,
  ],
  [
    FILTER_FIXTURES.reasoningAndToolCall,
    'reasoning',
    FILTER_FIXTURES.toolCallOnly,
  ],

  // Edge case: all active, toggle one off
  [
    FILTER_FIXTURES.allActive,
    'reasoning',
    FILTER_FIXTURES.toolCallAndOpenWeights,
  ],
  [
    FILTER_FIXTURES.allActive,
    'toolCall',
    FILTER_FIXTURES.reasoningAndOpenWeights,
  ],
  [
    FILTER_FIXTURES.allActive,
    'openWeights',
    FILTER_FIXTURES.reasoningAndToolCall,
  ],

  // Edge case: all false, toggle one on
  [FILTER_FIXTURES.allFalse, 'reasoning', FILTER_FIXTURES.reasoningOnly],
  [FILTER_FIXTURES.allFalse, 'toolCall', FILTER_FIXTURES.toolCallOnly],
  [FILTER_FIXTURES.allFalse, 'openWeights', FILTER_FIXTURES.openWeightsOnly],
]

/**
 * Mock filter change handler that records calls
 */
export function createMockFilterChangeHandler() {
  const calls: Array<SimpleFiltersState> = []

  const handler = vi.fn((filters: SimpleFiltersState) => {
    calls.push(filters)
  })

  return {
    handler,
    calls,
    getLastCall: () => calls[calls.length - 1],
    getCallCount: () => calls.length,
    reset: () => {
      calls.length = 0
      handler.mockClear()
    },
  }
}

/**
 * Accessibility test fixtures
 */
export const A11Y_FIXTURES = {
  filterGroupRole: 'group',
  filterGroupLabel: 'Filter options',

  reasoningCheckbox: {
    id: 'filter-reasoning',
    label: 'Reasoning',
    ariaLabel: 'Filter by reasoning capability',
  },

  toolCallCheckbox: {
    id: 'filter-tool-call',
    label: 'Tool Calling',
    ariaLabel: 'Filter by tool calling capability',
  },

  openWeightsCheckbox: {
    id: 'filter-open-weights',
    label: 'Open Weights',
    ariaLabel: 'Filter by open weights availability',
  },
}
