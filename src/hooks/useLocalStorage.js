import { useState, useEffect } from 'react'

/**
 * Like useState but backed by localStorage.
 * Falls back gracefully if localStorage is unavailable.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* noop — storage full or unavailable */
    }
  }, [key, value])

  return [value, setValue]
}
