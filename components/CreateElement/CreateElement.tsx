import * as React from 'react'

/**
 * Used to wrap every component in the playground. Subscribes to the playground
 * store to communicate with the editor and highlight the respective code.
 */
export function CreateElement({ originalType, ...props }) {
  console.log(originalType)
  return React.createElement(originalType, props)
}

/**
 * The factory function used to create elemenets in the playground.
 */
export function jsx(type, props, ...children) {
  return React.createElement(
    CreateElement,
    { originalType: type, ...props },
    ...children
  )
}
