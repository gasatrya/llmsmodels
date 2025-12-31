import type { ColumnVisibilityState } from '@/types/column-visibility'

const COLUMN_VISIBILITY_STORAGE_KEY = 'column-visibility-defaults'

/**
 * Save column visibility preferences to localStorage
 * Only saves if running in browser environment
 * @param visibility - ColumnVisibilityState to save
 */
export function saveDefaultColumnVisibility(
  visibility: ColumnVisibilityState,
): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(
    COLUMN_VISIBILITY_STORAGE_KEY,
    JSON.stringify(visibility),
  )
}

/**
 * Load column visibility preferences from localStorage
 * Returns null if not in browser or no saved preferences
 * @returns ColumnVisibilityState or null
 */
export function loadDefaultColumnVisibility(): ColumnVisibilityState | null {
  if (typeof window === 'undefined') {
    return null
  }
  const saved = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY)
  return saved ? JSON.parse(saved) : null
}
