import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { modelsQueryOptions } from '@/lib/models-api'
import { flattenModelsData } from '@/lib/models-transform'

export const Route = createFileRoute('/')({
  // Loader to prefetch data on server
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(modelsQueryOptions())
  },
  component: IndexPage,
})

function IndexPage() {
  // Client-side data fetching with existing queryClient
  const modelsQuery = useSuspenseQuery(modelsQueryOptions())
  const rawData = modelsQuery.data
  const flattenedData = flattenModelsData(rawData)

  return (
    <div className="container">
      <h1>AI Models Explorer</h1>
      <p>Loaded {flattenedData.length} models</p>
      {/* TODO: ModelList component will be added in Phase 4 */}
    </div>
  )
}
