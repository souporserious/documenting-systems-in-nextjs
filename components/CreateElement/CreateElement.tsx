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
    ? JSON.stringify(position) === JSON.stringify(__jsxSource)
    : false
  const playgroundProps = {
    onMouseOver: (event) => {
      event.stopPropagation()
      setPosition(__jsxSource)
    },
    onMouseOut: () => {
      setPosition(null)
    },
  }
  const outlineShadow = '0 0 0 2px #5a8fff'
  const shadows = []

  if (props.style?.boxShadow) {
    shadows.push(props.style.boxShadow)
  }

  if (active) {
    shadows.push(outlineShadow)
  }

  return React.createElement(originalType, {
    ...mergeProps(props, playgroundProps),
    style: {
      ...props.style,
      boxShadow: shadows.join(', '),
    },
  })
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
