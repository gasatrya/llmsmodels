import { ErrorComponent, useNavigate, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const navigate = useNavigate()

  const handleReset = () => {
    navigate({
      search: undefined,
    })
  }

  return (
    <div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Something went wrong
      </h1>
      <ErrorComponent error={error} />
      <div className="flex gap-2 items-center flex-wrap">
        <button
          onClick={() => {
            router.invalidate()
          }}
          className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-sm text-white uppercase font-extrabold transition-colors`}
        >
          Try Again
        </button>
        <button
          onClick={handleReset}
          className={`px-4 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-sm text-white uppercase font-extrabold transition-colors`}
        >
          Reset to Page 1
        </button>
      </div>
    </div>
  )
}
