import { useRouter } from 'next/router'
import { getRoutes } from 'utils'

/**
 * Gathers the current and sibling routes relative to the active slug.
 */
export function useRoutes() {
  const router = useRouter()
  return getRoutes(router.asPath)
}
