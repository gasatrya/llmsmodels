/**
 * URL State Management for column visibility
 * Handles parsing and formatting URL parameters for column visibility state
 */

import type { ColumnVisibilityState } from '@/types/column-visibility'
import { ALL_COLUMNS, DEFAULT_VISIBLE_COLUMNS } from '@/types/column-visibility'

/**
 * Parse column visibility state from URL search parameters
 * @param params - URLSearchParams object containing query params
 * @returns ColumnVisibilityState object mapping column IDs to visibility
 *
 * Behavior:
 * - If 'cols' param is missing, returns default visibility
 * - If 'cols' param is present, parses comma-separated column IDs
 * - Invalid column IDs in URL are ignored (treated as not visible)
 */
export function getColumnVisibilityFromUrl(
  params: URLSearchParams,
): ColumnVisibilityState {
  const colsParam = params.get('cols')

  if (!colsParam) {
    // Return defaults when URL param is missing
    return Object.fromEntries(
      ALL_COLUMNS.map((col) => [
        col.id,
        DEFAULT_VISIBLE_COLUMNS.includes(col.id),
      ]),
    )
  }

  const visibleCols = colsParam.split(',')
  return Object.fromEntries(
    ALL_COLUMNS.map((col) => [col.id, visibleCols.includes(col.id)]),
  )
}

/**
 * Format column visibility state as URL query string
 * @param visibility - ColumnVisibilityState object
 * @returns URL query string parameter (e.g., "cols=select,providerName,modelName")
 *
 * Behavior:
 * - Only includes visible columns in the output
 * - Returns "cols=" with no value if no columns are visible (edge case)
 */
export function getUrlFromColumnVisibility(
  visibility: ColumnVisibilityState,
): string {
  const visibleCols = Object.entries(visibility)
    .filter(([, isVisible]) => isVisible)
    .map(([colId]) => colId)
    .join(',')

  return `cols=${visibleCols}`
}
