/**
 * TypeScript types and constants for column visibility feature
 * Manages which columns are displayed in the models table
 */

/**
 * Column visibility state type
 * Maps column IDs to their visibility status (true = visible, false = hidden)
 */
export type ColumnVisibilityState = Record<string, boolean>

/**
 * Column definition with ID and label
 */
export interface ColumnDefinition {
  id: string
  label: string
}

/**
 * Options for column visibility management
 */
export interface ColumnVisibilityOptions {
  persistChanges?: boolean
  storageKey?: string
}

/**
 * All available columns in the models table
 * Order matches the column definitions in src/routes/index.tsx
 */
export const ALL_COLUMNS: Array<ColumnDefinition> = [
  { id: 'select', label: 'Select' },
  { id: 'providerName', label: 'Provider' },
  { id: 'modelName', label: 'Model' },
  { id: 'modelFamily', label: 'Family' },
  { id: 'providerId', label: 'Provider ID' },
  { id: 'modelId', label: 'Model ID' },
  { id: 'toolCall', label: 'Tool Call' },
  { id: 'reasoning', label: 'Reasoning' },
  { id: 'inputModalities', label: 'Input Modalities' },
  { id: 'outputModalities', label: 'Output Modalities' },
  { id: 'inputCost', label: 'Input Cost' },
  { id: 'outputCost', label: 'Output Cost' },
  { id: 'reasoningCost', label: 'Reasoning Cost' },
  { id: 'cacheReadCost', label: 'Cache Read' },
  { id: 'cacheWriteCost', label: 'Cache Write' },
  { id: 'audioInputCost', label: 'Audio Input' },
  { id: 'audioOutputCost', label: 'Audio Output' },
  { id: 'contextLimit', label: 'Context' },
  { id: 'inputLimit', label: 'Input Limit' },
  { id: 'outputLimit', label: 'Output Limit' },
  { id: 'structuredOutput', label: 'Structured Output' },
  { id: 'temperature', label: 'Temperature' },
  { id: 'weights', label: 'Weights' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'selected', label: 'Selected' },
  { id: 'releaseDate', label: 'Released' },
  { id: 'lastUpdated', label: 'Updated' },
]

/**
 * Default visible columns
 * These columns are shown by default when no user preferences exist
 */
export const DEFAULT_VISIBLE_COLUMNS: Array<string> = [
  'select',
  'providerName',
  'modelName',
  'toolCall',
  'inputCost',
  'contextLimit',
]

/**
 * Local storage key for persisting column visibility preferences
 */
export const COLUMN_VISIBILITY_STORAGE_KEY = 'column-visibility-defaults'
