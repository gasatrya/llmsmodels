import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import type { FlattenedModel, ModelsApiResponse } from '@/types/models'
import { flattenModelsData } from '@/lib/models-transform'

// ============================================
// Module-level cache for in-memory caching
// ============================================
let allModelsCache: Array<FlattenedModel> | null = null
let cacheTimestamp: number | null = null

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// ============================================
// Zod schema for input validation
// ============================================
// No input parameters needed for fetching all models
const GetModelsSchema = z.object({})

export type GetModelsInput = z.infer<typeof GetModelsSchema>

export interface GetModelsResponse {
  data: Array<FlattenedModel>
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
// Clear cache function (for manual invalidation)
// ============================================
export function clearModelsCache(): void {
  allModelsCache = null
  cacheTimestamp = null
}

// ============================================
// Main server function with Zod validation and Netlify Durable Cache
// ============================================
export const getModels = createServerFn({ method: 'GET', response: 'raw' })
  .inputValidator(GetModelsSchema)
  .handler(async () => {
    try {
      // Load models data (from cache or fetch fresh)
      const allModels = await loadModelsData()

      const responseData: GetModelsResponse = {
        data: allModels,
      }

      // Return Response with Netlify Durable Cache headers
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Netlify Durable Cache: 60s edge, 24h stale-while-revalidate
          'Netlify-CDN-Cache-Control':
            'public, max-age=60, stale-while-revalidate=86400, durable',
          // Standard Cache-Control for browser caching
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=86400',
        },
      })
    } catch (error) {
      console.error('[getModels Error]:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      })

      // CRITICAL: Never cache error responses
      return new Response(
        JSON.stringify({ error: 'Failed to fetch models. Please try again.' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        },
      )
    }
  })

// ============================================
// Query options factory for TanStack Query
// ============================================
export const modelsQueryOptions = () =>
  queryOptions({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await getModels({ data: {} })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`)
      }

      const data = (await response.json()) as GetModelsResponse
      return data
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  })
