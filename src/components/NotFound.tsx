import { useNavigate } from '@tanstack/react-router'

export function NotFound({ children }: { children?: any }) {
  const navigate = useNavigate()

  const handleReset = () => {
    navigate({
      search: undefined,
    })
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Page Not Found
      </h1>
      <div className="text-gray-600 dark:text-gray-400">
        {children || (
          <p>
            The page you are looking for does not exist or may have moved. This
            could be due to an invalid page number or outdated link.
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleReset}
          className="bg-emerald-500 text-white px-4 py-2 rounded-sm uppercase font-black text-sm hover:bg-emerald-600 transition-colors"
        >
          Reset to Page 1
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded-sm uppercase font-black text-sm hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}
