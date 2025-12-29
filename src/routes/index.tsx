import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { modelsQueryOptions } from '@/lib/api/models'
import { ModelList } from '@/components/ModelList/ModelList'

export const Route = createFileRoute('/')({
  // Loader to prefetch data on server
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(modelsQueryOptions())
  },
  component: IndexPage,
})

function IndexPage() {
  // Client-side data fetching with standardized query options
  const modelsQuery = useSuspenseQuery(modelsQueryOptions())

  const response = modelsQuery.data
  const models = response.data
  const totalCount = response.pagination.total

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Models Explorer</h1>
        <p className="text-gray-600 mt-2">
          Browse and compare {totalCount.toLocaleString()} AI models
        </p>
      </header>
      <ModelList
        models={models}
        isLoading={modelsQuery.isLoading}
        error={modelsQuery.error}
      />
    </div>
  )
}
