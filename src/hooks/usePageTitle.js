import { useEffect } from 'react'

/**
 * Sets the browser tab title with the page name.
 * @param {string} title  Page title (e.g. "Dashboard")
 */
export default function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} — CultureSync` : 'CultureSync'
    return () => { document.title = prev }
  }, [title])
}
