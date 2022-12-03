import { allLinks } from 'data'

const routes = Object.values(allLinks).flat()

/**
 * Returns a sibling route if it exists.
 */
export function getSiblingRoute(startIndex: number, direction: number) {
  const siblingIndex = startIndex + direction
  const siblingRoute = routes[siblingIndex]
  if (siblingRoute?.slug === null) {
    return getSiblingRoute(siblingIndex, direction)
  }
  return siblingRoute || null
}

/**
 * Gathers the current and sibling routes from the active slug.
 */
export function getRoutes(activeSlug: string) {
  const activeRouteIndex = routes.findIndex(
    (route) => route.slug === activeSlug
  )
  return {
    activeRoute: routes[activeRouteIndex] || null,
    previousRoute: getSiblingRoute(activeRouteIndex, -1),
    nextRoute: getSiblingRoute(activeRouteIndex, 1),
  }
}
