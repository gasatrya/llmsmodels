import { useEffect, useState } from 'react'

/**
 * Debounces a value with a specified delay
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default: 300)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  // Validate delay parameter
  if (delay < 0) {
    throw new Error('useDebounce: delay must be a non-negative number')
  }

  if (Number.isNaN(delay)) {
    throw new Error('useDebounce: delay must be a valid number')
  }

  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
