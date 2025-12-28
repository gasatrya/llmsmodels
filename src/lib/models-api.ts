import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import type { ModelsApiResponse } from '@/types/models'

// Server function to fetch from models.dev API
export const fetchModels = createServerFn({ method: 'GET' }).handler(
  async () => {
    const response = await fetch('https://models.dev/api.json', {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    return response.json() as Promise<ModelsApiResponse>
  },
)

// Query options for client-side use
export const modelsQueryOptions = () =>
  queryOptions({
    queryKey: ['models'],
    queryFn: fetchModels,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  })
