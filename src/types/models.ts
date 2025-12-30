/**
 * TypeScript types for models.dev table data
 * Based on research document: docs/research/models-dev-table-columns.md
 * Represents 27 columns of model information
 */

/**
 * Supported modality types for input/output
 */
// TanStack Table type imports and exports
import type { ColumnDef } from '@tanstack/react-table'

export type Modality = 'text' | 'image' | 'audio' | 'video' | 'pdf'

/**
 * Cost structure for model API usage
 * All values are in USD per 1M tokens
 */
export interface Cost {
  input: number
  output: number
  reasoning?: number
  cache_read?: number
  cache_write?: number
  input_audio?: number
  output_audio?: number
}

/**
 * Token limit constraints for model
 */
export interface Limit {
  context: number
  input?: number
  output: number
}

/**
 * Input and output modality types supported by a model
 */
export interface Modalities {
  input: Array<Modality>
  output: Array<Modality>
}

/**
 * Raw model data structure from TOML/provider definitions
 * Represents the nested data structure before flattening
 */
export interface ModelData {
  id: string
  name: string
  family: string
  tool_call: boolean
  reasoning: boolean
  structured_output?: boolean
  temperature?: boolean
  knowledge?: string
  release_date: string
  last_updated: string
  open_weights: boolean
  status?: 'alpha' | 'beta' | 'deprecated'
  cost?: Cost
  limit?: Limit
  modalities?: Modalities
}

/**
 * Provider information structure
 */
export interface ProviderData {
  id: string
  name: string
  npm: string
  env: Array<string>
  doc: string
  api?: string
}

/**
 * Flattened model representation for table display
 * Contains all 27 columns as flat properties
 */
export interface FlattenedModel {
  // Selection (for optional comparison feature)
  selected: boolean

  // Provider information
  providerName: string
  providerId: string

  // Model information
  modelName: string
  modelFamily: string
  modelId: string

  // Capabilities
  toolCall: boolean
  reasoning: boolean
  structuredOutput?: boolean
  temperature?: boolean

  // Modalities
  inputModalities: Array<Modality>
  outputModalities: Array<Modality>

  // Costs (per 1M tokens)
  inputCost?: number
  outputCost?: number
  reasoningCost?: number
  cacheReadCost?: number
  cacheWriteCost?: number
  audioInputCost?: number
  audioOutputCost?: number

  // Limits
  contextLimit: number
  inputLimit?: number
  outputLimit: number

  // Other metadata
  weights: string
  knowledge?: string
  releaseDate: string
  lastUpdated: string
}

/**
 * API response structure for models data
 */
export interface ModelsApiResponse {
  [providerId: string]: {
    id: string
    name: string
    npm: string
    env: Array<string>
    doc: string
    api?: string
    models: {
      [modelId: string]: ModelData
    }
  }
}

/**
 * Column definition type for TanStack Table
 */
export type ModelsTableColumnDef = ColumnDef<FlattenedModel>

/**
 * Array of column definitions for TanStack Table
 */
export type ModelsTableColumnDefs = Array<ModelsTableColumnDef>

/**
 * Type guard to check if a value is a FlattenedModel
 */
export function isFlattenedModel(value: unknown): value is FlattenedModel {
  return (
    typeof value === 'object' &&
    value !== null &&
    'modelName' in value &&
    'providerName' in value
  )
}

/**
 * Type guard to validate Modality strings
 */
export function isValidModality(value: string): value is Modality {
  return ['text', 'image', 'audio', 'video', 'pdf'].includes(value)
}
