/**
 * Represents the state of simplified model filters.
 * Each property is optional to allow for an "unset" state.
 */
export interface SimpleFiltersState {
  /** Filter for models with reasoning capability */
  reasoning?: boolean
  /** Filter for models with tool calling capability */
  toolCall?: boolean
  /** Filter for models with open weights availability */
  openWeights?: boolean
}

/** Default empty filter state with all filters unset */
export const DEFAULT_SIMPLE_FILTERS: SimpleFiltersState = {
  reasoning: undefined,
  toolCall: undefined,
  openWeights: undefined,
}

/**
 * Checks if any filter is currently active (set to true).
 * @param filters - The filter state to check
 * @returns True if at least one filter is active
 */
export function hasActiveFilters(filters: SimpleFiltersState): boolean {
  return (
    filters.reasoning === true ||
    filters.toolCall === true ||
    filters.openWeights === true
  )
}
