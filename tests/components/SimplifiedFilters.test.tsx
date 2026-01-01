/**
 * Component Tests for SimplifiedFilters
 *
 * This file contains React component tests for the SimplifiedFilters
 * component using Testing Library.
 */

import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../utils/test-helpers'
import {
  FILTER_FIXTURES,
  createMockFilterChangeHandler,
} from '../fixtures/filter-fixtures'

import { SimplifiedFilters } from '@/components/SimplifiedFilters'

describe('SimplifiedFilters', () => {
  describe('rendering', () => {
    it('renders all three filter checkboxes', () => {
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={vi.fn()}
        />,
      )

      expect(
        screen.getByRole('checkbox', {
          name: 'Filter by reasoning capability',
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', {
          name: 'Filter by tool calling capability',
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', {
          name: 'Filter by open weights availability',
        }),
      ).toBeInTheDocument()
    })

    it('renders with correct checkbox IDs', () => {
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={vi.fn()}
        />,
      )

      const reasoningCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by reasoning capability',
      })
      expect(reasoningCheckbox).toHaveAttribute('id', 'filter-reasoning')
      expect(
        screen.getByRole('checkbox', {
          name: 'Filter by tool calling capability',
        }),
      ).toHaveAttribute('id', 'filter-tool-call')
      expect(
        screen.getByRole('checkbox', {
          name: 'Filter by open weights availability',
        }),
      ).toHaveAttribute('id', 'filter-open-weights')
    })

    it('renders with correct checkbox labels', () => {
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={vi.fn()}
        />,
      )

      expect(screen.getByText('Reasoning')).toBeInTheDocument()
      expect(screen.getByText('Tool Calling')).toBeInTheDocument()
      expect(screen.getByText('Open Weights')).toBeInTheDocument()
    })

    it('renders fieldset with correct accessibility attributes', () => {
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={vi.fn()}
        />,
      )

      expect(
        screen.getByRole('group', { name: 'Filter options' }),
      ).toBeInTheDocument()
    })

    it('applies custom className when provided', () => {
      const customClass = 'custom-filter-class'
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={vi.fn()}
          className={customClass}
        />,
      )

      const fieldset = screen.getByRole('group', { name: 'Filter options' })
      expect(fieldset).toHaveClass(customClass)
    })
  })

  describe('checkbox state', () => {
    it('shows unchecked state when filter is undefined', () => {
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={vi.fn()}
        />,
      )

      const reasoningCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by reasoning capability',
      })
      expect(reasoningCheckbox).not.toBeChecked()
    })

    it('shows checked state when filter is true', () => {
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.reasoningOnly}
          onChange={vi.fn()}
        />,
      )

      const reasoningCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by reasoning capability',
      })
      expect(reasoningCheckbox).toBeChecked()
    })

    it('shows unchecked state when filter is false', () => {
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.allFalse}
          onChange={vi.fn()}
        />,
      )

      const reasoningCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by reasoning capability',
      })
      expect(reasoningCheckbox).not.toBeChecked()
    })

    it('displays correct state for multiple active filters', () => {
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.reasoningAndToolCall}
          onChange={vi.fn()}
        />,
      )

      expect(
        screen.getByRole('checkbox', {
          name: 'Filter by reasoning capability',
        }),
      ).toBeChecked()
      expect(
        screen.getByRole('checkbox', {
          name: 'Filter by tool calling capability',
        }),
      ).toBeChecked()
      expect(
        screen.getByRole('checkbox', {
          name: 'Filter by open weights availability',
        }),
      ).not.toBeChecked()
    })
  })

  describe('user interactions', () => {
    it('calls onChange when reasoning checkbox is clicked', () => {
      const { handler, reset } = createMockFilterChangeHandler()

      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={handler}
        />,
      )

      reset()

      const reasoningCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by reasoning capability',
      })
      fireEvent.click(reasoningCheckbox)

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(FILTER_FIXTURES.reasoningOnly)
    })

    it('calls onChange when toolCall checkbox is clicked', () => {
      const { handler } = createMockFilterChangeHandler()

      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={handler}
        />,
      )

      const toolCallCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by tool calling capability',
      })
      fireEvent.click(toolCallCheckbox)

      expect(handler).toHaveBeenCalledWith(FILTER_FIXTURES.toolCallOnly)
    })

    it('calls onChange when openWeights checkbox is clicked', () => {
      const { handler } = createMockFilterChangeHandler()

      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={handler}
        />,
      )

      const openWeightsCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by open weights availability',
      })
      fireEvent.click(openWeightsCheckbox)

      expect(handler).toHaveBeenCalledWith(FILTER_FIXTURES.openWeightsOnly)
    })

    it('toggles filter state from true to undefined', () => {
      const { handler } = createMockFilterChangeHandler()

      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.reasoningOnly}
          onChange={handler}
        />,
      )

      const reasoningCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by reasoning capability',
      })
      fireEvent.click(reasoningCheckbox)

      expect(handler).toHaveBeenCalledWith(FILTER_FIXTURES.empty)
    })

    it('toggles filter state from undefined to true', () => {
      const { handler } = createMockFilterChangeHandler()

      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={handler}
        />,
      )

      const reasoningCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by reasoning capability',
      })
      fireEvent.click(reasoningCheckbox)

      expect(handler).toHaveBeenCalledWith({
        ...FILTER_FIXTURES.empty,
        reasoning: true,
      })
    })

    it('preserves other filter states when toggling one filter', () => {
      const { handler } = createMockFilterChangeHandler()

      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.reasoningOnly}
          onChange={handler}
        />,
      )

      const toolCallCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by tool calling capability',
      })
      fireEvent.click(toolCallCheckbox)

      const expectedFilters = {
        ...FILTER_FIXTURES.reasoningOnly,
        toolCall: true,
      }
      expect(handler).toHaveBeenCalledWith(expectedFilters)
    })
  })

  describe('accessibility', () => {
    it('has proper aria-labels on checkboxes', () => {
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={vi.fn()}
        />,
      )

      const reasoningInput = document.getElementById('filter-reasoning')
      expect(reasoningInput).toHaveAttribute(
        'aria-label',
        'Filter by reasoning capability',
      )

      const toolCallInput = document.getElementById('filter-tool-call')
      expect(toolCallInput).toHaveAttribute(
        'aria-label',
        'Filter by tool calling capability',
      )

      const openWeightsInput = document.getElementById('filter-open-weights')
      expect(openWeightsInput).toHaveAttribute(
        'aria-label',
        'Filter by open weights availability',
      )
    })

    it('has screen-reader-only legend text', () => {
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={vi.fn()}
        />,
      )

      const legend = screen.getByText('Filter options')
      expect(legend).toHaveClass('sr-only')
    })

    it('checkboxes have proper association with labels', () => {
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={vi.fn()}
        />,
      )

      const reasoningCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by reasoning capability',
      })
      expect(reasoningCheckbox).toBeEnabled()
    })

    it('responds to user interactions', () => {
      const { handler } = createMockFilterChangeHandler()

      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={handler}
        />,
      )

      const reasoningCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by reasoning capability',
      })

      fireEvent.click(reasoningCheckbox)

      expect(handler).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles rapid successive clicks', () => {
      const { handler, reset } = createMockFilterChangeHandler()

      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={handler}
        />,
      )

      reset()

      const reasoningCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by reasoning capability',
      })

      // Rapid clicks
      fireEvent.click(reasoningCheckbox)
      fireEvent.click(reasoningCheckbox)
      fireEvent.click(reasoningCheckbox)

      expect(handler).toHaveBeenCalledTimes(3)
    })

    it('works with empty onChange handler (no errors)', () => {
      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.empty}
          onChange={() => {}}
        />,
      )

      const reasoningCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by reasoning capability',
      })

      expect(() => fireEvent.click(reasoningCheckbox)).not.toThrow()
    })

    it('handles filter state transition from all false', () => {
      const { handler } = createMockFilterChangeHandler()

      renderWithProviders(
        <SimplifiedFilters
          filters={FILTER_FIXTURES.allFalse}
          onChange={handler}
        />,
      )

      const reasoningCheckbox = screen.getByRole('checkbox', {
        name: 'Filter by reasoning capability',
      })

      fireEvent.click(reasoningCheckbox)

      // When clicking from all-false, reasoning becomes true, others stay false
      expect(handler).toHaveBeenCalledWith({
        reasoning: true,
        toolCall: false,
        openWeights: false,
      })
    })
  })
})
