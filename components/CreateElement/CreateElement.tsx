import * as React from 'react'
import { mergeProps } from '@react-aria/utils'
import { usePlaygroundPosition } from 'atoms'

/**
 * Used to wrap every component in the playground. Subscribes to the playground
 * store to communicate with the editor and highlight the respective code.
 */
export function CreateElement({ originalType, __jsxSource, ...props }) {
  const [position, setPosition] = usePlaygroundPosition()
  const active = position
    ? position.start === __jsxSource.start && position.end === __jsxSource.end
    : false
  const playgroundProps = {
    onMouseOver: (event) => {
      event.stopPropagation()
      setPosition(__jsxSource)
    },
    onMouseOut: () => {
      setPosition(null)
    },
    style: {
      boxShadow: active ? '0 0 0 2px #00bfff' : undefined,
    },
  }
  return React.createElement(originalType, mergeProps(props, playgroundProps))
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
