import * as React from 'react'

export function Box({
  as: Element = 'div',
  padding,
  backgroundColor,
  children,
  ...props
}) {
  return (
    <Element
      {...props}
      style={{
        padding,
        backgroundColor,
      }}
    >
      {children}
    </Element>
  )
}
