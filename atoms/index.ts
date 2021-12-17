import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export type Position = {
  lineNumber: number
  columnNumber: number
}

// https://github.com/pmndrs/jotai/issues/882#issuecomment-990148185
const storage = {
  getItem: (key: string) => {
    return JSON.parse(localStorage.getItem(key) || '')
  },

  setItem: (key: string, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  },

  subscribe: (key: string, callback: (value) => void) => {
    const storageEventCallback = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        callback(JSON.parse(event.newValue))
      }
    }
    window.addEventListener('storage', storageEventCallback)
    return () => {
      window.removeEventListener('storage', storageEventCallback)
    }
  },
}

export const playgroundPositionAtom = atomWithStorage('position', null, storage)

export const playgroundListAtom = atomWithStorage('list', [], storage)

export const usePlaygroundPosition = () => useAtom(playgroundPositionAtom)

export const usePlaygroundList = () => useAtom(playgroundListAtom)
