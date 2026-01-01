import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import Fuse from 'fuse.js'

import type { FlattenedModel, ModelsApiResponse } from '@/types/models'
import { flattenModelsData } from '@/lib/models-transform'

// ============================================
// Module-level cache for in-memory caching
// ============================================
let allModelsCache: Array<FlattenedModel> | null = null
let fuseCache: Fuse<FlattenedModel> | null = null
let cacheTimestamp: number | null = null

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// ============================================
// Zod schema for input validation
// ============================================
const GetModelsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
  search: z.string().optional().default(''),
  reasoning: z.boolean().optional(),
  toolCall: z.boolean().optional(),
  openWeights: z.boolean().optional(),
})

export type GetModelsInput = z.infer<typeof GetModelsSchema>

// ============================================
// Pagination metadata type
// ============================================
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface GetModelsResponse {
  data: Array<FlattenedModel>
  pagination: PaginationMeta
}

// ============================================
// Fetch and cache models data from models.dev
// ============================================
async function loadModelsData(): Promise<Array<FlattenedModel>> {
  const now = Date.now()

  // Return cached data if still valid
  if (
    allModelsCache !== null &&
    cacheTimestamp !== null &&
    now - cacheTimestamp < CACHE_TTL
  ) {
    return allModelsCache
  }

  // Fetch fresh data from models.dev
  const response = await fetch('https://models.dev/api.json', {
    headers: {
      Accept: 'application/json',
      'User-Agent':
        'Mozilla/5.0 (compatible; ModelsExplorer/1.0; +https://github.com)',
    },
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`)
  }

  const apiResponse: ModelsApiResponse = await response.json()
  allModelsCache = flattenModelsData(apiResponse)
  cacheTimestamp = now

  return allModelsCache
}

// ============================================
// Get or create Fuse.js instance for fuzzy search
// ============================================
function getFuseInstance(models: Array<FlattenedModel>): Fuse<FlattenedModel> {
  if (fuseCache !== null) {
    return fuseCache
  }

  fuseCache = new Fuse(models, {
    keys: [
      { name: 'modelName', weight: 2.0 },
      { name: 'providerName', weight: 1.5 },
      { name: 'modelFamily', weight: 1.0 },
    ],
    includeMatches: false,
    includeScore: false,
    ignoreLocation: true,
    threshold: 0.3,
    isCaseSensitive: false,
    minMatchCharLength: 2,
  })

  return fuseCache
}

// ============================================
// Apply search filter using Fuse.js
// ============================================
function applySearchFilter(
  models: Array<FlattenedModel>,
  searchQuery: string,
): Array<FlattenedModel> {
  // Return all models if search query is empty
  if (!searchQuery.trim()) {
    return models
  }

  // Use Fuse.js for fuzzy search
  const fuse = getFuseInstance(models)
  const results = fuse.search(searchQuery)

  return results.map((result) => result.item)
}

// ============================================
// Apply all filters (search + criteria)
// ============================================
function applyFilters(
  models: Array<FlattenedModel>,
  input: GetModelsInput,
): Array<FlattenedModel> {
  let filtered = models

  // Apply search filter
  if (input.search.trim()) {
    filtered = applySearchFilter(filtered, input.search)
  }

  // Apply reasoning filter
  if (input.reasoning === true) {
    filtered = filtered.filter((model) => model.reasoning === true)
  }

  // Apply tool call filter
  if (input.toolCall === true) {
    filtered = filtered.filter((model) => model.toolCall === true)
  }

  // Apply open weights filter
  if (input.openWeights === true) {
    filtered = filtered.filter(
      (model) => model.weights.toLowerCase() === 'open',
    )
  }

  return filtered
}

// ============================================
// Apply pagination and return metadata
// ============================================
function applyPagination(
  models: Array<FlattenedModel>,
  page: number,
  limit: number,
): { paginated: Array<FlattenedModel>; meta: PaginationMeta } {
  const total = models.length
  const totalPages = Math.ceil(total / limit)

  const start = (page - 1) * limit
  const end = page * limit
  const paginated = models.slice(start, end)

  return {
    paginated,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  }
}

// ============================================
// Clear cache function (for manual invalidation)
// ============================================
export function clearModelsCache(): void {
  allModelsCache = null
  fuseCache = null
  cacheTimestamp = null
}

// ============================================
// Main server function with Zod validation
// ============================================
export const getModels = createServerFn({ method: 'GET' })
  .inputValidator(GetModelsSchema)
  .handler(async ({ data }: { data: GetModelsInput }) => {
    try {
      // Load models data (from cache or fetch fresh)
      const allModels = await loadModelsData()

      // Apply filters
      const filteredModels = applyFilters(allModels, data)

      // Apply pagination
      const { paginated, meta } = applyPagination(
        filteredModels,
        data.page,
        data.limit,
      )

      return {
        data: paginated,
        pagination: meta,
      }
    } catch (error) {
      console.error('[getModels Error]:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        input: data,
      })

      throw new Error('Failed to fetch models. Please try again.')
    }
  })

// ============================================
// Query options factory for TanStack Query
// ============================================
export const modelsQueryOptions = (
  params: GetModelsInput = {
    page: 1,
    limit: 50,
    search: '',
    reasoning: undefined,
    toolCall: undefined,
    openWeights: undefined,
  },
) =>
  queryOptions({
    queryKey: [
      'models',
      params.page,
      params.limit,
      params.search,
      params.reasoning,
      params.toolCall,
      params.openWeights,
    ],
    queryFn: () => getModels({ data: params }),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  })
