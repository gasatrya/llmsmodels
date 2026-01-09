import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import type { FlattenedModel, ModelsApiResponse } from '@/types/models'
import { flattenModelsData } from '@/lib/models-transform'

// =============================================================================
// Constants
// =============================================================================

const MODELS_API_URL = 'https://models.dev/api.json'

// Cache timing constants
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const EDGE_CACHE_MAX_AGE = 60 // seconds
const STALE_WHILE_REVALIDATE = 86400 // 24 hours in seconds

// Response headers
const SUCCESS_HEADERS = {
  'Content-Type': 'application/json',
  'Netlify-CDN-Cache-Control': `public, max-age=${EDGE_CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}, durable`,
  'Cache-Control': `public, max-age=${EDGE_CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
} as const

const ERROR_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
} as const

// =============================================================================
// Zod Schemas for API Validation
// =============================================================================

// Cost structure schema
const CostSchema = z.object({
  input: z.number(),
  output: z.number(),
  reasoning: z.number().optional(),
  cache_read: z.number().optional(),
  cache_write: z.number().optional(),
  input_audio: z.number().optional(),
  output_audio: z.number().optional(),
})

// Limit structure schema
const LimitSchema = z.object({
  context: z.number(),
  input: z.number().optional(),
  output: z.number(),
})

// Modality type
const ModalitySchema = z.enum(['text', 'image', 'audio', 'video', 'pdf'])

// Modalities structure schema
const ModalitiesSchema = z.object({
  input: z.array(ModalitySchema),
  output: z.array(ModalitySchema),
})

// Individual model schema - made lenient to handle incomplete API data
const ModelDataSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  family: z.string().optional().default(''),
  tool_call: z.boolean().optional().default(false),
  reasoning: z.boolean().optional().default(false),
  structured_output: z.boolean().optional(),
  temperature: z.boolean().optional(),
  knowledge: z.string().optional(),
  release_date: z.string().optional().default(''),
  last_updated: z.string().optional().default(''),
  open_weights: z.boolean().optional().default(false),
  status: z.enum(['alpha', 'beta', 'deprecated']).optional(),
  cost: CostSchema.optional(),
  limit: LimitSchema.optional(),
  modalities: ModalitiesSchema.optional(),
})

// Provider schema
const ProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  npm: z.string(),
  env: z.array(z.string()),
  doc: z.string(),
  api: z.string().optional(),
  models: z.record(z.string(), ModelDataSchema),
})

// Full API response schema (dictionary of providers)
const ModelsApiResponseSchema = z.record(z.string(), ProviderSchema)

// =============================================================================
// Module-level Cache
// =============================================================================

let allModelsCache: Array<FlattenedModel> | null = null
let cacheTimestamp: number | null = null
let fetchPromise: Promise<Array<FlattenedModel>> | null = null

// =============================================================================
// Response Types
// =============================================================================

export interface GetModelsResponse {
  data: Array<FlattenedModel>
}

export interface GetModelsErrorResponse {
  error: string
}

// =============================================================================
// Data Loading with Fetch Deduplication
// =============================================================================

/**
 * Fetch and cache models data from models.dev
 * Includes fetch deduplication to prevent thundering herd problem
 */
async function loadModelsData(): Promise<Array<FlattenedModel>> {
  const now = Date.now()

  // Return cached data if still valid
  if (
    allModelsCache !== null &&
    cacheTimestamp !== null &&
    now - cacheTimestamp < CACHE_TTL_MS
  ) {
    return allModelsCache
  }

  // Deduplicate concurrent fetch requests
  if (fetchPromise) {
    return fetchPromise
  }

  fetchPromise = (async () => {
    try {
      const response = await fetch(MODELS_API_URL)

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`)
      }

      const rawData: unknown = await response.json()

      // Validate API response with Zod schema
      const parseResult = ModelsApiResponseSchema.safeParse(rawData)

      if (!parseResult.success) {
        console.error('[API Validation Error]:', parseResult.error.issues)
        throw new Error('Invalid API response structure from models.dev')
      }

      // Cast to ModelsApiResponse since Zod defaults make the inferred type slightly different
      allModelsCache = flattenModelsData(parseResult.data as ModelsApiResponse)
      cacheTimestamp = Date.now()

      return allModelsCache
    } finally {
      fetchPromise = null
    }
  })()

  return fetchPromise
}

// =============================================================================
// Server Function
// =============================================================================

/**
 * Main server function with Netlify Durable Cache
 * Returns models data with appropriate caching headers
 */
export const getModels = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const allModels = await loadModelsData()

    const responseData: GetModelsResponse = {
      data: allModels,
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: SUCCESS_HEADERS,
    })
  } catch (error) {
    console.error('[getModels Error]:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })

    const errorResponse: GetModelsErrorResponse = {
      error: 'Failed to fetch models. Please try again.',
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: ERROR_HEADERS,
    })
  }
})

// =============================================================================
// Query Options
// =============================================================================

/**
 * Query options factory for TanStack Query
 * Provides consistent query configuration across the application
 */
export const modelsQueryOptions = () =>
  queryOptions({
    queryKey: ['models'],
    queryFn: async (): Promise<GetModelsResponse> => {
      const response = await getModels()

      if (!response.ok) {
        const errorData = (await response.json()) as GetModelsErrorResponse
        throw new Error(errorData.error || 'Failed to fetch models')
      }

      return (await response.json()) as GetModelsResponse
    },
    staleTime: CACHE_TTL_MS,
  })
