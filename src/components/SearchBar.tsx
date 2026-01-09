import React, { useCallback, useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search models and providers...',
  className,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value)
  const debouncedValue = useDebounce(inputValue, 300)

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, value])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setInputValue('')
    onChange('')
  }, [onChange])

  return (
    <div
      className={`relative flex items-center bg-white rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${className ?? ''}`}
    >
      <Search
        className="absolute left-3 text-black w-4 h-4"
        aria-hidden="true"
        strokeWidth={3}
      />
      <input
        type="search"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-8 py-2 w-full bg-transparent text-black placeholder:text-gray-500 focus:outline-none font-bold rounded-none"
        aria-label="Search models and providers"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-2 text-black hover:bg-red-400 hover:text-white transition-colors border-l-2 border-black h-full px-2"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" aria-hidden="true" strokeWidth={3} />
        </button>
      )}
    </div>
  )
}
