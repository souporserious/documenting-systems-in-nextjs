import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export type Position = {
  lineNumber: number
  columnNumber: number
}

/**
 * TODO: Using local storage is a super hacky way to communicate between the
 * main window and preview window. This should be moved to use window postMessage.
 */
export const playgroundPositionAtom = atomWithStorage('position', null)

export const usePlaygroundPosition = () => useAtom(playgroundPositionAtom)

export const playgroundInstancePositionAtom = atomWithStorage(
  'instancePosition',
  null
)

export const usePlaygroundInstancePosition = () =>
  useAtom(playgroundInstancePositionAtom)

export const playgroundElementsAtom = atomWithStorage('elements', null)

export const usePlaygroundElements = () => useAtom(playgroundElementsAtom)
