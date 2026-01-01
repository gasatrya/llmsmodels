/**
 * Unit Tests for Filter Functions
 *
 * This file contains unit tests for filter utility functions
 * defined in src/types/filters.ts
 */

import { describe, expect, it } from 'vitest'

import {
  FILTER_FIXTURES,
  createFilterState,
  createMockFilterChangeHandler,
  generateRandomFilterState,
} from '../fixtures/filter-fixtures'

import type { SimpleFiltersState } from '@/types/filters'
import { DEFAULT_SIMPLE_FILTERS, hasActiveFilters } from '@/types/filters'
